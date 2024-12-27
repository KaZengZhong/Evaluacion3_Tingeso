package com.prestabanco.services;

import com.prestabanco.entities.DocumentEntity;
import com.prestabanco.repositories.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public DocumentEntity createDocument(DocumentEntity document) {
        return documentRepository.save(document);
    }

    public Optional<DocumentEntity> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public List<DocumentEntity> getDocumentsByApplicationId(Long applicationId) {
        return documentRepository.findByApplicationId(applicationId);
    }


    public DocumentEntity updateDocument(DocumentEntity document) {
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }
}

