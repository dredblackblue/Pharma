package com.pharma.pdms.utils.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Factory for creating notification services
 * This is the Factory class in the Factory design pattern
 */
@Component
public class NotificationFactory {
    
    private final EmailNotificationService emailService;
    private final SmsNotificationService smsService;
    private final PushNotificationService pushService;
    
    @Autowired
    public NotificationFactory(
            EmailNotificationService emailService,
            SmsNotificationService smsService,
            PushNotificationService pushService) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }
    
    /**
     * Create a notification service based on the type
     * 
     * @param type The type of notification service to create ("email", "sms", "push")
     * @return The appropriate NotificationService implementation
     * @throws IllegalArgumentException if the type is not supported
     */
    public NotificationService createNotificationService(String type) {
        switch (type.toLowerCase()) {
            case "email":
                return emailService;
            case "sms":
                return smsService;
            case "push":
                return pushService;
            default:
                throw new IllegalArgumentException("Unsupported notification type: " + type);
        }
    }
}