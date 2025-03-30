package com.pharma.pdms.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Date;

/**
 * Medicine entity for inventory management
 */
@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @Size(max = 255)
    private String description;
    
    @NotBlank
    @Size(max = 100)
    private String manufacturer;
    
    @Column(name = "batch_number")
    private String batchNumber;
    
    @NotNull
    @Min(0)
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @NotNull
    @Min(0)
    @Column(name = "quantity_in_stock")
    private Integer quantityInStock;
    
    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;
    
    @NotNull
    @Column(name = "expiry_date")
    @Temporal(TemporalType.DATE)
    private Date expiryDate;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @NotBlank
    @Size(max = 50)
    private String category;
    
    @Size(max = 50)
    private String location;
    
    @Column(name = "is_prescription_required")
    private Boolean isPrescriptionRequired = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}