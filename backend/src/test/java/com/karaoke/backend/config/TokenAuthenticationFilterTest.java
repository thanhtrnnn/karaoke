package com.karaoke.backend.config;

import com.karaoke.backend.domain.UserAccount;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TokenAuthenticationFilterTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private void createUser(String id, String username, UserRole role) {
        UserAccount user = new UserAccount();
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
    void invalidToken_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void nonexistentUserId_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-NONEXISTENT"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isForbidden());
    }

    @Test
    void correctRoleMapping_allRoles() throws Exception {
        for (UserRole role : UserRole.values()) {
            String id = "ROLE-" + role.name();
            createUser(id, "user-" + role.name().toLowerCase(), role);

            mockMvc.perform(get("/api/branches").header("Authorization", "Bearer dev-token-" + id))
                    .andExpect(status().isOk());
        }
    }
}
