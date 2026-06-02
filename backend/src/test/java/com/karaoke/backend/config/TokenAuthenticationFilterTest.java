package com.karaoke.backend.config;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Module 1 — Tài khoản & Thành viên (UC01 – Đăng nhập / xác thực token)
 * Tests: token validation, role-based access, session checks
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TokenAuthenticationFilterTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private void createUser(String id, String username, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@test.com");
        user.setPasswordHash(passwordEncoder.encode("pass"));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }

    @Test
    void validToken_setsAuthentication() throws Exception {
        createUser("AUTH001", "authtest", UserRole.ADMIN);

        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-AUTH001"))
                .andExpect(status().isOk());
    }

    @Test
    void invalidToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void nonexistentUserId_returns403() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-NONEXISTENT"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isForbidden());
    }

    // UC01 — mọi role đều authenticate được với valid token
    @Test
    void correctRoleMapping_allRoles() throws Exception {
        for (UserRole role : UserRole.values()) {
            String id = "ROLE-" + role.name();
            createUser(id, "user-" + role.name().toLowerCase(), role);

            mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-" + id))
                    .andExpect(status().isOk());
        }
    }

    // Người dùng bị vô hiệu hóa (active=false) không truy cập được
    @Test
    void inactiveUser_returns403() throws Exception {
        User inactive = new User();
        inactive.setId("INACTIVE01");
        inactive.setUsername("inactiveuser");
        inactive.setEmail("inactive@test.com");
        inactive.setPasswordHash(passwordEncoder.encode("pass"));
        inactive.setRole(UserRole.CLIENT);
        inactive.setActive(false);
        userRepository.save(inactive);

        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-INACTIVE01"))
                .andExpect(status().isForbidden());
    }
}
