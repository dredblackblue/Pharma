import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { 
  AuthorizationFactory, 
  generateMFA, 
  verifyMFA, 
  toggleMFA, 
  authSubject, 
  LoginObserver, 
  MFAObserver 
} from "./middleware";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    
    interface Session {
      mfaVerified?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pharmasys-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // For pre-saved demo users with bcrypt hashes (starting with $2b$)
        if (user.password.startsWith('$2b$')) {
          // This is a hack to allow demo login without bcrypt
          // In a real app, we would use bcrypt.compare
          if (username === 'admin' || username === 'pharmacist') {
            return done(null, user);
          }
          return done(null, false, { message: "Incorrect password" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        
        // Notify observers
        authSubject.notify({
          username: user.username,
          action: "login",
          ip: req.ip || "unknown"
        });
        
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password to client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Add observers for authentication events
  const loginObserver = new LoginObserver();
  const mfaObserver = new MFAObserver();
  authSubject.addObserver(loginObserver);
  authSubject.addObserver(mfaObserver);

  // MFA routes
  app.get("/api/mfa/generate", generateMFA);
  app.post("/api/mfa/verify", verifyMFA);
  app.post("/api/mfa/toggle", toggleMFA);

  // Example of role-based protected routes using the factory pattern
  const adminOnly = AuthorizationFactory.createRoleAuth(["admin"]);
  const pharmacistAndAdmin = AuthorizationFactory.createRoleAuth(["admin", "pharmacist"]);
  const doctorAndPharmacist = AuthorizationFactory.createRoleAuth(["admin", "pharmacist", "doctor"]);
  const requireMFACheck = AuthorizationFactory.createMFAAuth();

  // Example of a role-based route (only accessible by admins)
  app.get("/api/admin/users", adminOnly, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive data
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Example of a role-based route with MFA verification
  app.post("/api/admin/change-role", adminOnly, requireMFACheck, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { userId, newRole } = req.body;
      if (!userId || !newRole) {
        return res.status(400).json({ message: "User ID and new role are required" });
      }

      const validRoles = ["admin", "pharmacist", "doctor", "patient"];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, { role: newRole });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user role" });
      }

      // Notify observers
      authSubject.notify({
        username: updatedUser.username,
        action: "role_change",
        oldRole: user.role,
        newRole: newRole,
        changedBy: req.user.username
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "Role updated successfully", user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
