package com.karaoke.backend.repository;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("User Repository — UC01: Truy vấn tài khoản người dùng")
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
    @DisplayName("UC01 — findByUsername trả về user khi tồn tại")
    void UC01_findByUsername_returnsUser() {
        createUser("U1", "testuser", "test@example.com", UserRole.CLIENT);
        Optional<User> found = repository.findByUsername("testuser");
        assertTrue(found.isPresent());
        assertEquals("U1", found.get().getId());
    }

    @Test
    @DisplayName("UC01 — findByUsername trả về rỗng khi không tồn tại")
    void UC01_findByUsername_notFound_returnsEmpty() {
        Optional<User> found = repository.findByUsername("nonexistent");
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("UC01 — findByEmail trả về user khi tồn tại")
    void UC01_findByEmail_returnsUser() {
        createUser("U2", "user2", "user2@example.com", UserRole.ADMIN);
        Optional<User> found = repository.findByEmail("user2@example.com");
        assertTrue(found.isPresent());
        assertEquals("user2", found.get().getUsername());
    }

    @Test
    @DisplayName("UC01 — findByEmail trả về rỗng khi không tồn tại")
    void UC01_findByEmail_notFound_returnsEmpty() {
        Optional<User> found = repository.findByEmail("missing@example.com");
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("UC01 — existsByUsername trả true khi username đã tồn tại")
    void UC01_existsByUsername_true() {
        createUser("U3", "exists", "exists@example.com", UserRole.RECEPTIONIST);
        assertTrue(repository.existsByUsername("exists"));
    }

    @Test
    @DisplayName("UC01 — existsByUsername trả false khi username chưa tồn tại")
    void UC01_existsByUsername_false() {
        assertFalse(repository.existsByUsername("nope"));
    }

    @Test
    @DisplayName("UC01 — existsByEmail trả true khi email đã tồn tại")
    void UC01_existsByEmail_true() {
        createUser("U4", "user4", "user4@example.com", UserRole.SERVICE_STAFF);
        assertTrue(repository.existsByEmail("user4@example.com"));
    }

    @Test
    @DisplayName("UC01 — existsByEmail trả false khi email chưa tồn tại")
    void UC01_existsByEmail_false() {
        assertFalse(repository.existsByEmail("missing@example.com"));
    }
}
