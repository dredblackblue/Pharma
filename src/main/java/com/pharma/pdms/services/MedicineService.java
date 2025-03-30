package com.pharma.pdms.services;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.repositories.MedicineRepository;
import com.pharma.pdms.utils.observer.MedicineInventorySubject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for Medicine-related operations
 * Uses Observer pattern to notify about inventory changes
 */
@Service
public class MedicineService {
    private final MedicineRepository medicineRepository;
    private final MedicineInventorySubject inventorySubject;
    
    @Autowired
    public MedicineService(MedicineRepository medicineRepository, 
                          MedicineInventorySubject inventorySubject) {
        this.medicineRepository = medicineRepository;
        this.inventorySubject = inventorySubject;
    }
    
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }
    
    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }
    
    public List<Medicine> searchMedicinesByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Medicine> getMedicinesByCategory(String category) {
        return medicineRepository.findByCategory(category);
    }
    
    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines();
    }
    
    public List<Medicine> getExpiringMedicines(int days) {
        LocalDate thresholdDate = LocalDate.now().plusDays(days);
        return medicineRepository.findMedicinesExpiringBefore(thresholdDate);
    }
    
    @Transactional
    public Medicine createMedicine(Medicine medicine) {
        Medicine savedMedicine = medicineRepository.save(medicine);
        // Trigger observers for the newly added medicine
        inventorySubject.stockUpdated(savedMedicine);
        return savedMedicine;
    }
    
    @Transactional
    public Optional<Medicine> updateMedicine(Long id, Medicine medicineDetails) {
        return medicineRepository.findById(id)
            .map(existingMedicine -> {
                // Update only the non-null properties
                if (medicineDetails.getName() != null) {
                    existingMedicine.setName(medicineDetails.getName());
                }
                if (medicineDetails.getDescription() != null) {
                    existingMedicine.setDescription(medicineDetails.getDescription());
                }
                if (medicineDetails.getManufacturer() != null) {
                    existingMedicine.setManufacturer(medicineDetails.getManufacturer());
                }
                if (medicineDetails.getCategory() != null) {
                    existingMedicine.setCategory(medicineDetails.getCategory());
                }
                if (medicineDetails.getPrice() != null) {
                    existingMedicine.setPrice(medicineDetails.getPrice());
                }
                if (medicineDetails.getStock() != null) {
                    existingMedicine.setStock(medicineDetails.getStock());
                }
                if (medicineDetails.getExpiryDate() != null) {
                    existingMedicine.setExpiryDate(medicineDetails.getExpiryDate());
                }
                if (medicineDetails.getReorderLevel() != null) {
                    existingMedicine.setReorderLevel(medicineDetails.getReorderLevel());
                }
                
                Medicine updatedMedicine = medicineRepository.save(existingMedicine);
                
                // Notify observers about the stock change
                inventorySubject.stockUpdated(updatedMedicine);
                
                return updatedMedicine;
            });
    }
    
    @Transactional
    public boolean deleteMedicine(Long id) {
        return medicineRepository.findById(id)
            .map(medicine -> {
                medicineRepository.delete(medicine);
                return true;
            })
            .orElse(false);
    }
    
    @Transactional
    public Optional<Medicine> updateStock(Long id, Integer quantity) {
        if (quantity == null) {
            throw new IllegalArgumentException("Quantity cannot be null");
        }
        
        return medicineRepository.findById(id)
            .map(medicine -> {
                medicine.setStock(medicine.getStock() + quantity);
                Medicine updatedMedicine = medicineRepository.save(medicine);
                
                // Notify observers about the stock change
                inventorySubject.stockUpdated(updatedMedicine);
                
                return updatedMedicine;
            });
    }
    
    public Double calculateTotalInventoryValue() {
        return medicineRepository.calculateTotalInventoryValue();
    }
}