package com.prestabanco.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private ApplicationEntity application;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String fileName;
    private String fileUrl;
    private LocalDateTime uploadDate;
  

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    public enum DocumentType {
        INCOME_PROOF,                  // Comprobante de ingresos
        APPRAISAL_CERTIFICATE,         // Certificado de avalúo
        CREDIT_HISTORY,               // Historial crediticio
        FIRST_HOME_DEED,              // Escritura de la primera vivienda
        BUSINESS_FINANCIAL_STATEMENT,  // Estado financiero del negocio
        BUSINESS_PLAN,                // Plan de negocios
        REMODELING_BUDGET             // Presupuesto de la remodelación
    }

    public enum DocumentStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

}


