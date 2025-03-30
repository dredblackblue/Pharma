package com.pharma.pdms.utils.notification;

import org.springframework.stereotype.Component;

/**
 * SMS notification implementation
 * Part of the Factory Design Pattern
 */
@Component
public class SmsNotification implements Notification {
    @Override
    public void send(String recipient, String subject, String message) {
        // In a real implementation, this would use an SMS gateway like Twilio
        System.out.println("Sending SMS notification:");
        System.out.println("To: " + recipient);
        System.out.println("Message: " + message); // SMS typically doesn't have a subject
        System.out.println("----------------------------------");
    }
}