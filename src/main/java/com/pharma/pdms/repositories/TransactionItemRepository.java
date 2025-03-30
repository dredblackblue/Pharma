package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.models.Transaction;
import com.pharma.pdms.models.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for TransactionItem entity
 * Implements Repository pattern
 */
@Repository
public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long> {
    
    List<TransactionItem> findByTransaction(Transaction transaction);
    
    List<TransactionItem> findByMedicine(Medicine medicine);
    
    @Query("SELECT ti FROM TransactionItem ti JOIN ti.transaction t WHERE t.patient.id = :patientId")
    List<TransactionItem> findByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT SUM(ti.quantity) FROM TransactionItem ti WHERE ti.medicine.id = :medicineId")
    Integer sumQuantityByMedicineId(@Param("medicineId") Long medicineId);
}