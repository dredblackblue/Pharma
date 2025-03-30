package com.pharma.pdms.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Patient entity for patient management
 */
@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name")
    @NotBlank
    @Size(max = 50)
    private String firstName;
    
    @Column(name = "last_name")
    @NotBlank
    @Size(max = 50)
    private String lastName;
    
    @Column(name = "date_of_birth")
    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;
    
    @NotBlank
    @Size(max = 20)
    private String phone;
    
    @Size(max = 50)
    @Email
    private String email;
    
    @Size(max = 255)
    private String address;
    
    @Column(name = "medical_history")
    @Size(max = 1000)
    private String medicalHistory;
    
    private String allergies;
    
    @Column(name = "insurance_info")
    private String insuranceInfo;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private Set<Prescription> prescriptions = new HashSet<>();
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
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