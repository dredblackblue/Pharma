package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Service;

/**
 * Concrete implementation of NotificationService for push notifications
 * This is a concrete product in the Factory pattern
 */
@Service
public class PushNotificationService implements NotificationService {
    
    @Override
    public boolean sendNotification(String recipient, String subject, String message) {
        // In a real implementation, this would send an actual push notification
        // using a service like Firebase Cloud Messaging, OneSignal, etc.
        
        System.out.printf("SENDING PUSH NOTIFICATION to device %s with title '%s': %s%n", 
                         recipient, subject, message);
        
        // Simulate successful sending
        return true;
    }
}