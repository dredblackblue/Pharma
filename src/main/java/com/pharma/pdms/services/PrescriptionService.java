package com.pharma.pdms.services;

import com.pharma.pdms.models.Prescription;
import com.pharma.pdms.models.PrescriptionItem;
import com.pharma.pdms.repositories.PrescriptionItemRepository;
import com.pharma.pdms.repositories.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineService medicineService;
    
    @Autowired
    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            MedicineService medicineService) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineService = medicineService;
    }
    
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }
    
    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }
    
    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }
    
    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }
    
    public List<Prescription> getPrescriptionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return prescriptionRepository.findByPrescriptionDateBetween(startDate, endDate);
    }
    
    public List<Prescription> getRecentPrescriptions(int limit) {
        return prescriptionRepository.findRecentPrescriptions(limit);
    }
    
    public int getCountForToday() {
        return prescriptionRepository.countPrescriptionsForToday();
    }
    
    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }
    
    @Transactional
    public PrescriptionItem addPrescriptionItem(PrescriptionItem item) {
        // Reduce medicine stock
        if (item.getQuantity() != null && item.getMedicineId() != null) {
            medicineService.updateStock(item.getMedicineId(), -item.getQuantity());
        }
        return prescriptionItemRepository.save(item);
    }
    
    public List<PrescriptionItem> getPrescriptionItems(Long prescriptionId) {
        return prescriptionItemRepository.findByPrescriptionId(prescriptionId);
    }
    
    @Transactional
    public Optional<Prescription> updatePrescription(Long id, Prescription prescriptionDetails) {
        return prescriptionRepository.findById(id)
            .map(existingPrescription -> {
                // Update only the non-null properties
                if (prescriptionDetails.getPatientId() != null) {
                    existingPrescription.setPatientId(prescriptionDetails.getPatientId());
                }
                if (prescriptionDetails.getDoctorId() != null) {
                    existingPrescription.setDoctorId(prescriptionDetails.getDoctorId());
                }
                if (prescriptionDetails.getPrescriptionDate() != null) {
                    existingPrescription.setPrescriptionDate(prescriptionDetails.getPrescriptionDate());
                }
                if (prescriptionDetails.getNotes() != null) {
                    existingPrescription.setNotes(prescriptionDetails.getNotes());
                }
                if (prescriptionDetails.getStatus() != null) {
                    existingPrescription.setStatus(prescriptionDetails.getStatus());
                }
                return prescriptionRepository.save(existingPrescription);
            });
    }
    
    @Transactional
    public boolean deletePrescription(Long id) {
        return prescriptionRepository.findById(id)
            .map(prescription -> {
                prescriptionRepository.delete(prescription);
                return true;
            })
            .orElse(false);
    }
}