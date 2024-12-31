package com.prestabanco.services;

import com.prestabanco.entities.ApplicationEntity;
import com.prestabanco.entities.UserEntity;
import com.prestabanco.repositories.ApplicationRepository;
import com.prestabanco.repositories.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    


    public ApplicationEntity createApplication(ApplicationEntity application) {
        return applicationRepository.save(application);
    }

    public Optional<ApplicationEntity> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    public List<ApplicationEntity> getApplicationsByUserId(Long userId) {
        return applicationRepository.findByUserId(userId);
    }


    public ApplicationEntity updateApplication(ApplicationEntity application) {
        return applicationRepository.save(application);
    }

    public ApplicationEntity updateStatus(Long id, String newStatus) {
        ApplicationEntity application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        try {
            ApplicationEntity.ApplicationStatus status = ApplicationEntity.ApplicationStatus.valueOf(newStatus);
            application.setStatus(status);
            return applicationRepository.save(application);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado de solicitud inválido");
        }
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public List<ApplicationEntity> getAllApplications() {
        return applicationRepository.findAll();
    }
}
