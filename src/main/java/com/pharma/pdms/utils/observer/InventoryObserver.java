package com.pharma.pdms.utils.observer;

import com.pharma.pdms.models.Medicine;

/**
 * Observer interface for the Observer design pattern.
 * Defines the method that gets called when the observed subject's state changes.
 */
public interface InventoryObserver {
    
    /**
     * This method is called when medicine stock is updated
     * @param medicine The medicine with updated stock
     */
    void update(Medicine medicine);
}