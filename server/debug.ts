// Debug utility to help us understand the schema validation errors
import { insertTransactionSchema, insertTransactionItemSchema } from "@shared/schema";
import { z } from "zod";

// Sample transaction data that's failing
const sampleTransaction = {
  patientId: 1,
  prescriptionId: 1,
  transactionDate: "2025-03-30T00:00:00.000Z",
  totalAmount: "0.1", // This might be the issue - string vs number
  paymentMethod: "Cash",
  status: "Completed",
  notes: "test"
};

// Sample transaction item that's failing
const sampleItem = {
  medicineId: 1,
  quantity: 1,
  unitPrice: "0.1" // This might be the issue - string vs number
};

function debugValidation() {
  console.log("===== DEBUGGING TRANSACTION SCHEMA =====");
  
  try {
    // Validate the transaction schema
    const validatedTransaction = insertTransactionSchema.parse(sampleTransaction);
    console.log("Transaction validation passed:", validatedTransaction);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Transaction validation errors:", JSON.stringify(err.errors, null, 2));
    } else {
      console.error("Unknown error:", err);
    }
  }
  
  try {
    // Validate the transaction item schema
    const validatedItem = insertTransactionItemSchema.parse({
      ...sampleItem,
      transactionId: 1
    });
    console.log("Transaction item validation passed:", validatedItem);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Transaction item validation errors:", JSON.stringify(err.errors, null, 2));
    } else {
      console.error("Unknown error:", err);
    }
  }
  
  console.log("===== END DEBUGGING =====");
}

// Run the debug function
debugValidation();