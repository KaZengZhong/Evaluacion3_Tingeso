package com.prestabanco;

import com.prestabanco.entities.SavingsEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.repositories.SavingsRepository;
import com.prestabanco.services.SavingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SavingsServiceTest {

    @Mock
    private SavingsRepository savingsRepository;

    @InjectMocks
    private SavingsService savingsService;

    private SavingsEntity testSavings;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        // Configurar usuario de prueba
        testUser = new UserEntity();
        testUser.setId(1L);
        testUser.setRut("12345678-9");
        testUser.setFirstName("Juan");
        testUser.setLastName("Pérez");

        // Configurar cuenta de ahorro de prueba
        testSavings = new SavingsEntity();
        testSavings.setId(1L);
        testSavings.setUser(testUser);
        testSavings.setAccountNumber("123456789");
        testSavings.setCurrentBalance(new BigDecimal("1000000"));
        testSavings.setOpeningDate(LocalDateTime.now().minusYears(1));
        testSavings.setLastTransactionDate(LocalDateTime.now());
        testSavings.setMonthlyDepositsCount(5);
        testSavings.setMonthlyDepositsAmount(new BigDecimal("100000"));
        testSavings.setLargestWithdrawalLast6Months(new BigDecimal("200000"));
        testSavings.setLargestWithdrawalDate(LocalDateTime.now().minusMonths(2));
        testSavings.setConsecutiveMonthsWithBalance(12);
        testSavings.setSignificantWithdrawalsCount(1);
        testSavings.setLastSixMonthsAverageBalance(new BigDecimal("900000"));
        testSavings.setMeetsSavingsCriteria(true);
    }

    @Test
    void createSavings_ShouldSaveAndReturnSavings() {
        when(savingsRepository.save(any(SavingsEntity.class))).thenReturn(testSavings);

        SavingsEntity result = savingsService.createSavings(testSavings);

        assertNotNull(result);
        assertEquals(testSavings.getId(), result.getId());
        assertEquals(testSavings.getAccountNumber(), result.getAccountNumber());
        assertEquals(testSavings.getCurrentBalance(), result.getCurrentBalance());
        verify(savingsRepository).save(testSavings);
    }

    @Test
    void getSavingsById_WhenExists_ShouldReturnSavings() {
        when(savingsRepository.findById(1L)).thenReturn(Optional.of(testSavings));

        Optional<SavingsEntity> result = savingsService.getSavingsById(1L);

        assertTrue(result.isPresent());
        assertEquals(testSavings.getId(), result.get().getId());
        assertEquals(testSavings.getAccountNumber(), result.get().getAccountNumber());
    }

    @Test
    void getSavingsById_WhenNotExists_ShouldReturnEmpty() {
        when(savingsRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<SavingsEntity> result = savingsService.getSavingsById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void getSavingsByUserId_WhenExists_ShouldReturnSavings() {
        when(savingsRepository.findByUserId(1L)).thenReturn(Optional.of(testSavings));

        Optional<SavingsEntity> result = savingsService.getSavingsByUserId(1L);

        assertTrue(result.isPresent());
        assertEquals(testSavings.getUser().getId(), result.get().getUser().getId());
    }

    @Test
    void getSavingsByUserId_WhenNotExists_ShouldReturnEmpty() {
        when(savingsRepository.findByUserId(99L)).thenReturn(Optional.empty());

        Optional<SavingsEntity> result = savingsService.getSavingsByUserId(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void getSavingsByAccountNumber_WhenExists_ShouldReturnSavings() {
        when(savingsRepository.findByAccountNumber("123456789")).thenReturn(Optional.of(testSavings));

        Optional<SavingsEntity> result = savingsService.getSavingsByAccountNumber("123456789");

        assertTrue(result.isPresent());
        assertEquals(testSavings.getAccountNumber(), result.get().getAccountNumber());
    }

    @Test
    void getSavingsByAccountNumber_WhenNotExists_ShouldReturnEmpty() {
        when(savingsRepository.findByAccountNumber("999999999")).thenReturn(Optional.empty());

        Optional<SavingsEntity> result = savingsService.getSavingsByAccountNumber("999999999");

        assertFalse(result.isPresent());
    }

    @Test
    void updateSavings_ShouldUpdateAndReturnSavings() {
        // Modificar algunos valores para la actualización
        testSavings.setCurrentBalance(new BigDecimal("1500000"));
        testSavings.setMonthlyDepositsCount(6);
        testSavings.setLastTransactionDate(LocalDateTime.now());

        when(savingsRepository.save(any(SavingsEntity.class))).thenReturn(testSavings);

        SavingsEntity result = savingsService.updateSavings(testSavings);

        assertNotNull(result);
        assertEquals(new BigDecimal("1500000"), result.getCurrentBalance());
        assertEquals(6, result.getMonthlyDepositsCount());
        verify(savingsRepository).save(testSavings);
    }

    @Test
    void deleteSavings_ShouldCallRepository() {
        doNothing().when(savingsRepository).deleteById(1L);

        savingsService.deleteSavings(1L);

        verify(savingsRepository).deleteById(1L);
    }

    @Test
    void updateSavings_WithUpdatedCriteria() {
        // Actualizar criterios de ahorro
        testSavings.setConsecutiveMonthsWithBalance(24);
        testSavings.setSignificantWithdrawalsCount(0);
        testSavings.setLastSixMonthsAverageBalance(new BigDecimal("1200000"));
        testSavings.setMeetsSavingsCriteria(true);

        when(savingsRepository.save(any(SavingsEntity.class))).thenReturn(testSavings);

        SavingsEntity result = savingsService.updateSavings(testSavings);

        assertNotNull(result);
        assertEquals(24, result.getConsecutiveMonthsWithBalance());
        assertEquals(0, result.getSignificantWithdrawalsCount());
        assertEquals(new BigDecimal("1200000"), result.getLastSixMonthsAverageBalance());
        assertTrue(result.getMeetsSavingsCriteria());
    }

    @Test
    void updateSavings_WithLargeWithdrawal() {
        BigDecimal largeWithdrawal = new BigDecimal("500000");
        LocalDateTime withdrawalDate = LocalDateTime.now();

        testSavings.setLargestWithdrawalLast6Months(largeWithdrawal);
        testSavings.setLargestWithdrawalDate(withdrawalDate);
        testSavings.setCurrentBalance(testSavings.getCurrentBalance().subtract(largeWithdrawal));

        when(savingsRepository.save(any(SavingsEntity.class))).thenReturn(testSavings);

        SavingsEntity result = savingsService.updateSavings(testSavings);

        assertNotNull(result);
        assertEquals(largeWithdrawal, result.getLargestWithdrawalLast6Months());
        assertEquals(withdrawalDate, result.getLargestWithdrawalDate());
        assertTrue(result.getCurrentBalance().compareTo(new BigDecimal("500000")) == 0);
    }
}
