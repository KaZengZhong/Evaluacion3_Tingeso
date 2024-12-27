package com.prestabanco.repositories;

import com.prestabanco.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    
    Optional<UserEntity> findByEmail(String email);
    
    Optional<UserEntity> findByRut(String rut);
    
    boolean existsByEmail(String email);
    
    boolean existsByRut(String rut);
}
