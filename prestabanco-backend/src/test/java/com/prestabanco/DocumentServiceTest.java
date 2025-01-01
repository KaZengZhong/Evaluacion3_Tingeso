package com.prestabanco;

import com.prestabanco.entities.ApplicationEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private DocumentService documentService;

    private DocumentEntity testDocument;
    private ApplicationEntity testApplication;

    @BeforeEach
    void setUp() {
        // Configurar ApplicationEntity
        testApplication = new ApplicationEntity();
        testApplication.setId(1L);

        // Configurar DocumentEntity
        testDocument = new DocumentEntity();
        testDocument.setId(1L);
        testDocument.setApplication(testApplication);
        testDocument.setDocumentType(DocumentEntity.DocumentType.INCOME_PROOF);
        testDocument.setFileName("income_2024.pdf");
        testDocument.setFileUrl("https://storage.example.com/docs/income_2024.pdf");
        testDocument.setUploadDate(LocalDateTime.now());
        testDocument.setStatus(DocumentEntity.DocumentStatus.PENDING);
    }

    @Test
    void createDocument_ShouldSaveAndReturnDocument() {
        // Arrange
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(testDocument);

        // Act
        DocumentEntity result = documentService.createDocument(testDocument);

        // Assert
        assertNotNull(result);
        assertEquals(testDocument.getId(), result.getId());
        assertEquals(testDocument.getDocumentType(), result.getDocumentType());
        assertEquals(testDocument.getFileName(), result.getFileName());
        verify(documentRepository).save(testDocument);
    }

    @Test
    void getDocumentById_WhenExists_ShouldReturnDocument() {
        // Arrange
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));

        // Act
        Optional<DocumentEntity> result = documentService.getDocumentById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testDocument.getId(), result.get().getId());
        assertEquals(testDocument.getDocumentType(), result.get().getDocumentType());
    }

    @Test
    void getDocumentById_WhenNotExists_ShouldReturnEmpty() {
        // Arrange
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Optional<DocumentEntity> result = documentService.getDocumentById(99L);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void getDocumentsByApplicationId_ShouldReturnListOfDocuments() {
        // Arrange
        List<DocumentEntity> documents = Arrays.asList(testDocument);
        when(documentRepository.findByApplicationId(1L)).thenReturn(documents);

        // Act
        List<DocumentEntity> result = documentService.getDocumentsByApplicationId(1L);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
    }

    @Test
    void updateDocument_ShouldUpdateAndReturnDocument() {
        // Arrange
        testDocument.setStatus(DocumentEntity.DocumentStatus.APPROVED);
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(testDocument);

        // Act
        DocumentEntity result = documentService.updateDocument(testDocument);

        // Assert
        assertNotNull(result);
        assertEquals(DocumentEntity.DocumentStatus.APPROVED, result.getStatus());
        verify(documentRepository).save(testDocument);
    }

    @Test
    void deleteDocument_ShouldCallRepository() {
        // Arrange
        doNothing().when(documentRepository).deleteById(1L);

        // Act
        documentService.deleteDocument(1L);

        // Assert
        verify(documentRepository).deleteById(1L);
    }

    @Test
    void createDocument_WithAllDocumentTypes() {
        // Configurar el comportamiento del mock para cualquier documento
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(testDocument);

        // Test para cada tipo de documento
        for (DocumentEntity.DocumentType documentType : DocumentEntity.DocumentType.values()) {
            // Arrange
            testDocument.setDocumentType(documentType);

            // Act
            DocumentEntity result = documentService.createDocument(testDocument);

            // Assert
            assertNotNull(result);
            assertEquals(documentType, result.getDocumentType());
        }

        // Verificar que save fue llamado exactamente una vez por cada tipo de documento
        verify(documentRepository, times(DocumentEntity.DocumentType.values().length)).save(any(DocumentEntity.class));
    }

    @Test
    void updateDocument_WithAllDocumentStatuses() {
        // Configurar el comportamiento del mock para cualquier documento
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(testDocument);

        // Test para cada estado de documento
        for (DocumentEntity.DocumentStatus status : DocumentEntity.DocumentStatus.values()) {
            // Arrange
            testDocument.setStatus(status);

            // Act
            DocumentEntity result = documentService.updateDocument(testDocument);

            // Assert
            assertNotNull(result);
            assertEquals(status, result.getStatus());
        }

        // Verificar que save fue llamado exactamente una vez por cada estado
        verify(documentRepository, times(DocumentEntity.DocumentStatus.values().length)).save(any(DocumentEntity.class));
    }

    @Test
    void getDocumentsByApplicationId_WhenNoDocuments_ShouldReturnEmptyList() {
        // Arrange
        when(documentRepository.findByApplicationId(99L)).thenReturn(Arrays.asList());

        // Act
        List<DocumentEntity> result = documentService.getDocumentsByApplicationId(99L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}