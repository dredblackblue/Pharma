import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { storage } from "./storage";

// Extend Session type to include mfaVerified property
declare module "express-session" {
  interface SessionData {
    mfaVerified?: boolean;
  }
}

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: You don't have permission to access this resource" 
      });
    }
    
    next();
  };
};

// Middleware to check if MFA is required
export const requireMFA = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  // If MFA is not enabled for this user, continue
  if (!req.user.mfaEnabled) {
    return next();
  }

  // Check if user has completed MFA verification in this session
  if (req.session.mfaVerified) {
    return next();
  }

  // MFA is required but not completed
  res.status(403).json({ 
    message: "MFA Required", 
    mfaRequired: true 
  });
};

// Generate MFA secret and QR code for a user
export const generateMFA = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `PharmaSys:${req.user.username}`
  });

  // Store the secret in the database
  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await storage.updateUser(user.id, {
    mfaSecret: secret.base32,
    mfaEnabled: false  // Not enabled until verified
  });

  // Generate QR code
  const qrcode = await QRCode.toDataURL(secret.otpauth_url!);

  res.json({
    secret: secret.base32,
    qrcode: qrcode
  });
};

// Verify MFA token
export const verifyMFA = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await storage.getUser(req.user.id);
  if (!user || !user.mfaSecret) {
    return res.status(404).json({ message: "User MFA not set up" });
  }

  // Verify the token
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).json({ message: "Invalid token" });
  }

  // If enabling MFA for the first time
  if (!user.mfaEnabled) {
    await storage.updateUser(user.id, {
      mfaEnabled: true
    });
  }

  // Mark the session as MFA verified
  if (req.session) {
    req.session.mfaVerified = true;
  }

  res.json({ 
    success: true,
    message: "MFA verification successful"
  });
};

// Enable/disable MFA
export const toggleMFA = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const { enabled } = req.body;
  
  // If disabling MFA
  if (enabled === false) {
    await storage.updateUser(req.user.id, {
      mfaEnabled: false,
      mfaSecret: null
    });
    
    // Clear MFA verification in session
    if (req.session) {
      delete req.session.mfaVerified;
    }
    
    return res.json({ 
      success: true,
      message: "MFA disabled successfully"
    });
  }
  
  // If enabling, user should go through the generate and verify flow
  res.status(400).json({ 
    message: "To enable MFA, use the generateMFA and verifyMFA endpoints"
  });
};

// Design Patterns
// 1. Factory Pattern: Makes a factory of different authorization types
export class AuthorizationFactory {
  static createRoleAuth(allowedRoles: string[]) {
    return requireRole(allowedRoles);
  }

  static createMFAAuth() {
    return requireMFA;
  }
}

// 2. Observer Pattern: For notification system
interface Observer {
  update(data: any): void;
}

class AuthenticationSubject {
  private observers: Observer[] = [];

  addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: any) {
    this.observers.forEach(observer => observer.update(data));
  }
}

export class LoginObserver implements Observer {
  update(data: any) {
    console.log(`Login detected for user: ${data.username} with IP: ${data.ip}`);
    // In a real implementation, this could log to a database, send an email, etc.
  }
}

export class MFAObserver implements Observer {
  update(data: any) {
    console.log(`MFA action for user: ${data.username}, action: ${data.action}`);
    // This could trigger alerts for suspicious MFA activity
  }
}

export const authSubject = new AuthenticationSubject();