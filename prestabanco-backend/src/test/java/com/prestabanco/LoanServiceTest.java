package com.prestabanco;

import com.prestabanco.entities.LoanEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.entities.ApplicationEntity;
import com.prestabanco.repositories.LoanRepository;
import com.prestabanco.services.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @InjectMocks
    private LoanService loanService;

    private LoanEntity testLoan;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        // Configurar usuario de prueba
        testUser = new UserEntity();
        testUser.setId(1L);
        testUser.setRut("12345678-9");
        testUser.setFirstName("Juan");
        testUser.setLastName("Pérez");

        // Configurar préstamo de prueba
        testLoan = new LoanEntity();
        testLoan.setId(1L);
        testLoan.setUser(testUser);
        testLoan.setPropertyType(ApplicationEntity.PropertyType.FIRST_HOME);
        testLoan.setRequestedAmount(new BigDecimal("50000000"));
        testLoan.setTerm(240); // 20 años
        testLoan.setInterestRate(new BigDecimal("5.5"));
        testLoan.setMonthlyPayment(new BigDecimal("350000"));
        testLoan.setInsuranceCost(new BigDecimal("15000"));
        testLoan.setAdministrativeFee(new BigDecimal("500000"));
        testLoan.setTotalCost(new BigDecimal("85000000"));
        testLoan.setSimulationDate(LocalDateTime.now());
    }

    @Test
    void createLoan_ShouldSaveAndReturnLoan() {
        when(loanRepository.save(any(LoanEntity.class))).thenReturn(testLoan);

        LoanEntity result = loanService.createLoan(testLoan);

        assertNotNull(result);
        assertEquals(testLoan.getId(), result.getId());
        assertEquals(testLoan.getRequestedAmount(), result.getRequestedAmount());
        verify(loanRepository).save(testLoan);
    }

    @Test
    void getLoanById_WhenExists_ShouldReturnLoan() {
        when(loanRepository.findById(1L)).thenReturn(Optional.of(testLoan));

        Optional<LoanEntity> result = loanService.getLoanById(1L);

        assertTrue(result.isPresent());
        assertEquals(testLoan.getId(), result.get().getId());
        assertEquals(testLoan.getPropertyType(), result.get().getPropertyType());
    }

    @Test
    void getLoanById_WhenNotExists_ShouldReturnEmpty() {
        when(loanRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<LoanEntity> result = loanService.getLoanById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void getLoansByUserId_ShouldReturnUserLoans() {
        List<LoanEntity> loans = Arrays.asList(testLoan);
        when(loanRepository.findByUserId(1L)).thenReturn(loans);

        List<LoanEntity> result = loanService.getLoansByUserId(1L);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testLoan.getId(), result.get(0).getId());
    }

    @Test
    void getLoansByUserAndPropertyType_ShouldReturnFilteredLoans() {
        List<LoanEntity> loans = Arrays.asList(testLoan);
        when(loanRepository.findByUserIdAndPropertyType(1L, ApplicationEntity.PropertyType.FIRST_HOME))
                .thenReturn(loans);

        List<LoanEntity> result = loanService.getLoansByUserAndPropertyType(
                1L, ApplicationEntity.PropertyType.FIRST_HOME);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(ApplicationEntity.PropertyType.FIRST_HOME, result.get(0).getPropertyType());
    }

    @Test
    void updateLoan_ShouldUpdateAndReturnLoan() {
        testLoan.setMonthlyPayment(new BigDecimal("380000"));
        when(loanRepository.save(any(LoanEntity.class))).thenReturn(testLoan);

        LoanEntity result = loanService.updateLoan(testLoan);

        assertNotNull(result);
        assertEquals(new BigDecimal("380000"), result.getMonthlyPayment());
        verify(loanRepository).save(testLoan);
    }

    @Test
    void deleteLoan_ShouldCallRepository() {
        doNothing().when(loanRepository).deleteById(1L);

        loanService.deleteLoan(1L);

        verify(loanRepository).deleteById(1L);
    }

    @Test
    void getAllLoans_ShouldReturnAllLoans() {
        List<LoanEntity> loans = Arrays.asList(testLoan);
        when(loanRepository.findAll()).thenReturn(loans);

        List<LoanEntity> result = loanService.getAllLoans();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(loanRepository).findAll();
    }

    @Test
    void getLoansByUserAndPropertyType_WhenNoLoans_ShouldReturnEmptyList() {
        when(loanRepository.findByUserIdAndPropertyType(99L, ApplicationEntity.PropertyType.FIRST_HOME))
                .thenReturn(Arrays.asList());

        List<LoanEntity> result = loanService.getLoansByUserAndPropertyType(
                99L, ApplicationEntity.PropertyType.FIRST_HOME);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createLoan_WithAllPropertyTypes() {
        for (ApplicationEntity.PropertyType propertyType : ApplicationEntity.PropertyType.values()) {
            testLoan.setPropertyType(propertyType);
            when(loanRepository.save(any(LoanEntity.class))).thenReturn(testLoan);

            LoanEntity result = loanService.createLoan(testLoan);

            assertNotNull(result);
            assertEquals(propertyType, result.getPropertyType());
        }
    }
}
