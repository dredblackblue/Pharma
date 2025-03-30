package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Supplier entity
 * Implements Repository pattern
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    List<Supplier> findByName(String name);
    
    @Query("SELECT s FROM Supplier s WHERE s.name LIKE %:keyword% OR s.address LIKE %:keyword% OR s.contactPerson LIKE %:keyword%")
    List<Supplier> searchSuppliers(@Param("keyword") String keyword);
    
    List<Supplier> findByIsActiveTrue();
}