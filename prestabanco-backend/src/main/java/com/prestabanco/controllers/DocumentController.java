package com.prestabanco.controllers;

import com.prestabanco.entities.DocumentEntity;
import com.prestabanco.services.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentEntity> createDocument(@RequestBody DocumentEntity document) {
        return ResponseEntity.ok(documentService.createDocument(document));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentEntity> getDocumentById(@PathVariable Long id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByApplicationId(@PathVariable Long applicationId) {
        return ResponseEntity.ok(documentService.getDocumentsByApplicationId(applicationId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentEntity> updateDocument(@PathVariable Long id, @RequestBody DocumentEntity document) {
        document.setId(id);
        return ResponseEntity.ok(documentService.updateDocument(document));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}

