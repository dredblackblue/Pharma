package com.pharma.pdms.controllers;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.services.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
    private final MedicineService medicineService;
    
    @Autowired
    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }
    
    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        return medicineService.getMedicineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.searchMedicinesByName(name));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Medicine>> getMedicinesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(medicineService.getMedicinesByCategory(category));
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<Medicine>> getLowStockMedicines() {
        return ResponseEntity.ok(medicineService.getLowStockMedicines());
    }
    
    @GetMapping("/expiring")
    public ResponseEntity<List<Medicine>> getExpiringMedicines(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getExpiringMedicines(days));
    }
    
    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@RequestBody Medicine medicine) {
        Medicine createdMedicine = medicineService.createMedicine(medicine);
        return new ResponseEntity<>(createdMedicine, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicine) {
        return medicineService.updateMedicine(id, medicine)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        boolean deleted = medicineService.deleteMedicine(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Medicine> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> stockUpdate) {
        
        Integer quantity = stockUpdate.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return medicineService.updateStock(id, quantity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/inventory-value")
    public ResponseEntity<Map<String, Double>> getInventoryValue() {
        Double value = medicineService.calculateTotalInventoryValue();
        return ResponseEntity.ok(Map.of("value", value != null ? value : 0.0));
    }
}