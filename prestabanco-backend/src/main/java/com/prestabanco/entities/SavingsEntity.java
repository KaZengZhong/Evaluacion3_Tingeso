package com.prestabanco.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavingsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    private String accountNumber;
    private BigDecimal currentBalance;
    private LocalDateTime openingDate;
    private LocalDateTime lastTransactionDate;
    private Integer monthlyDepositsCount;
    private BigDecimal monthlyDepositsAmount;
    private BigDecimal largestWithdrawalLast6Months;
    private LocalDateTime largestWithdrawalDate;
    private Integer consecutiveMonthsWithBalance;
    private Integer significantWithdrawalsCount;
    private BigDecimal lastSixMonthsAverageBalance;
    private Boolean meetsSavingsCriteria;

}


