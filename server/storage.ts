import { users, type User, type InsertUser } from "@shared/schema";
import { medicines, type Medicine, type InsertMedicine } from "@shared/schema";
import { patients, type Patient, type InsertPatient } from "@shared/schema";
import { doctors, type Doctor, type InsertDoctor } from "@shared/schema";
import { prescriptions, type Prescription, type InsertPrescription } from "@shared/schema";
import { prescriptionItems, type PrescriptionItem, type InsertPrescriptionItem } from "@shared/schema";
import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { transactionItems, type TransactionItem, type InsertTransactionItem } from "@shared/schema";
import { suppliers, type Supplier, type InsertSupplier } from "@shared/schema";
import { orders, type Order, type InsertOrder } from "@shared/schema";
import { orderItems, type OrderItem, type InsertOrderItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Medicine methods
  getMedicine(id: number): Promise<Medicine | undefined>;
  getAllMedicines(): Promise<Medicine[]>;
  getLowStockMedicines(threshold?: number): Promise<Medicine[]>;
  getExpiringMedicines(days?: number): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: number): Promise<boolean>;
  
  // Patient methods
  getPatient(id: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  
  // Doctor methods
  getDoctor(id: number): Promise<Doctor | undefined>;
  getAllDoctors(): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: number): Promise<boolean>;
  
  // Prescription methods
  getPrescription(id: number): Promise<Prescription | undefined>;
  getAllPrescriptions(): Promise<Prescription[]>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  addPrescriptionItem(item: InsertPrescriptionItem): Promise<PrescriptionItem>;
  getPrescriptionItems(prescriptionId: number): Promise<PrescriptionItem[]>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  addTransactionItem(item: InsertTransactionItem): Promise<TransactionItem>;
  getTransactionItems(transactionId: number): Promise<TransactionItem[]>;
  
  // Supplier methods
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersBySupplier(supplierId: number): Promise<Order[]>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  deleteOrderItem(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medicines: Map<number, Medicine>;
  private patients: Map<number, Patient>;
  private doctors: Map<number, Doctor>;
  private prescriptions: Map<number, Prescription>;
  private prescriptionItems: Map<number, PrescriptionItem>;
  private transactions: Map<number, Transaction>;
  private transactionItems: Map<number, TransactionItem>;
  private suppliers: Map<number, Supplier>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private currentUserId: number;
  private currentMedicineId: number;
  private currentPatientId: number;
  private currentDoctorId: number;
  private currentPrescriptionId: number;
  private currentPrescriptionItemId: number;
  private currentTransactionId: number;
  private currentTransactionItemId: number;
  private currentSupplierId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  
  public sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.medicines = new Map();
    this.patients = new Map();
    this.doctors = new Map();
    this.prescriptions = new Map();
    this.prescriptionItems = new Map();
    this.transactions = new Map();
    this.transactionItems = new Map();
    this.suppliers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.currentUserId = 1;
    this.currentMedicineId = 1;
    this.currentPatientId = 1;
    this.currentDoctorId = 1;
    this.currentPrescriptionId = 1;
    this.currentPrescriptionItemId = 1;
    this.currentTransactionId = 1;
    this.currentTransactionItemId = 1;
    this.currentSupplierId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    // Ensure role is provided, default to "pharmacist" if not
    const userWithRole = {
      ...insertUser,
      role: insertUser.role || "pharmacist"
    };
    const user: User = { ...userWithRole, id, created_at: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Medicine methods
  async getMedicine(id: number): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }
  
  async getAllMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }
  
  async getLowStockMedicines(threshold = 10): Promise<Medicine[]> {
    return Array.from(this.medicines.values())
      .filter(medicine => medicine.stockQuantity <= threshold);
  }
  
  async getExpiringMedicines(days = 30): Promise<Medicine[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return Array.from(this.medicines.values())
      .filter(medicine => {
        const expiryDate = new Date(medicine.expiryDate);
        return expiryDate <= futureDate && expiryDate >= today;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }
  
  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = this.currentMedicineId++;
    const medicine: Medicine = { ...insertMedicine, id, created_at: new Date() };
    this.medicines.set(id, medicine);
    return medicine;
  }
  
  async updateMedicine(id: number, medicineUpdate: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const medicine = this.medicines.get(id);
    if (!medicine) return undefined;
    
    const updatedMedicine = { ...medicine, ...medicineUpdate };
    this.medicines.set(id, updatedMedicine);
    return updatedMedicine;
  }
  
  async deleteMedicine(id: number): Promise<boolean> {
    return this.medicines.delete(id);
  }
  
  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { ...insertPatient, id, created_at: new Date() };
    this.patients.set(id, patient);
    return patient;
  }
  
  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...patientUpdate };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }
  
  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }
  
  // Doctor methods
  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }
  
  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }
  
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = { ...insertDoctor, id, created_at: new Date() };
    this.doctors.set(id, doctor);
    return doctor;
  }
  
  async updateDoctor(id: number, doctorUpdate: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const updatedDoctor = { ...doctor, ...doctorUpdate };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }
  
  async deleteDoctor(id: number): Promise<boolean> {
    return this.doctors.delete(id);
  }
  
  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }
  
  async getAllPrescriptions(): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values());
  }
  
  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values())
      .filter(prescription => prescription.patientId === patientId);
  }
  
  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentPrescriptionId++;
    const prescription: Prescription = { ...insertPrescription, id, created_at: new Date() };
    this.prescriptions.set(id, prescription);
    return prescription;
  }
  
  async addPrescriptionItem(insertItem: InsertPrescriptionItem): Promise<PrescriptionItem> {
    const id = this.currentPrescriptionItemId++;
    const item: PrescriptionItem = { ...insertItem, id, created_at: new Date() };
    this.prescriptionItems.set(id, item);
    return item;
  }
  
  async getPrescriptionItems(prescriptionId: number): Promise<PrescriptionItem[]> {
    return Array.from(this.prescriptionItems.values())
      .filter(item => item.prescriptionId === prescriptionId);
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getRecentTransactions(limit = 5): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { ...insertTransaction, id, created_at: new Date() };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async addTransactionItem(insertItem: InsertTransactionItem): Promise<TransactionItem> {
    const id = this.currentTransactionItemId++;
    const item: TransactionItem = { ...insertItem, id, created_at: new Date() };
    this.transactionItems.set(id, item);
    return item;
  }
  
  async getTransactionItems(transactionId: number): Promise<TransactionItem[]> {
    return Array.from(this.transactionItems.values())
      .filter(item => item.transactionId === transactionId);
  }
  
  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentSupplierId++;
    const supplier: Supplier = { ...insertSupplier, id, created_at: new Date() };
    this.suppliers.set(id, supplier);
    return supplier;
  }
  
  async updateSupplier(id: number, supplierUpdate: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...supplierUpdate };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrdersBySupplier(supplierId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.supplierId === supplierId);
  }
  
  async getRecentOrders(limit = 5): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, limit);
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { ...insertOrder, id, created_at: new Date() };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: number, orderUpdate: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...orderUpdate };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async deleteOrder(id: number): Promise<boolean> {
    // Also delete associated order items
    const orderItems = await this.getOrderItems(id);
    for (const item of orderItems) {
      this.orderItems.delete(item.id);
    }
    return this.orders.delete(id);
  }
  
  async addOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const item: OrderItem = { ...insertItem, id, created_at: new Date() };
    this.orderItems.set(id, item);
    return item;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  async deleteOrderItem(id: number): Promise<boolean> {
    return this.orderItems.delete(id);
  }
  
  // Initialize demo data
  private initializeDemoData() {
    // Add an admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$dHhQhGi9B9PC7YK2Uv0lQeC0hSvUr7MUzG/ZwgQsjU1CTrIkRx.Ae", // password: admin123
      name: "Admin User",
      email: "admin@pharmasys.com",
      role: "admin",
      contactNumber: "555-1234"
    });
    
    // Add a pharmacist user
    this.createUser({
      username: "pharmacist",
      password: "$2b$10$dHhQhGi9B9PC7YK2Uv0lQeC0hSvUr7MUzG/ZwgQsjU1CTrIkRx.Ae", // password: admin123
      name: "John Smith",
      email: "john@pharmasys.com",
      role: "pharmacist",
      contactNumber: "555-5678"
    });
  }
}

export const storage = new MemStorage();
