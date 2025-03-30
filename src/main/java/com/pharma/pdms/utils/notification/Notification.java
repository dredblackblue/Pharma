package com.pharma.pdms.utils.notification;

/**
 * Interface for all notification types
 * Part of the Factory Design Pattern
 */
public interface Notification {
    void send(String recipient, String subject, String message);
}