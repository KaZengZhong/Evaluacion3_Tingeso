package com.prestabanco.controllers;

import com.prestabanco.entities.LoanEntity;
import com.prestabanco.services.LoanService;
import com.prestabanco.services.LoanCalculatorService;
import com.prestabanco.entities.ApplicationEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin
@RequestMapping("/api/loans")
public class LoanController {

    @Autowired
    private LoanCalculatorService calculatorService;

    @Autowired
    private LoanService loanService;

    @PostMapping
    public ResponseEntity<LoanEntity> createLoan(@RequestBody LoanEntity loan) {
        return ResponseEntity.ok(loanService.createLoan(loan));
    }

    @PostMapping("/simulate")
    public ResponseEntity<LoanEntity> simulateLoan(@RequestBody LoanEntity loan) {
        // Calcular cuota mensual
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(
                loan.getRequestedAmount(),
                loan.getInterestRate(),
                loan.getTerm()
        );

        // Actualizar la entidad con los resultados
        loan.setMonthlyPayment(monthlyPayment);
        return ResponseEntity.ok(loan);
    }

    @PostMapping("/calculate-cost")
    public ResponseEntity<LoanEntity> calculateLoanCost(@RequestBody LoanEntity loan) {
        // Calcular costo total
        BigDecimal totalCost = calculatorService.calculateTotalCost(
                loan.getRequestedAmount(),
                loan.getInterestRate(),
                loan.getTerm()
        );

        // Actualizar la entidad con los resultados
        loan.setTotalCost(totalCost);
        return ResponseEntity.ok(loan);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanEntity> getLoanById(@PathVariable Long id) {
        return loanService.getLoanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoanEntity>> getLoansByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(loanService.getLoansByUserId(userId));
    }

    @GetMapping("/user/{userId}/type/{propertyType}")
    public ResponseEntity<List<LoanEntity>> getLoansByUserAndPropertyType(
            @PathVariable Long userId,
            @PathVariable ApplicationEntity.PropertyType propertyType) {
        return ResponseEntity.ok(loanService.getLoansByUserAndPropertyType(userId, propertyType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanEntity> updateLoan(@PathVariable Long id, @RequestBody LoanEntity loan) {
        loan.setId(id);
        return ResponseEntity.ok(loanService.updateLoan(loan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
        loanService.deleteLoan(id);
        return ResponseEntity.ok().build();
    }
}
