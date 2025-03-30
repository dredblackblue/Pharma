package com.pharma.pdms.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;

/**
 * TransactionItem entity representing an item in a transaction
 */
@Entity
@Table(name = "transaction_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;
    
    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
    
    @NotNull
    @Min(1)
    private Integer quantity;
    
    @NotNull
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @NotNull
    @Column(name = "subtotal")
    private BigDecimal subtotal;
    
    @Column(name = "discount")
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
        calculateSubtotal();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
        calculateSubtotal();
    }
    
    private void calculateSubtotal() {
        if (unitPrice != null && quantity != null) {
            BigDecimal totalBeforeDiscount = unitPrice.multiply(BigDecimal.valueOf(quantity));
            subtotal = discount != null ? totalBeforeDiscount.subtract(discount) : totalBeforeDiscount;
        }
    }
}