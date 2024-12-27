package com.prestabanco.repositories;

import com.prestabanco.entities.LoanEntity;
import com.prestabanco.entities.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    List<LoanEntity> findByUserId(Long userId);

    List<LoanEntity> findByUserIdAndPropertyType(Long userId, ApplicationEntity.PropertyType propertyType);

}