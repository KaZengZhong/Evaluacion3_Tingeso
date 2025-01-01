package com.prestabanco.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private PropertyType propertyType;
    private BigDecimal requestedAmount;
    private Integer term;
    private BigDecimal interestRate;
    private ApplicationStatus status;
    private BigDecimal monthlyIncome;
    private Integer employmentYears;
    private BigDecimal currentDebt;
    private BigDecimal propertyValue;
    private Boolean documentationComplete;

    @Column(columnDefinition = "text")
    private String documents;

    public enum PropertyType {
        FIRST_HOME,
        SECOND_HOME,
        COMMERCIAL,
        REMODELING
    }

    public enum ApplicationStatus {
        IN_REVIEW,
        PENDING_DOCUMENTS,
        IN_EVALUATION,
        PRE_APPROVED,
        FINAL_APPROVAL,
        APPROVED,
        REJECTED,
        CANCELLED,
        IN_DISBURSEMENT
    }




}
