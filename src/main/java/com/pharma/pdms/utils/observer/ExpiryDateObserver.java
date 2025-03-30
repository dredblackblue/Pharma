package com.pharma.pdms.utils.observer;

import com.pharma.pdms.models.Medicine;
import com.pharma.pdms.utils.notification.NotificationFactory;
import com.pharma.pdms.utils.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Concrete observer implementation for monitoring medicine expiry dates
 * Implements the InventoryObserver interface as part of the Observer pattern
 */
@Component
public class ExpiryDateObserver implements InventoryObserver {
    
    private final NotificationFactory notificationFactory;
    private static final int EXPIRY_WARNING_DAYS = 30;
    
    @Autowired
    public ExpiryDateObserver(NotificationFactory notificationFactory) {
        this.notificationFactory = notificationFactory;
    }
    
    @Override
    public void update(Medicine medicine) {
        // Skip if expiry date is not set
        if (medicine.getExpiryDate() == null) {
            return;
        }
        
        LocalDate today = LocalDate.now();
        LocalDate expiryDate = medicine.getExpiryDate();
        
        // Calculate days until expiry
        long daysUntilExpiry = ChronoUnit.DAYS.between(today, expiryDate);
        
        // Check if medicine is expiring soon or already expired
        if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
            generateExpiryAlert(medicine, daysUntilExpiry);
        }
    }
    
    private void generateExpiryAlert(Medicine medicine, long daysUntilExpiry) {
        String status = daysUntilExpiry < 0 ? "EXPIRED" : "EXPIRING SOON";
        String timeFrame = daysUntilExpiry < 0 
            ? Math.abs(daysUntilExpiry) + " days ago" 
            : "in " + daysUntilExpiry + " days";
            
        String message = String.format(
            "%s ALERT: %s %s %s! Expiry date: %s, Current stock: %d",
            status,
            medicine.getName(),
            status.toLowerCase(),
            timeFrame,
            medicine.getExpiryDate(),
            medicine.getStock()
        );
        
        // Get SMS notification service from the factory
        NotificationService smsService = notificationFactory.createNotificationService("sms");
        smsService.sendNotification("+1234567890", "Medicine Expiry Alert", message);
        
        // Log the alert
        System.out.println(message);
    }
}