package com.pharma.pdms.controllers;

import com.pharma.pdms.models.Prescription;
import com.pharma.pdms.models.PrescriptionItem;
import com.pharma.pdms.services.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    
    @Autowired
    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }
    
    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        return prescriptionService.getPrescriptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }
    
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(doctorId));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<Prescription>> getPrescriptionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDateRange(startDate, endDate));
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<Prescription>> getRecentPrescriptions(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(prescriptionService.getRecentPrescriptions(limit));
    }
    
    @GetMapping("/count/today")
    public ResponseEntity<Map<String, Integer>> getPrescriptionsCountForToday() {
        return ResponseEntity.ok(Map.of("count", prescriptionService.getCountForToday()));
    }
    
    @GetMapping("/{prescriptionId}/items")
    public ResponseEntity<List<PrescriptionItem>> getPrescriptionItems(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionItems(prescriptionId));
    }
    
    @PostMapping
    public ResponseEntity<Prescription> createPrescription(@RequestBody Prescription prescription) {
        Prescription createdPrescription = prescriptionService.createPrescription(prescription);
        return new ResponseEntity<>(createdPrescription, HttpStatus.CREATED);
    }
    
    @PostMapping("/items")
    public ResponseEntity<PrescriptionItem> addPrescriptionItem(@RequestBody PrescriptionItem item) {
        PrescriptionItem createdItem = prescriptionService.addPrescriptionItem(item);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(
            @PathVariable Long id, 
            @RequestBody Prescription prescription) {
        return prescriptionService.updatePrescription(id, prescription)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        boolean deleted = prescriptionService.deletePrescription(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}