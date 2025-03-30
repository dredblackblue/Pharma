import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertMedicineSchema, 
  insertPatientSchema, 
  insertDoctorSchema,
  insertPrescriptionSchema,
  insertPrescriptionItemSchema,
  insertTransactionSchema,
  insertTransactionItemSchema,
  insertSupplierSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const medicines = await storage.getAllMedicines();
    const lowStock = await storage.getLowStockMedicines();
    const prescriptions = await storage.getAllPrescriptions();
    const transactions = await storage.getAllTransactions();
    
    // Calculate total revenue for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(
      trx => new Date(trx.transactionDate) >= today
    );
    const todayRevenue = todayTransactions.reduce(
      (sum, trx) => sum + Number(trx.totalAmount), 
      0
    );
    
    // Get prescriptions from today
    const todayPrescriptions = prescriptions.filter(
      prx => new Date(prx.issueDate).toDateString() === today.toDateString()
    );
    
    res.json({
      totalInventory: medicines.length,
      inventoryGrowth: 12, // Mock data as we can't calculate this
      lowStock: lowStock.length,
      lowStockIncrease: 5, // Mock data as we can't calculate this
      prescriptionsToday: todayPrescriptions.length,
      prescriptionsGrowth: 8, // Mock data as we can't calculate this
      todayRevenue: todayRevenue.toFixed(2),
      revenueGrowth: 18 // Mock data as we can't calculate this
    });
  });
  
  app.get("/api/dashboard/expiring-medications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const expiringMeds = await storage.getExpiringMedicines(30);
    res.json(expiringMeds);
  });
  
  app.get("/api/dashboard/recent-transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const recentTransactions = await storage.getRecentTransactions(5);
    
    // For each transaction, get the patient details
    const transactionsWithPatients = await Promise.all(
      recentTransactions.map(async trx => {
        const patient = await storage.getPatient(trx.patientId);
        return {
          ...trx,
          patient: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
        };
      })
    );
    
    res.json(transactionsWithPatients);
  });
  
  app.get("/api/dashboard/recent-patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const patients = await storage.getAllPatients();
    
    // Sort by created_at and take the most recent
    const recentPatients = patients
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
    
    res.json(recentPatients);
  });

  // Medicine routes
  app.get("/api/medicines", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const medicines = await storage.getAllMedicines();
    res.json(medicines);
  });
  
  app.get("/api/medicines/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const medicine = await storage.getMedicine(id);
    
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    
    res.json(medicine);
  });
  
  app.post("/api/medicines", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validatedData);
      res.status(201).json(medicine);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/medicines/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMedicineSchema.partial().parse(req.body);
      const updatedMedicine = await storage.updateMedicine(id, validatedData);
      
      if (!updatedMedicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      
      res.json(updatedMedicine);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/medicines/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteMedicine(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    
    res.status(204).end();
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const patients = await storage.getAllPatients();
    res.json(patients);
  });
  
  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const patient = await storage.getPatient(id);
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  });
  
  app.post("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const updatedPatient = await storage.updatePatient(id, validatedData);
      
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(updatedPatient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const deleted = await storage.deletePatient(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.status(204).end();
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const doctors = await storage.getAllDoctors();
    res.json(doctors);
  });
  
  app.get("/api/doctors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const doctor = await storage.getDoctor(id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.json(doctor);
  });
  
  app.post("/api/doctors", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(validatedData);
      res.status(201).json(doctor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/doctors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDoctorSchema.partial().parse(req.body);
      const updatedDoctor = await storage.updateDoctor(id, validatedData);
      
      if (!updatedDoctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json(updatedDoctor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/doctors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteDoctor(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.status(204).end();
  });

  // Prescription routes
  app.get("/api/prescriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const prescriptions = await storage.getAllPrescriptions();
    res.json(prescriptions);
  });
  
  app.get("/api/prescriptions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const prescription = await storage.getPrescription(id);
    
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    
    const items = await storage.getPrescriptionItems(id);
    
    res.json({
      ...prescription,
      items
    });
  });
  
  app.get("/api/patients/:patientId/prescriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const patientId = parseInt(req.params.patientId);
    const prescriptions = await storage.getPrescriptionsByPatient(patientId);
    
    res.json(prescriptions);
  });
  
  app.post("/api/prescriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { items, ...prescriptionData } = req.body;
      
      const validatedPrescriptionData = insertPrescriptionSchema.parse(prescriptionData);
      const prescription = await storage.createPrescription(validatedPrescriptionData);
      
      // Add prescription items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertPrescriptionItemSchema.parse({
            ...item,
            prescriptionId: prescription.id
          });
          await storage.addPrescriptionItem(validatedItem);
        }
      }
      
      const createdItems = await storage.getPrescriptionItems(prescription.id);
      
      res.status(201).json({
        ...prescription,
        items: createdItems
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });
  
  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const transaction = await storage.getTransaction(id);
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    const items = await storage.getTransactionItems(id);
    
    res.json({
      ...transaction,
      items
    });
  });
  
  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { items, ...transactionData } = req.body;
      
      const validatedTransactionData = insertTransactionSchema.parse(transactionData);
      const transaction = await storage.createTransaction(validatedTransactionData);
      
      // Add transaction items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertTransactionItemSchema.parse({
            ...item,
            transactionId: transaction.id
          });
          await storage.addTransactionItem(validatedItem);
          
          // Update medicine stock quantity
          const medicine = await storage.getMedicine(item.medicineId);
          if (medicine) {
            const newQuantity = medicine.stockQuantity - item.quantity;
            await storage.updateMedicine(medicine.id, { stockQuantity: newQuantity >= 0 ? newQuantity : 0 });
          }
        }
      }
      
      const createdItems = await storage.getTransactionItems(transaction.id);
      
      res.status(201).json({
        ...transaction,
        items: createdItems
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const suppliers = await storage.getAllSuppliers();
    res.json(suppliers);
  });
  
  app.get("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const supplier = await storage.getSupplier(id);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    res.json(supplier);
  });
  
  app.post("/api/suppliers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const updatedSupplier = await storage.updateSupplier(id, validatedData);
      
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/suppliers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSupplier(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    res.status(204).end();
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const orders = await storage.getAllOrders();
    res.json(orders);
  });
  
  app.get("/api/orders/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const recentOrders = await storage.getRecentOrders(5);
    
    // For each order, get the supplier details
    const ordersWithSuppliers = await Promise.all(
      recentOrders.map(async order => {
        const supplier = await storage.getSupplier(order.supplierId);
        return {
          ...order,
          supplier: supplier ? supplier.name : 'Unknown'
        };
      })
    );
    
    res.json(ordersWithSuppliers);
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const items = await storage.getOrderItems(id);
    const supplier = await storage.getSupplier(order.supplierId);
    
    res.json({
      ...order,
      items,
      supplier: supplier ? supplier.name : 'Unknown'
    });
  });
  
  app.get("/api/suppliers/:supplierId/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const supplierId = parseInt(req.params.supplierId);
    const orders = await storage.getOrdersBySupplier(supplierId);
    
    res.json(orders);
  });
  
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { items, ...orderData } = req.body;
      
      const validatedOrderData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrderData);
      
      // Add order items if provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          await storage.addOrderItem(validatedItem);
        }
      }
      
      const createdItems = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items: createdItems
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const updatedOrder = await storage.updateOrder(id, validatedData);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // If status is changed to "delivered", update medicine stock quantities
      if (validatedData.status === "delivered") {
        const items = await storage.getOrderItems(id);
        
        for (const item of items) {
          const medicine = await storage.getMedicine(item.medicineId);
          if (medicine) {
            const newQuantity = medicine.stockQuantity + item.quantity;
            await storage.updateMedicine(medicine.id, { stockQuantity: newQuantity });
          }
        }
      }
      
      res.json(updatedOrder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteOrder(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(204).end();
  });
  
  app.post("/api/orders/:orderId/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const validatedItem = insertOrderItemSchema.parse({
        ...req.body,
        orderId
      });
      
      const item = await storage.addOrderItem(validatedItem);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/orders/:orderId/items/:itemId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const itemId = parseInt(req.params.itemId);
    const deleted = await storage.deleteOrderItem(itemId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Order item not found" });
    }
    
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
