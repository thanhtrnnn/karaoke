package com.karaoke.backend.config;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Module 1 — UC01: Đăng nhập / xác thực token
 * Tests: token validation, role-based access, session checks
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Token Authentication Filter — UC01: Xác thực token & phân quyền")
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
    @DisplayName("UC01 — Token hợp lệ xác thực thành công")
    void validToken_setsAuthentication() throws Exception {
        createUser("AUTH001", "authtest", UserRole.ADMIN);

        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-AUTH001"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("UC01 — Token không hợp lệ trả 403")
    void invalidToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("UC01 — Token của user không tồn tại trả 403")
    void nonexistentUserId_returns403() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-NONEXISTENT"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("UC01 — Không có token trả 403")
    void noToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isForbidden());
    }

    // UC01 — mọi role đều authenticate được với valid token
    @Test
    @DisplayName("UC01 — Mọi role đều xác thực được với valid token")
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
    @DisplayName("UC01 — User bị vô hiệu hóa trả 403")
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
