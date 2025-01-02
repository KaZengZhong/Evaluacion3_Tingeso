package com.prestabanco.services;

import com.prestabanco.entities.ApplicationEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.entities.SavingsEntity;
import lombok.Getter;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.*;
import java.math.RoundingMode;
import lombok.AllArgsConstructor;

@Service
public class CreditEvaluationService {

    private static final BigDecimal MAX_INCOME_RATIO = new BigDecimal("0.35"); // 35%
    private static final BigDecimal MAX_DEBT_RATIO = new BigDecimal("0.50");   // 50%
    private static final int MIN_EMPLOYMENT_YEARS = 1;
    private static final int MAX_AGE_AT_END = 75;
    private static final int AGE_MARGIN = 5;

    @Getter
    @AllArgsConstructor
    public static class CreditEvaluationResult {
        private final boolean approved;
        private final List<EvaluationDetail> evaluationDetails;
        private final String message;

        @Getter
        @AllArgsConstructor
        public static class EvaluationDetail {
            private final String rule;
            private final boolean passed;
            private final String description;
        }
    }

    // R1: Relación cuota/ingreso
    private boolean evaluateIncomeRatio(ApplicationEntity application, BigDecimal monthlyPayment) {
        BigDecimal incomeRatio = monthlyPayment.divide(application.getMonthlyIncome(), 4, RoundingMode.HALF_UP);
        return incomeRatio.compareTo(MAX_INCOME_RATIO) <= 0;
    }

    // R2: Historial Crediticio
    private boolean evaluateCreditHistory(ApplicationEntity application) {
        // Simulación de consulta a DICOM
        return true;
    }

    // R3: Antigüedad Laboral
    private boolean evaluateEmploymentYears(ApplicationEntity application) {
        return application.getEmploymentYears() >= MIN_EMPLOYMENT_YEARS;
    }

    // R4: Relación Deuda/Ingreso
    private boolean evaluateDebtRatio(ApplicationEntity application, BigDecimal monthlyPayment) {
        BigDecimal totalMonthlyDebt = application.getCurrentDebt().add(monthlyPayment);
        BigDecimal debtRatio = totalMonthlyDebt.divide(application.getMonthlyIncome(), 4, RoundingMode.HALF_UP);
        return debtRatio.compareTo(MAX_DEBT_RATIO) <= 0;
    }

    // R5: Monto Máximo de Financiamiento
    private boolean evaluateMaxFinancing(ApplicationEntity application) {
        BigDecimal maxFinancingPercentage = switch (application.getPropertyType()) {
            case FIRST_HOME -> new BigDecimal("0.80");    // 80%
            case SECOND_HOME -> new BigDecimal("0.70");   // 70%
            case COMMERCIAL -> new BigDecimal("0.60");    // 60%
            case REMODELING -> new BigDecimal("0.50");    // 50%
        };

        BigDecimal maxAmount = application.getPropertyValue().multiply(maxFinancingPercentage);
        return application.getRequestedAmount().compareTo(maxAmount) <= 0;
    }

    // R6: Edad del Solicitante (versión modificada para trabajar con edad directa)
    private boolean evaluateAge(ApplicationEntity application, UserEntity user) {
        int ageAtEnd = user.getAge() + application.getTerm();
        return ageAtEnd <= (MAX_AGE_AT_END - AGE_MARGIN);
    }

    private boolean evaluateSavingsCapacity(SavingsEntity savings, ApplicationEntity application) {
        // Validación inicial
        if (savings == null || application == null ||
                savings.getCurrentBalance() == null ||
                savings.getMonthlyDepositsAmount() == null ||
                savings.getLargestWithdrawalLast6Months() == null) {
            return false;
        }

        int criteriasMet = 0;

        try {
            // R71: Saldo Mínimo (10% del monto solicitado)
            BigDecimal minBalance = application.getRequestedAmount().multiply(new BigDecimal("0.10"));
            if (savings.getCurrentBalance().compareTo(minBalance) >= 0) {
                criteriasMet++;
            }

            // R72: Historial de Ahorro Consistente
            if (savings.getConsecutiveMonthsWithBalance() != null &&
                    savings.getSignificantWithdrawalsCount() != null &&
                    savings.getConsecutiveMonthsWithBalance() >= 12 &&
                    savings.getSignificantWithdrawalsCount() == 0) {
                criteriasMet++;
            }

            // R73: Depósitos Periódicos (5% del ingreso mensual)
            BigDecimal minMonthlyDeposit = application.getMonthlyIncome().multiply(new BigDecimal("0.05"));
            if (savings.getMonthlyDepositsAmount().compareTo(minMonthlyDeposit) >= 0) {
                criteriasMet++;
            }

            // R74: Relación Saldo/Años
            BigDecimal requiredPercentage;
            if (savings.getConsecutiveMonthsWithBalance() != null) {
                requiredPercentage = savings.getConsecutiveMonthsWithBalance() < 24 ?
                        new BigDecimal("0.20") : new BigDecimal("0.10");
                BigDecimal requiredBalance = application.getRequestedAmount().multiply(requiredPercentage);
                if (savings.getCurrentBalance().compareTo(requiredBalance) >= 0) {
                    criteriasMet++;
                }
            }

            // R75: Retiros Recientes (no más del 30% del saldo)
            BigDecimal maxWithdrawal = savings.getCurrentBalance().multiply(new BigDecimal("0.30"));
            if (savings.getLargestWithdrawalLast6Months().compareTo(maxWithdrawal) <= 0) {
                criteriasMet++;
            }

            // Actualizar el criterio de ahorro
            savings.setMeetsSavingsCriteria(criteriasMet >= 3);

            return criteriasMet >= 3;

        } catch (Exception e) {
            System.err.println("Error al evaluar capacidad de ahorro: " + e.getMessage());
            return false;
        }
    }

    public CreditEvaluationResult evaluateApplication(
            ApplicationEntity application,
            UserEntity user,
            SavingsEntity savings,
            BigDecimal monthlyPayment) {

        List<CreditEvaluationResult.EvaluationDetail> details = new ArrayList<>();
        boolean allPassed = true;

        // Evaluar relación cuota/ingreso
        boolean incomeRatioPassed = evaluateIncomeRatio(application, monthlyPayment);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Relación Cuota/Ingreso",
                incomeRatioPassed,
                "La cuota no debe superar el 35% del ingreso mensual"
        ));
        allPassed &= incomeRatioPassed;

        // Evaluar historial crediticio
        boolean creditHistoryPassed = evaluateCreditHistory(application);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Historial Crediticio",
                creditHistoryPassed,
                "No debe tener deudas impagas o morosidades graves"
        ));
        allPassed &= creditHistoryPassed;

        // Evaluar antigüedad laboral
        boolean employmentYearsPassed = evaluateEmploymentYears(application);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Antigüedad Laboral",
                employmentYearsPassed,
                "Debe tener al menos 1 año de antigüedad laboral"
        ));
        allPassed &= employmentYearsPassed;

        // Evaluar relación deuda/ingreso
        boolean debtRatioPassed = evaluateDebtRatio(application, monthlyPayment);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Relación Deuda/Ingreso",
                debtRatioPassed,
                "El total de deudas no debe superar el 50% del ingreso"
        ));
        allPassed &= debtRatioPassed;

        // Evaluar monto máximo de financiamiento
        boolean maxFinancingPassed = evaluateMaxFinancing(application);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Monto Máximo Financiamiento",
                maxFinancingPassed,
                "El monto solicitado debe estar dentro del máximo permitido según tipo de propiedad"
        ));
        allPassed &= maxFinancingPassed;

        // Evaluar edad
        boolean agePassed = evaluateAge(application, user);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Edad",
                agePassed,
                "La edad al terminar el crédito no debe superar los 70 años"
        ));
        allPassed &= agePassed;

        // Evaluar capacidad de ahorro
        boolean savingsCapacityPassed = evaluateSavingsCapacity(savings, application);
        details.add(new CreditEvaluationResult.EvaluationDetail(
                "Capacidad de Ahorro",
                savingsCapacityPassed,
                "Debe cumplir con al menos 3 de los 5 criterios de ahorro"
        ));
        allPassed &= savingsCapacityPassed;

        String message = allPassed ?
                "Crédito Pre-Aprobado" :
                "Crédito Rechazado - No cumple con todos los requisitos";

        return new CreditEvaluationResult(allPassed, details, message);
    }
}

