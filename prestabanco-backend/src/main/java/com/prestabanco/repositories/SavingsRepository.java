package com.prestabanco.repositories;

import com.prestabanco.entities.SavingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SavingsRepository extends JpaRepository<SavingsEntity, Long> {
    Optional<SavingsEntity> findByUserId(Long userId);
    Optional<SavingsEntity> findByAccountNumber(String accountNumber);
}
