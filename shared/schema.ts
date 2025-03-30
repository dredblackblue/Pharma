import { pgTable, text, serial, integer, boolean, date, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with role-based access control and MFA
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("pharmacist"), // admin, pharmacist, doctor, patient
  contactNumber: text("contact_number"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  emailMfaEnabled: boolean("email_mfa_enabled").default(false),
  emailMfaCode: text("email_mfa_code"),
  emailMfaExpiry: timestamp("email_mfa_expiry"),
  created_at: timestamp("created_at").defaultNow()
});

// Medicine model
export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  manufacturer: text("manufacturer"),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  reorderLevel: integer("reorder_level").default(10),
  supplierId: integer("supplier_id"),
  created_at: timestamp("created_at").defaultNow()
});

// Patient model
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  contactNumber: text("contact_number"),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender"),
  allergies: text("allergies"),
  created_at: timestamp("created_at").defaultNow()
});

// Doctor model
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialization: text("specialization"),
  licenseNumber: text("license_number").notNull(),
  contactNumber: text("contact_number"),
  email: text("email"),
  created_at: timestamp("created_at").defaultNow()
});

// Prescription model
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  issueDate: date("issue_date").notNull().defaultNow(),
  expiryDate: date("expiry_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow()
});

// Prescription items model
export const prescriptionItems = pgTable("prescription_items", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull(),
  medicineId: integer("medicine_id").notNull(),
  quantity: integer("quantity").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: text("duration"),
  instructions: text("instructions"),
  created_at: timestamp("created_at").defaultNow()
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  prescriptionId: integer("prescription_id"),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow()
});

// Transaction items model
export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  medicineId: integer("medicine_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow()
});

// Supplier model
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  contactNumber: text("contact_number"),
  address: text("address"),
  created_at: timestamp("created_at").defaultNow()
});

// Orders model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDeliveryDate: date("expected_delivery_date"),
  status: text("status").notNull().default("pending"), // pending, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, partial, paid
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow()
});

// Order items model
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  medicineId: integer("medicine_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow()
});

// Define insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true, created_at: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, created_at: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, created_at: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, created_at: true });
export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({ id: true, created_at: true });

// Custom transaction schema with flexible date handling
export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, created_at: true })
  .extend({
    // Accept string or Date object for transactionDate
    transactionDate: z.union([z.string(), z.date()]).transform(val => 
      typeof val === 'string' ? new Date(val) : val
    ),
    // Accept string or number for totalAmount
    totalAmount: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    )
  });

export const insertTransactionItemSchema = createInsertSchema(transactionItems)
  .omit({ id: true, created_at: true })
  .extend({
    // Accept string or number for unitPrice
    unitPrice: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    )
  });

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, created_at: true });

// Order schemas with flexible date handling
export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, created_at: true })
  .extend({
    // Accept string or Date object for orderDate
    orderDate: z.union([z.string(), z.date()]).transform(val => 
      typeof val === 'string' ? new Date(val) : val
    ),
    // Accept string or Date object for expectedDeliveryDate
    expectedDeliveryDate: z.union([z.string(), z.date(), z.null()]).transform(val => 
      typeof val === 'string' ? new Date(val) : val
    ).optional(),
    // Accept string or number for totalAmount
    totalAmount: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    )
  });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true, created_at: true })
  .extend({
    // Accept string or number for unitPrice
    unitPrice: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    )
  });

// Define types using z.infer
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Define select types
export type User = typeof users.$inferSelect;
export type Medicine = typeof medicines.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
