package com.pharma.pdms.services;

import com.pharma.pdms.models.Doctor;
import com.pharma.pdms.repositories.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;
    
    @Autowired
    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
    
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }
    
    public List<Doctor> searchDoctorsByName(String name) {
        return doctorRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }
    
    public Optional<Doctor> getDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email);
    }
    
    public Optional<Doctor> getDoctorByLicenseNumber(String licenseNumber) {
        return doctorRepository.findByLicenseNumber(licenseNumber);
    }
    
    public List<Doctor> getTopDoctorsByPrescriptionCount() {
        return doctorRepository.findTopDoctorsByPrescriptionCount();
    }
    
    @Transactional
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
    
    @Transactional
    public Optional<Doctor> updateDoctor(Long id, Doctor doctorDetails) {
        return doctorRepository.findById(id)
            .map(existingDoctor -> {
                // Update only the non-null properties
                if (doctorDetails.getName() != null) {
                    existingDoctor.setName(doctorDetails.getName());
                }
                if (doctorDetails.getSpecialization() != null) {
                    existingDoctor.setSpecialization(doctorDetails.getSpecialization());
                }
                if (doctorDetails.getLicenseNumber() != null) {
                    existingDoctor.setLicenseNumber(doctorDetails.getLicenseNumber());
                }
                if (doctorDetails.getPhoneNumber() != null) {
                    existingDoctor.setPhoneNumber(doctorDetails.getPhoneNumber());
                }
                if (doctorDetails.getEmail() != null) {
                    existingDoctor.setEmail(doctorDetails.getEmail());
                }
                if (doctorDetails.getAddress() != null) {
                    existingDoctor.setAddress(doctorDetails.getAddress());
                }
                return doctorRepository.save(existingDoctor);
            });
    }
    
    @Transactional
    public boolean deleteDoctor(Long id) {
        return doctorRepository.findById(id)
            .map(doctor -> {
                doctorRepository.delete(doctor);
                return true;
            })
            .orElse(false);
    }
}