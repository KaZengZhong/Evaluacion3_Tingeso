package com.prestabanco.services;

import com.prestabanco.entities.SavingsEntity;
import com.prestabanco.repositories.SavingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class SavingsService {

    @Autowired
    private SavingsRepository savingsRepository;

    public SavingsEntity createSavings(SavingsEntity savings) {
        return savingsRepository.save(savings);
    }

    public Optional<SavingsEntity> getSavingsById(Long id) {
        return savingsRepository.findById(id);
    }

    public Optional<SavingsEntity> getSavingsByUserId(Long userId) {
        return savingsRepository.findByUserId(userId);
    }

    public Optional<SavingsEntity> getSavingsByAccountNumber(String accountNumber) {
        return savingsRepository.findByAccountNumber(accountNumber);
    }

    public SavingsEntity updateSavings(SavingsEntity savings) {
        return savingsRepository.save(savings);
    }

    public void deleteSavings(Long id) {
        savingsRepository.deleteById(id);
    }

}
