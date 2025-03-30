package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Service;

/**
 * Concrete implementation of NotificationService for email notifications
 * This is a concrete product in the Factory pattern
 */
@Service
public class EmailNotificationService implements NotificationService {
    
    @Override
    public boolean sendNotification(String recipient, String subject, String message) {
        // In a real implementation, this would send an actual email
        // using a service like JavaMail, Amazon SES, SendGrid, etc.
        
        System.out.printf("SENDING EMAIL to %s with subject '%s': %s%n", 
                         recipient, subject, message);
        
        // Simulate successful sending
        return true;
    }
}