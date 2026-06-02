package com.karaoke.backend.repository;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository repository;

    private User createUser(String id, String username, String email, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash("$2a$10$dummyhash");
        user.setRole(role);
        user.setActive(true);
        return repository.save(user);
    }

    @Test
    void findByUsername_returnsUser() {
        createUser("U1", "testuser", "test@example.com", UserRole.CLIENT);
        Optional<User> found = repository.findByUsername("testuser");
        assertTrue(found.isPresent());
        assertEquals("U1", found.get().getId());
    }

    @Test
    void findByUsername_notFound_returnsEmpty() {
        Optional<User> found = repository.findByUsername("nonexistent");
        assertFalse(found.isPresent());
    }

    @Test
    void findByEmail_returnsUser() {
        createUser("U2", "user2", "user2@example.com", UserRole.ADMIN);
        Optional<User> found = repository.findByEmail("user2@example.com");
        assertTrue(found.isPresent());
        assertEquals("user2", found.get().getUsername());
    }

    @Test
    void findByEmail_notFound_returnsEmpty() {
        Optional<User> found = repository.findByEmail("missing@example.com");
        assertFalse(found.isPresent());
    }

    @Test
    void existsByUsername_true() {
        createUser("U3", "exists", "exists@example.com", UserRole.RECEPTIONIST);
        assertTrue(repository.existsByUsername("exists"));
    }

    @Test
    void existsByUsername_false() {
        assertFalse(repository.existsByUsername("nope"));
    }

    @Test
    void existsByEmail_true() {
        createUser("U4", "user4", "user4@example.com", UserRole.SERVICE_STAFF);
        assertTrue(repository.existsByEmail("user4@example.com"));
    }

    @Test
    void existsByEmail_false() {
        assertFalse(repository.existsByEmail("missing@example.com"));
    }
}
