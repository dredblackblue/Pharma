package com.pharma.pdms.repositories;

import com.pharma.pdms.models.ERole;
import com.pharma.pdms.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity
 * Implements Repository pattern
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    Optional<Role> findByName(ERole name);
}