package com.pharma.pdms.observer;

import com.pharma.pdms.models.Medicine;

/**
 * Observer interface for the Observer Pattern
 * Used to monitor changes in medicine inventory
 */
public interface InventoryObserver {
    
    /**
     * Called when a medicine's inventory status changes
     *
     * @param medicine The medicine that has been updated
     */
    void update(Medicine medicine);
}