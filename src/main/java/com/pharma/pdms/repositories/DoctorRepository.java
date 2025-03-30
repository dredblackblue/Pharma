package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Doctor entity
 * Implements Repository pattern
 */
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    List<Doctor> findByName(String name);
    
    List<Doctor> findBySpecialization(String specialization);
    
    @Query("SELECT d FROM Doctor d WHERE d.name LIKE %:keyword% OR d.specialization LIKE %:keyword% OR d.hospital LIKE %:keyword%")
    List<Doctor> searchDoctors(@Param("keyword") String keyword);
}