package com.pharma.pdms.utils.notification;

/**
 * Interface for notification services
 * This is the product interface for the Factory pattern
 */
public interface NotificationService {
    
    /**
     * Send a notification to a recipient
     * 
     * @param recipient The recipient of the notification (email, phone number, user ID, etc.)
     * @param subject The subject or title of the notification
     * @param message The content of the notification
     * @return boolean indicating whether the notification was sent successfully
     */
    boolean sendNotification(String recipient, String subject, String message);
}