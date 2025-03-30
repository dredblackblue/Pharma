package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

/**
 * Repository interface for Medicine entity
 * Implements Repository pattern
 */
@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    
    List<Medicine> findByName(String name);
    
    List<Medicine> findByCategory(String category);
    
    List<Medicine> findBySupplier(Supplier supplier);
    
    List<Medicine> findByExpiryDateBefore(Date date);
    
    @Query("SELECT m FROM Medicine m WHERE m.quantityInStock <= m.reorderLevel")
    List<Medicine> findLowStockMedicines();
    
    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date AND m.isActive = true")
    List<Medicine> findExpiringMedicines(@Param("date") Date date);
    
    @Query("SELECT m FROM Medicine m WHERE m.name LIKE %:keyword% OR m.description LIKE %:keyword% OR m.category LIKE %:keyword%")
    List<Medicine> searchMedicines(@Param("keyword") String keyword);
}