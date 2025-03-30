package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Patient entity
 * Implements Repository pattern
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    List<Patient> findByName(String name);
    
    @Query("SELECT p FROM Patient p WHERE p.name LIKE %:keyword% OR p.address LIKE %:keyword% OR p.email LIKE %:keyword%")
    List<Patient> searchPatients(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Patient p ORDER BY p.createdAt DESC")
    List<Patient> findRecentPatients(org.springframework.data.domain.Pageable pageable);
}