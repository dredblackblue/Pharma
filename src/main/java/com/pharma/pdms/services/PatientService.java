package com.pharma.pdms.services;

import com.pharma.pdms.models.Patient;
import com.pharma.pdms.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    
    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }
    
    public List<Patient> searchPatientsByName(String name) {
        return patientRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Optional<Patient> getPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }
    
    public Optional<Patient> getPatientByPhoneNumber(String phoneNumber) {
        return patientRepository.findByPhoneNumber(phoneNumber);
    }
    
    public List<Patient> getTopPatientsByPrescriptionCount() {
        return patientRepository.findTopPatientsByPrescriptionCount();
    }
    
    public List<Patient> getRecentPatients() {
        return patientRepository.findRecentPatients();
    }
    
    @Transactional
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }
    
    @Transactional
    public Optional<Patient> updatePatient(Long id, Patient patientDetails) {
        return patientRepository.findById(id)
            .map(existingPatient -> {
                // Update only the non-null properties
                if (patientDetails.getName() != null) {
                    existingPatient.setName(patientDetails.getName());
                }
                if (patientDetails.getAddress() != null) {
                    existingPatient.setAddress(patientDetails.getAddress());
                }
                if (patientDetails.getPhoneNumber() != null) {
                    existingPatient.setPhoneNumber(patientDetails.getPhoneNumber());
                }
                if (patientDetails.getEmail() != null) {
                    existingPatient.setEmail(patientDetails.getEmail());
                }
                if (patientDetails.getDateOfBirth() != null) {
                    existingPatient.setDateOfBirth(patientDetails.getDateOfBirth());
                }
                if (patientDetails.getGender() != null) {
                    existingPatient.setGender(patientDetails.getGender());
                }
                return patientRepository.save(existingPatient);
            });
    }
    
    @Transactional
    public boolean deletePatient(Long id) {
        return patientRepository.findById(id)
            .map(patient -> {
                patientRepository.delete(patient);
                return true;
            })
            .orElse(false);
    }
}