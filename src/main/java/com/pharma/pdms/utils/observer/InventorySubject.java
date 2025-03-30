package com.pharma.pdms.utils.observer;

import com.pharma.pdms.models.Medicine;

/**
 * Subject interface for the Observer pattern
 */
public interface InventorySubject {
    void registerObserver(InventoryObserver observer);
    void removeObserver(InventoryObserver observer);
    void notifyObservers(Medicine medicine);
}