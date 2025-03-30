package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.models.Prescription;
import com.pharma.pdms.models.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for PrescriptionItem entity
 * Implements Repository pattern
 */
@Repository
public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {
    
    List<PrescriptionItem> findByPrescription(Prescription prescription);
    
    List<PrescriptionItem> findByMedicine(Medicine medicine);
    
    @Query("SELECT pi FROM PrescriptionItem pi JOIN pi.prescription p WHERE p.patient.id = :patientId")
    List<PrescriptionItem> findByPatientId(@Param("patientId") Long patientId);
}