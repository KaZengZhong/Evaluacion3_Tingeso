package com.prestabanco;

import com.prestabanco.entities.UserEntity;
import com.prestabanco.repositories.UserRepository;
import com.prestabanco.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setId(1L);
        testUser.setRut("12345678-9");
        testUser.setFirstName("Juan");
        testUser.setLastName("Pérez");
        testUser.setEmail("juan.perez@email.com");
        testUser.setPassword("password123");
        testUser.setPhoneNumber("+56912345678");
        testUser.setAge(30);
        testUser.setRole(UserEntity.UserRole.CLIENT);
    }

    @Test
    void createUser_ShouldSaveAndReturnUser() {
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        UserEntity result = userService.createUser(testUser);

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getEmail(), result.getEmail());
        assertEquals(testUser.getRut(), result.getRut());
        verify(userRepository).save(testUser);
    }

    @Test
    void getUserById_WhenExists_ShouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Optional<UserEntity> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
    }

    @Test
    void getUserById_WhenNotExists_ShouldReturnEmpty() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<UserEntity> result = userService.getUserById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void getUserByEmail_WhenExists_ShouldReturnUser() {
        when(userRepository.findByEmail("juan.perez@email.com")).thenReturn(Optional.of(testUser));

        Optional<UserEntity> result = userService.getUserByEmail("juan.perez@email.com");

        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
    }

    @Test
    void getUserByRut_WhenExists_ShouldReturnUser() {
        when(userRepository.findByRut("12345678-9")).thenReturn(Optional.of(testUser));

        Optional<UserEntity> result = userService.getUserByRut("12345678-9");

        assertTrue(result.isPresent());
        assertEquals(testUser.getRut(), result.get().getRut());
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        List<UserEntity> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        List<UserEntity> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void updateUser_ShouldUpdateAndReturnUser() {
        testUser.setPhoneNumber("+56987654321");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        UserEntity result = userService.updateUser(testUser);

        assertNotNull(result);
        assertEquals("+56987654321", result.getPhoneNumber());
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteUser_ShouldCallRepository() {
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void existsByEmail_WhenExists_ShouldReturnTrue() {
        when(userRepository.existsByEmail("juan.perez@email.com")).thenReturn(true);

        boolean result = userService.existsByEmail("juan.perez@email.com");

        assertTrue(result);
    }

    @Test
    void existsByRut_WhenExists_ShouldReturnTrue() {
        when(userRepository.existsByRut("12345678-9")).thenReturn(true);

        boolean result = userService.existsByRut("12345678-9");

        assertTrue(result);
    }

    @Test
    void validateLogin_WhenValidCredentials_ShouldReturnUser() {
        when(userRepository.findByEmail("juan.perez@email.com")).thenReturn(Optional.of(testUser));

        UserEntity result = userService.validateLogin("juan.perez@email.com", "password123");

        assertNotNull(result);
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    @Test
    void validateLogin_WhenUserNotFound_ShouldThrowException() {
        when(userRepository.findByEmail("nonexistent@email.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                userService.validateLogin("nonexistent@email.com", "password123")
        );
    }

    @Test
    void validateLogin_WhenIncorrectPassword_ShouldThrowException() {
        when(userRepository.findByEmail("juan.perez@email.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () ->
                userService.validateLogin("juan.perez@email.com", "wrongpassword")
        );
    }

    @Test
    void createUser_WithAllRoles() {
        for (UserEntity.UserRole role : UserEntity.UserRole.values()) {
            testUser.setRole(role);
            when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

            UserEntity result = userService.createUser(testUser);

            assertNotNull(result);
            assertEquals(role, result.getRole());
        }
    }

    @Test
    void updateUser_WithNewEmail_ShouldUpdate() {
        String newEmail = "nuevo.email@email.com";
        testUser.setEmail(newEmail);
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        UserEntity result = userService.updateUser(testUser);

        assertNotNull(result);
        assertEquals(newEmail, result.getEmail());
        verify(userRepository).save(testUser);
    }
}
