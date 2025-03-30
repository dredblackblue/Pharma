package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Component;

/**
 * Push notification implementation
 * Part of the Factory Design Pattern
 */
@Component
public class PushNotification implements Notification {
    @Override
    public void send(String recipient, String subject, String message) {
        // In a real implementation, this would use Firebase Cloud Messaging or similar service
        System.out.println("Sending PUSH notification:");
        System.out.println("To: " + recipient);
        System.out.println("Title: " + subject);
        System.out.println("Body: " + message);
        System.out.println("----------------------------------");
    }
}