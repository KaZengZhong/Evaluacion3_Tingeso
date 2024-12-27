package com.prestabanco.controllers;

import com.prestabanco.entities.SavingsEntity;
import com.prestabanco.services.SavingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/savings")
public class SavingsController {

    @Autowired
    private SavingsService savingsService;

    @PostMapping
    public ResponseEntity<SavingsEntity> createSavings(@RequestBody SavingsEntity savings) {
        return ResponseEntity.ok(savingsService.createSavings(savings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingsEntity> getSavingsById(@PathVariable Long id) {
        return savingsService.getSavingsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<SavingsEntity> getSavingsByUserId(@PathVariable Long userId) {
        return savingsService.getSavingsByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsEntity> updateSavings(@PathVariable Long id, @RequestBody SavingsEntity savings) {
        savings.setId(id);
        return ResponseEntity.ok(savingsService.updateSavings(savings));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavings(@PathVariable Long id) {
        savingsService.deleteSavings(id);
        return ResponseEntity.ok().build();
    }
}

