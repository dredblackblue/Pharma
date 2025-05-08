package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Component;

/**
 * SMS implementation of Notification interface
 */
@Component
public class SMSNotification implements Notification {
    @Override
    public void send(String recipient, String subject, String content) {
        // Implementation for sending SMS
        System.out.println("Sending SMS notification to: " + recipient);
        System.out.println("Message: " + subject + " - " + content);
        // In a real implementation, this would use an SMS service provider API
    }
}