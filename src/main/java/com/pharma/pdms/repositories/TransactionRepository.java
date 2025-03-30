package com.pharma.pdms.repositories;

import com.pharma.pdms.models.Patient;
import com.pharma.pdms.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * Repository interface for Transaction entity
 * Implements Repository pattern
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByPatient(Patient patient);
    
    List<Transaction> findByTransactionDateBetween(Date startDate, Date endDate);
    
    @Query("SELECT SUM(t.totalAmount) FROM Transaction t WHERE t.transactionDate >= :date")
    BigDecimal sumTotalAmountAfterDate(@Param("date") Date date);
    
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.transactionDate >= :date")
    Long countTransactionsAfterDate(@Param("date") Date date);
    
    @Query("SELECT t FROM Transaction t ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentTransactions(org.springframework.data.domain.Pageable pageable);
}