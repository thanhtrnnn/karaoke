package com.karaoke.backend.common;

import com.karaoke.backend.domain.UserAccount;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiExceptionHandlerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-ERRADMIN";

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("ERRADMIN")) {
            UserAccount admin = new UserAccount();
            admin.setId("ERRADMIN");
            admin.setUsername("erradmin");
            admin.setEmail("erradmin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("pass"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    @Test
    void entityNotFound_returns404() throws Exception {
        mockMvc.perform(get("/api/branches/NONEXISTENT")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void badRequest_returns400() throws Exception {
        mockMvc.perform(get("/api/branches/NONEXISTENT")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }
}
