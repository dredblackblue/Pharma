package com.pharma.pdms.utils.observer;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.utils.notification.NotificationFactory;
import com.pharma.pdms.utils.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Concrete observer implementation for monitoring low stock levels
 * Implements the InventoryObserver interface as part of the Observer pattern
 */
@Component
public class LowStockAlertObserver implements InventoryObserver {
    
    private final NotificationFactory notificationFactory;
    
    @Autowired
    public LowStockAlertObserver(NotificationFactory notificationFactory) {
        this.notificationFactory = notificationFactory;
    }
    
    @Override
    public void update(Medicine medicine) {
        // Check if the medicine stock is below the reorder level
        if (medicine.getStock() != null && medicine.getReorderLevel() != null
                && medicine.getStock() <= medicine.getReorderLevel()) {
            
            generateLowStockAlert(medicine);
        }
    }
    
    private void generateLowStockAlert(Medicine medicine) {
        String message = String.format(
            "LOW STOCK ALERT: %s is running low! Current stock: %d, Reorder Level: %d",
            medicine.getName(),
            medicine.getStock(),
            medicine.getReorderLevel()
        );
        
        // Get email notification service from the factory
        NotificationService emailService = notificationFactory.createNotificationService("email");
        emailService.sendNotification("admin@pharmacy.com", "Low Stock Alert", message);
        
        // Log the alert
        System.out.println(message);
    }
}