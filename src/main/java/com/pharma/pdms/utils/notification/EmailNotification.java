package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Component;

/**
 * Email notification implementation
 * Part of the Factory Design Pattern
 */
@Component
public class EmailNotification implements Notification {
    @Override
    public void send(String recipient, String subject, String message) {
        // In a real implementation, this would use JavaMail API or a service like SendGrid
        System.out.println("Sending EMAIL notification:");
        System.out.println("To: " + recipient);
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);
        System.out.println("----------------------------------");
    }
}