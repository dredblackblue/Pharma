package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Service;

/**
 * Concrete implementation of NotificationService for SMS notifications
 * This is a concrete product in the Factory pattern
 */
@Service
public class SmsNotificationService implements NotificationService {
    
    @Override
    public boolean sendNotification(String recipient, String subject, String message) {
        // In a real implementation, this would send an actual SMS
        // using a service like Twilio, Amazon SNS, etc.
        
        System.out.printf("SENDING SMS to %s: %s%n", 
                         recipient, message);
        
        // Simulate successful sending
        return true;
    }
}