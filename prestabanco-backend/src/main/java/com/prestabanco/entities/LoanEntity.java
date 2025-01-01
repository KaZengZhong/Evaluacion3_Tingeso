package com.prestabanco.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private ApplicationEntity.PropertyType propertyType;
    private BigDecimal requestedAmount;
    private Integer term;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal insuranceCost;
    private BigDecimal administrativeFee;
    private BigDecimal totalCost;
    private LocalDateTime simulationDate;
}
