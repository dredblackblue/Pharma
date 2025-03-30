import { pgTable, text, serial, integer, boolean, date, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("pharmacist"),
  contactNumber: text("contact_number"),
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
