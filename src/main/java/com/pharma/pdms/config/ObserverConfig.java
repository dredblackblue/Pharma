package com.pharma.pdms.config;

import com.pharma.pdms.utils.observer.ExpiryDateObserver;
import com.pharma.pdms.utils.observer.InventoryObserver;
import com.pharma.pdms.utils.observer.LowStockAlertObserver;
import com.pharma.pdms.utils.observer.MedicineInventorySubject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * Configuration to wire up the Observer pattern components on application startup
 */
@Configuration
public class ObserverConfig {
    private final MedicineInventorySubject medicineInventorySubject;
    private final LowStockAlertObserver lowStockAlertObserver;
    private final ExpiryDateObserver expiryDateObserver;
    
    @Autowired
    public ObserverConfig(
            MedicineInventorySubject medicineInventorySubject,
            LowStockAlertObserver lowStockAlertObserver,
            ExpiryDateObserver expiryDateObserver) {
        this.medicineInventorySubject = medicineInventorySubject;
        this.lowStockAlertObserver = lowStockAlertObserver;
        this.expiryDateObserver = expiryDateObserver;
    }
    
    @PostConstruct
    public void registerObservers() {
        // Register all observers to the subject
        medicineInventorySubject.registerObserver(lowStockAlertObserver);
        medicineInventorySubject.registerObserver(expiryDateObserver);
        
        // Log that observers are registered
        System.out.println("Registered inventory observers: LowStockAlertObserver, ExpiryDateObserver");
    }
}