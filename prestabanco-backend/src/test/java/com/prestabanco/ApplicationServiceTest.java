package com.prestabanco;

import com.prestabanco.entities.ApplicationEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.repositories.ApplicationRepository;
import com.prestabanco.services.ApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private ApplicationEntity testApplication;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        // Crear usuario de prueba
        testUser = new UserEntity();
        testUser.setId(1L);

        // Crear solicitud de prueba con todos los campos
        testApplication = new ApplicationEntity();
        testApplication.setId(1L);
        testApplication.setUser(testUser);
        testApplication.setPropertyType(ApplicationEntity.PropertyType.FIRST_HOME);
        testApplication.setRequestedAmount(new BigDecimal("250000.00"));
        testApplication.setTerm(240); // 20 años en meses
        testApplication.setInterestRate(new BigDecimal("5.5"));
        testApplication.setStatus(ApplicationEntity.ApplicationStatus.IN_REVIEW);
        testApplication.setMonthlyIncome(new BigDecimal("5000.00"));
        testApplication.setEmploymentYears(5);
        testApplication.setCurrentDebt(new BigDecimal("10000.00"));
        testApplication.setPropertyValue(new BigDecimal("300000.00"));
        testApplication.setDocumentationComplete(false);
    }

    @Test
    void createApplication_ShouldSaveAndReturnApplication() {
        when(applicationRepository.save(any(ApplicationEntity.class)))
                .thenReturn(testApplication);

        ApplicationEntity result = applicationService.createApplication(testApplication);

        assertNotNull(result);
        assertEquals(testApplication.getId(), result.getId());
        assertEquals(testApplication.getUser().getId(), result.getUser().getId());
        assertEquals(testApplication.getPropertyType(), result.getPropertyType());
        assertEquals(0, testApplication.getRequestedAmount().compareTo(result.getRequestedAmount()));
        assertEquals(testApplication.getTerm(), result.getTerm());
        verify(applicationRepository).save(testApplication);
    }

    @Test
    void getApplicationById_WhenExists_ShouldReturnApplication() {
        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(testApplication));

        Optional<ApplicationEntity> result = applicationService.getApplicationById(1L);

        assertTrue(result.isPresent());
        assertEquals(testApplication.getId(), result.get().getId());
        assertEquals(testApplication.getPropertyType(), result.get().getPropertyType());
        assertEquals(0, testApplication.getRequestedAmount().compareTo(result.get().getRequestedAmount()));
    }

    @Test
    void getApplicationsByUserId_ShouldReturnListOfApplications() {
        List<ApplicationEntity> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByUserId(1L))
                .thenReturn(applications);

        List<ApplicationEntity> result = applicationService.getApplicationsByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        assertEquals(testApplication.getUser().getId(), result.get(0).getUser().getId());
    }

    @Test
    void updateApplication_ShouldUpdateAllFields() {
        // Modificar algunos campos para la actualización
        testApplication.setRequestedAmount(new BigDecimal("300000.00"));
        testApplication.setTerm(360); // 30 años
        testApplication.setDocumentationComplete(true);

        when(applicationRepository.save(any(ApplicationEntity.class)))
                .thenReturn(testApplication);

        ApplicationEntity result = applicationService.updateApplication(testApplication);

        assertNotNull(result);
        assertEquals(0, new BigDecimal("300000.00").compareTo(result.getRequestedAmount()));
        assertEquals(360, result.getTerm());
        assertTrue(result.getDocumentationComplete());
        verify(applicationRepository).save(testApplication);
    }

    @Test
    void updateStatus_WhenApplicationExists_ShouldUpdateStatus() {
        String newStatus = "PRE_APPROVED";
        ApplicationEntity updatedApplication = new ApplicationEntity();
        updatedApplication.setId(1L);
        updatedApplication.setStatus(ApplicationEntity.ApplicationStatus.PRE_APPROVED);

        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(ApplicationEntity.class)))
                .thenReturn(updatedApplication);

        ApplicationEntity result = applicationService.updateStatus(1L, newStatus);

        assertNotNull(result);
        assertEquals(ApplicationEntity.ApplicationStatus.PRE_APPROVED, result.getStatus());
        verify(applicationRepository).save(any(ApplicationEntity.class));
    }

    @Test
    void updateStatus_WithAllPossibleStatuses() {
        for (ApplicationEntity.ApplicationStatus status : ApplicationEntity.ApplicationStatus.values()) {
            when(applicationRepository.findById(1L))
                    .thenReturn(Optional.of(testApplication));
            when(applicationRepository.save(any(ApplicationEntity.class)))
                    .thenReturn(testApplication);

            ApplicationEntity result = applicationService.updateStatus(1L, status.name());

            assertNotNull(result);
            verify(applicationRepository, atLeastOnce()).save(any(ApplicationEntity.class));
        }
    }

    @Test
    void updateStatus_WhenApplicationNotFound_ShouldThrowException() {
        when(applicationRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                applicationService.updateStatus(999L, "APPROVED")
        );
    }

    @Test
    void updateStatus_WithInvalidStatus_ShouldThrowException() {
        when(applicationRepository.findById(1L))
                .thenReturn(Optional.of(testApplication));

        assertThrows(RuntimeException.class, () ->
                applicationService.updateStatus(1L, "INVALID_STATUS")
        );
    }

    @Test
    void deleteApplication_ShouldCallRepository() {
        applicationService.deleteApplication(1L);
        verify(applicationRepository).deleteById(1L);
    }

    @Test
    void getAllApplications_ShouldReturnAllApplications() {
        List<ApplicationEntity> applications = Arrays.asList(testApplication);
        when(applicationRepository.findAll())
                .thenReturn(applications);

        List<ApplicationEntity> result = applicationService.getAllApplications();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(applicationRepository).findAll();
    }

    @Test
    void createApplication_WithDifferentPropertyTypes() {
        for (ApplicationEntity.PropertyType propertyType : ApplicationEntity.PropertyType.values()) {
            testApplication.setPropertyType(propertyType);
            when(applicationRepository.save(any(ApplicationEntity.class)))
                    .thenReturn(testApplication);

            ApplicationEntity result = applicationService.createApplication(testApplication);

            assertNotNull(result);
            assertEquals(propertyType, result.getPropertyType());
        }
    }

    @Test
    void updateApplication_WithNegativeValues_ShouldSaveSuccessfully() {
        testApplication.setRequestedAmount(new BigDecimal("-1000.00")); // Valor negativo para probar
        when(applicationRepository.save(any(ApplicationEntity.class)))
                .thenReturn(testApplication);

        ApplicationEntity result = applicationService.updateApplication(testApplication);

        assertNotNull(result);
        assertEquals(0, new BigDecimal("-1000.00").compareTo(result.getRequestedAmount()));
    }
}