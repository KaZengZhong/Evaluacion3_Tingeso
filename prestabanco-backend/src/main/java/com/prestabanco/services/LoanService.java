package com.prestabanco.services;

import com.prestabanco.entities.LoanEntity;
import com.prestabanco.repositories.LoanRepository;
import com.prestabanco.entities.ApplicationEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    public LoanEntity createLoan(LoanEntity loan) {
        return loanRepository.save(loan);
    }

    public Optional<LoanEntity> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    public List<LoanEntity> getLoansByUserId(Long userId) {
        return loanRepository.findByUserId(userId);
    }

    public List<LoanEntity> getLoansByUserAndPropertyType(Long userId, ApplicationEntity.PropertyType propertyType) {
        return loanRepository.findByUserIdAndPropertyType(userId, propertyType);
    }

    public List<LoanEntity> getAllLoans() {
        return loanRepository.findAll();
    }

    public LoanEntity updateLoan(LoanEntity loan) {
        return loanRepository.save(loan);
    }

    public void deleteLoan(Long id) {
        loanRepository.deleteById(id);
    }

}
