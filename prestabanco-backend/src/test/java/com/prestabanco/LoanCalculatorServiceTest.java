package com.prestabanco;

import com.prestabanco.services.LoanCalculatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
class LoanCalculatorServiceTest {

    @InjectMocks
    private LoanCalculatorService calculatorService;

    @Test
    void calculateMonthlyPayment_ForTypicalMortgage() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("50000000"); // 50 millones
        BigDecimal annualInterestRate = new BigDecimal("5.5"); // 5.5%
        int years = 20;

        // Act
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);

        // Assert
        assertNotNull(monthlyPayment);
        assertTrue(monthlyPayment.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(monthlyPayment.compareTo(loanAmount) < 0);
    }

    @Test
    void calculateMonthlyPayment_ForSmallLoan() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("1000000"); // 1 millón
        BigDecimal annualInterestRate = new BigDecimal("7.0"); // 7%
        int years = 5;

        // Act
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);

        // Assert
        assertNotNull(monthlyPayment);
        assertTrue(monthlyPayment.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(monthlyPayment.compareTo(loanAmount) < 0);
    }

    @Test
    void calculateMonthlyPayment_WithVeryLowInterest() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("12000000"); // 12 millones
        BigDecimal annualInterestRate = new BigDecimal("0.1"); // 0.1%
        int years = 10;

        // Act
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);

        // Assert
        assertNotNull(monthlyPayment);
        assertTrue(monthlyPayment.compareTo(BigDecimal.ZERO) > 0);
        // El pago mensual debería ser ligeramente mayor que el monto del préstamo dividido entre el total de meses
        BigDecimal simpleMonthlyPayment = loanAmount.divide(BigDecimal.valueOf(years * 12L), 0, RoundingMode.HALF_UP);
        assertTrue(monthlyPayment.compareTo(simpleMonthlyPayment) > 0);
    }

    @Test
    void calculateTotalCost_ShouldIncludeAllFees() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("50000000"); // 50 millones
        BigDecimal annualInterestRate = new BigDecimal("5.5"); // 5.5%
        int years = 20;

        // Act
        BigDecimal totalCost = calculatorService.calculateTotalCost(loanAmount, annualInterestRate, years);

        // Calculate expected minimum cost (principal + simple interest)
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);
        BigDecimal expectedMinimumTotal = monthlyPayment.multiply(BigDecimal.valueOf(years * 12L));

        // Assert
        assertNotNull(totalCost);
        assertTrue(totalCost.compareTo(loanAmount) > 0);
        assertTrue(totalCost.compareTo(expectedMinimumTotal) > 0);
    }

    @Test
    void calculateTotalCost_ShouldHandleSmallLoan() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("1000000"); // 1 millón
        BigDecimal annualInterestRate = new BigDecimal("7.0");
        int years = 5;

        // Act
        BigDecimal totalCost = calculatorService.calculateTotalCost(loanAmount, annualInterestRate, years);

        // Assert
        assertNotNull(totalCost);
        assertTrue(totalCost.compareTo(loanAmount) > 0);

        // Verificar que incluye los costos administrativos mínimos
        BigDecimal adminFee = loanAmount.multiply(new BigDecimal("0.01")).setScale(0, RoundingMode.HALF_UP);
        assertTrue(totalCost.compareTo(loanAmount.add(adminFee)) > 0);
    }

    @Test
    void verifyMonthlyPaymentComponents() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("30000000"); // 30 millones
        BigDecimal annualInterestRate = new BigDecimal("6.0"); // 6%
        int years = 15;

        // Act
        BigDecimal totalCost = calculatorService.calculateTotalCost(loanAmount, annualInterestRate, years);

        // Calcular componentes esperados
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);
        BigDecimal monthlyLifeInsurance = loanAmount.multiply(new BigDecimal("0.0003")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal adminFee = loanAmount.multiply(new BigDecimal("0.01")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal expectedMinimumTotal = monthlyPayment
                .add(monthlyLifeInsurance)
                .add(new BigDecimal("20000"))
                .multiply(BigDecimal.valueOf(years * 12L))
                .add(adminFee);

        // Assert
        assertNotNull(totalCost);
        assertTrue(totalCost.compareTo(expectedMinimumTotal) >= 0);
    }

    @Test
    void verifyRoundingBehavior() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("25000000");
        BigDecimal annualInterestRate = new BigDecimal("5.5");
        int years = 20;

        // Act
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);
        BigDecimal totalCost = calculatorService.calculateTotalCost(loanAmount, annualInterestRate, years);

        // Assert
        assertEquals(0, monthlyPayment.scale());
        assertEquals(0, totalCost.scale());
    }

    @Test
    void verifyInterestRateValidation() {
        // Arrange
        BigDecimal loanAmount = new BigDecimal("25000000");
        BigDecimal annualInterestRate = new BigDecimal("0.5"); // Tasa muy baja pero válida
        int years = 20;

        // Act
        BigDecimal monthlyPayment = calculatorService.calculateMonthlyPayment(loanAmount, annualInterestRate, years);
        BigDecimal totalCost = calculatorService.calculateTotalCost(loanAmount, annualInterestRate, years);

        // Assert
        assertNotNull(monthlyPayment);
        assertNotNull(totalCost);
        assertTrue(monthlyPayment.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(totalCost.compareTo(loanAmount) > 0);
    }
}