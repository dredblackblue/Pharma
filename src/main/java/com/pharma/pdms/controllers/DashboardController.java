package com.pharma.pdms.controllers;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.models.Patient;
import com.pharma.pdms.models.Transaction;
import com.pharma.pdms.services.MedicineService;
import com.pharma.pdms.services.PatientService;
import com.pharma.pdms.services.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for dashboard-related endpoints
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final MedicineService medicineService;
    private final PatientService patientService;
    private final PrescriptionService prescriptionService;
    
    @Autowired
    public DashboardController(
            MedicineService medicineService,
            PatientService patientService,
            PrescriptionService prescriptionService) {
        this.medicineService = medicineService;
        this.patientService = patientService;
        this.prescriptionService = prescriptionService;
    }
    
    /**
     * Get overview statistics for the dashboard
     * @return Map containing statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        double totalInventoryValue = medicineService.calculateTotalInventoryValue();
        int inventoryGrowth = 12; // Placeholder for inventory growth percentage
        
        int lowStockCount = medicineService.getLowStockMedicines().size();
        int lowStockIncrease = 5; // Placeholder for low stock increase percentage
        
        int prescriptionsToday = prescriptionService.getCountForToday();
        int prescriptionsGrowth = 8; // Placeholder for prescriptions growth percentage
        
        double todayRevenue = 2500.00; // Placeholder for today's revenue
        int revenueGrowth = 15; // Placeholder for revenue growth percentage
        
        // Format currency values
        String formattedRevenue = String.format("$%.2f", todayRevenue);
        
        stats.put("totalInventory", totalInventoryValue);
        stats.put("inventoryGrowth", inventoryGrowth);
        stats.put("lowStock", lowStockCount);
        stats.put("lowStockIncrease", lowStockIncrease);
        stats.put("prescriptionsToday", prescriptionsToday);
        stats.put("prescriptionsGrowth", prescriptionsGrowth);
        stats.put("todayRevenue", formattedRevenue);
        stats.put("revenueGrowth", revenueGrowth);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get a list of medicines that are expiring soon
     * @param days Number of days to consider for expiry (default: 30)
     * @return List of expiring medicines
     */
    @GetMapping("/expiring-medications")
    public ResponseEntity<List<Medicine>> getExpiringMedications(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getExpiringMedicines(days));
    }
    
    /**
     * Get a list of recent patients
     * @param limit Maximum number of patients to return (default: 5)
     * @return List of recent patients
     */
    @GetMapping("/recent-patients")
    public ResponseEntity<List<Patient>> getRecentPatients(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(patientService.getRecentPatients());
    }
    
    /**
     * Get a list of low stock medicines
     * @param threshold Stock level below which medicines are considered low stock (default: 10)
     * @return List of low stock medicines
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> getLowStockMedicines(
            @RequestParam(defaultValue = "10") int threshold) {
        return ResponseEntity.ok(medicineService.getLowStockMedicines());
    }
    
    /**
     * Get a list of recent transactions
     * @param limit Maximum number of transactions to return (default: 5)
     * @return List of recent transactions
     */
    @GetMapping("/recent-transactions")
    public ResponseEntity<List<Transaction>> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit) {
        // This should be implemented when TransactionService is available
        return ResponseEntity.ok(List.of()); // Return empty list for now
    }
}