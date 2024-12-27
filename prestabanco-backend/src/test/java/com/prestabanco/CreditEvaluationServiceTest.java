package com.prestabanco;

import com.prestabanco.entities.ApplicationEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.entities.SavingsEntity;
import com.prestabanco.services.CreditEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
class CreditEvaluationServiceTest {

    @InjectMocks
    private CreditEvaluationService creditEvaluationService;

    private ApplicationEntity application;
    private UserEntity user;
    private SavingsEntity savings;
    private BigDecimal monthlyPayment;

    @BeforeEach
    void setUp() {
        // Configurar usuario
        user = new UserEntity();
        user.setId(1L);
        user.setRut("12345678-9");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan.perez@email.com");
        user.setPassword("password123");
        user.setPhoneNumber("+56912345678");
        user.setAge(35);
        user.setRole(UserEntity.UserRole.CLIENT);

        // Configurar solicitud con valores que deberían pasar todas las reglas
        application = new ApplicationEntity();
        application.setId(1L);
        application.setUser(user);
        application.setMonthlyIncome(new BigDecimal("6000.00")); // Aumentado para mejor ratio
        application.setEmploymentYears(2);
        application.setCurrentDebt(new BigDecimal("500.00")); // Reducido para mejor ratio
        application.setRequestedAmount(new BigDecimal("160000.00")); // 64% del valor de propiedad
        application.setPropertyValue(new BigDecimal("250000.00"));
        application.setPropertyType(ApplicationEntity.PropertyType.FIRST_HOME);
        application.setTerm(240); // 20 años
        application.setInterestRate(new BigDecimal("5.5"));
        application.setStatus(ApplicationEntity.ApplicationStatus.IN_REVIEW);
        application.setDocumentationComplete(true);

        // Configurar savings con valores que cumplan los criterios
        savings = new SavingsEntity();
        savings.setId(1L);
        savings.setUser(user);
        savings.setAccountNumber("1234567890");
        savings.setCurrentBalance(new BigDecimal("30000.00")); // Aumentado para cumplir el 10% del monto solicitado
        savings.setOpeningDate(LocalDateTime.now().minusYears(2));
        savings.setLastTransactionDate(LocalDateTime.now().minusDays(5));
        savings.setMonthlyDepositsCount(5);
        savings.setMonthlyDepositsAmount(new BigDecimal("300.00")); // 5% del ingreso mensual
        savings.setLargestWithdrawalLast6Months(new BigDecimal("5000.00")); // Menos del 30% del saldo
        savings.setLargestWithdrawalDate(LocalDateTime.now().minusMonths(2));
        savings.setConsecutiveMonthsWithBalance(14);
        savings.setSignificantWithdrawalsCount(0);
        savings.setLastSixMonthsAverageBalance(new BigDecimal("25000.00"));
        savings.setMeetsSavingsCriteria(true);

        // Configurar pago mensual para que sea menos del 35% del ingreso
        monthlyPayment = new BigDecimal("1500.00"); // 25% de 6000
    }

    @Test
    void whenSavingsHistoryIsInsufficient_shouldRejectCredit() {
        // Configurar un historial de ahorro insuficiente
        savings.setConsecutiveMonthsWithBalance(5); // Menos de 12 meses
        savings.setCurrentBalance(new BigDecimal("5000.00")); // Saldo bajo
        savings.setMonthlyDepositsAmount(new BigDecimal("100.00")); // Depósitos bajos
        savings.setSignificantWithdrawalsCount(3); // Muchos retiros
        savings.setMeetsSavingsCriteria(false);

        CreditEvaluationService.CreditEvaluationResult result =
                creditEvaluationService.evaluateApplication(application, user, savings, monthlyPayment);

        assertFalse(result.isApproved());
        assertTrue(result.getEvaluationDetails().stream()
                .filter(detail -> detail.getRule().equals("Capacidad de Ahorro"))
                .findFirst()
                .map(detail -> !detail.isPassed())
                .orElse(false));
    }

    @Test
    void whenUserAgeIsNearLimit_shouldRejectCredit() {
        user.setAge(60);
        application.setTerm(180); // 15 años en meses

        CreditEvaluationService.CreditEvaluationResult result =
                creditEvaluationService.evaluateApplication(application, user, savings, monthlyPayment);

        assertFalse(result.isApproved());
        assertTrue(result.getEvaluationDetails().stream()
                .filter(detail -> detail.getRule().equals("Edad"))
                .findFirst()
                .map(detail -> !detail.isPassed())
                .orElse(false));
    }


    @Test
    void whenRecentLargeWithdrawal_shouldRejectCredit() {
        // Configurar un retiro grande (más del 30% del saldo actual)
        BigDecimal currentBalance = new BigDecimal("30000.00");
        savings.setCurrentBalance(currentBalance);
        savings.setLargestWithdrawalLast6Months(new BigDecimal("15000.00")); // 50% del saldo
        savings.setLargestWithdrawalDate(LocalDateTime.now().minusDays(30));
        savings.setSignificantWithdrawalsCount(2);
        savings.setMeetsSavingsCriteria(false);

        CreditEvaluationService.CreditEvaluationResult result =
                creditEvaluationService.evaluateApplication(application, user, savings, monthlyPayment);

        assertFalse(result.isApproved());
        assertTrue(result.getEvaluationDetails().stream()
                .filter(detail -> detail.getRule().equals("Capacidad de Ahorro"))
                .findFirst()
                .map(detail -> !detail.isPassed())
                .orElse(false));
    }

    @Test
    void testAllPropertyTypesWithMaxFinancing() {
        ApplicationEntity.PropertyType[] propertyTypes = ApplicationEntity.PropertyType.values();
        Map<ApplicationEntity.PropertyType, BigDecimal> maxPercentages = new HashMap<>();
        maxPercentages.put(ApplicationEntity.PropertyType.FIRST_HOME, new BigDecimal("0.80"));
        maxPercentages.put(ApplicationEntity.PropertyType.SECOND_HOME, new BigDecimal("0.70"));
        maxPercentages.put(ApplicationEntity.PropertyType.COMMERCIAL, new BigDecimal("0.60"));
        maxPercentages.put(ApplicationEntity.PropertyType.REMODELING, new BigDecimal("0.50"));

        for (ApplicationEntity.PropertyType propertyType : propertyTypes) {
            application.setPropertyType(propertyType);
            BigDecimal maxPercentage = maxPercentages.get(propertyType);
            application.setRequestedAmount(
                    application.getPropertyValue().multiply(maxPercentage.subtract(new BigDecimal("0.01")))
            );

            CreditEvaluationService.CreditEvaluationResult result =
                    creditEvaluationService.evaluateApplication(application, user, savings, monthlyPayment);

            assertTrue(result.getEvaluationDetails().stream()
                            .filter(detail -> detail.getRule().equals("Monto Máximo Financiamiento"))
                            .findFirst()
                            .map(CreditEvaluationService.CreditEvaluationResult.EvaluationDetail::isPassed)
                            .orElse(false),
                    "Failed for property type: " + propertyType);
        }
    }

    @Test
    void whenIncompleteDocumentation_shouldStillEvaluate() {
        application.setDocumentationComplete(false);

        CreditEvaluationService.CreditEvaluationResult result =
                creditEvaluationService.evaluateApplication(application, user, savings, monthlyPayment);

        // La evaluación debe completarse aunque la documentación esté incompleta
        assertNotNull(result);
        assertNotNull(result.getMessage());
        assertFalse(result.getEvaluationDetails().isEmpty());
    }
}
