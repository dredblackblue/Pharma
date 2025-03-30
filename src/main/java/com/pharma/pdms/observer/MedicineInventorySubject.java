package com.pharma.pdms.observer;

import com.pharma.pdms.models.Medicine;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Subject class for the Observer Pattern
 * Manages observers and notifies them of inventory changes
 */
@Component
public class MedicineInventorySubject {
    
    private final List<InventoryObserver> observers = new ArrayList<>();
    
    /**
     * Register an observer to receive updates
     *
     * @param observer The observer to register
     */
    public void registerObserver(InventoryObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    /**
     * Remove an observer from the notification list
     *
     * @param observer The observer to remove
     */
    public void removeObserver(InventoryObserver observer) {
        observers.remove(observer);
    }
    
    /**
     * Notify all registered observers about a medicine inventory change
     *
     * @param medicine The medicine that has been updated
     */
    public void notifyObservers(Medicine medicine) {
        for (InventoryObserver observer : observers) {
            observer.update(medicine);
        }
    }
}