package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Doctor;
import com.pharma.pdms.models.Patient;
import com.pharma.pdms.models.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * Repository interface for Prescription entity
 * Implements Repository pattern
 */
@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    List<Prescription> findByPatient(Patient patient);
    
    List<Prescription> findByDoctor(Doctor doctor);
    
    List<Prescription> findByPrescriptionDateBetween(Date startDate, Date endDate);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.prescriptionDate >= :date")
    Long countPrescriptionsAfterDate(@Param("date") Date date);
    
    @Query("SELECT p FROM Prescription p ORDER BY p.prescriptionDate DESC")
    List<Prescription> findRecentPrescriptions(org.springframework.data.domain.Pageable pageable);
}