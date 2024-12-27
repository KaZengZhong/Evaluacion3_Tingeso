package com.prestabanco.services;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class LoanCalculatorService {

    public BigDecimal calculateMonthlyPayment(BigDecimal loanAmount, BigDecimal annualInterestRate, int years) {
        // Convertir tasa anual a mensual (r = tasa anual / 12 / 100)
        BigDecimal monthlyRate = annualInterestRate
                .divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);

        // Calcular número total de pagos (n = años * 12)
        int numberOfPayments = years * 12;

        // Calcular (1 + r)^n
        BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyRate);
        BigDecimal compoundFactor = onePlusRate.pow(numberOfPayments);

        // Calcular numerador: P * r * (1 + r)^n
        BigDecimal numerator = loanAmount
                .multiply(monthlyRate)
                .multiply(compoundFactor);

        // Calcular denominador: (1 + r)^n - 1
        BigDecimal denominator = compoundFactor.subtract(BigDecimal.ONE);

        // Calcular cuota mensual
        return numerator.divide(denominator, 0, RoundingMode.HALF_UP);
    }

    // Metodo de ayuda para calcular el costo total
    public BigDecimal calculateTotalCost(BigDecimal loanAmount, BigDecimal annualInterestRate, int years) {
        // Calcular cuota mensual base
        BigDecimal monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, years);

        // Calcular seguro de desgravamen mensual
        BigDecimal monthlyLifeInsurance = loanAmount.multiply(new BigDecimal("0.0003"))
                .setScale(0, RoundingMode.HALF_UP);

        // Comisión administrativa (cargo único)
        BigDecimal adminFee = loanAmount.multiply(new BigDecimal("0.01"))
                .setScale(0, RoundingMode.HALF_UP);

        // Total mensual (cuota + seguros)
        BigDecimal totalMonthlyPayment = monthlyPayment
                .add(monthlyLifeInsurance)
                .add(new BigDecimal("20000"));

        // Costo total del préstamo
        return totalMonthlyPayment
                .multiply(BigDecimal.valueOf(years * 12))
                .add(adminFee)
                .setScale(0, RoundingMode.HALF_UP);
    }

}
