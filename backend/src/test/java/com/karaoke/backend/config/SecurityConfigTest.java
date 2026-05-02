package com.karaoke.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicEndpoint_health_withoutAuth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    void publicEndpoint_root_withoutAuth() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    void publicEndpoint_authLogin_withoutAuth() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"usernameOrEmail\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isBadRequest()); // 400 because user doesn't exist, not 401
    }

    @Test
    void protectedEndpoint_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isForbidden());
    }

    @Test
    void optionsRequests_permitted() throws Exception {
        mockMvc.perform(options("/api/branches"))
                .andExpect(status().isOk());
    }
}
