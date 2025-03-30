package com.pharma.pdms.utils.observer;

import com.pharma.pdms.models.Medicine;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Subject class in the Observer design pattern.
 * Maintains a list of observers and notifies them when there is a change in medicine stock.
 */
@Component
public class MedicineInventorySubject {
    
    private final List<InventoryObserver> observers = new ArrayList<>();
    
    /**
     * Register an observer to receive notifications
     * @param observer The observer to register
     */
    public void registerObserver(InventoryObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    /**
     * Remove an observer so it no longer receives notifications
     * @param observer The observer to remove
     */
    public void removeObserver(InventoryObserver observer) {
        observers.remove(observer);
    }
    
    /**
     * Notify all registered observers about a stock update
     * @param medicine The medicine with updated stock
     */
    public void stockUpdated(Medicine medicine) {
        notifyObservers(medicine);
    }
    
    /**
     * Private method to handle the actual notification process
     * @param medicine The medicine to pass to observers
     */
    private void notifyObservers(Medicine medicine) {
        for (InventoryObserver observer : observers) {
            observer.update(medicine);
        }
    }
}