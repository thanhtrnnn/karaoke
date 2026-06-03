package com.karaoke.backend.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Module 1 — Kiểm soát truy cập (phân quyền endpoint)
 * Tests: public vs protected endpoints, CORS preflight
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Security Config — Kiểm soát truy cập & phân quyền endpoint")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoint /api/health truy cập không cần xác thực")
    void publicEndpoint_health_withoutAuth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoint / truy cập không cần xác thực")
    void publicEndpoint_root_withoutAuth() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoint /api/auth/login trả 400 khi user không tồn tại")
    void publicEndpoint_authLogin_withoutAuth() throws Exception {
        // 400 vì user không tồn tại, không phải 401/403
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"usernameOrEmail\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Protected endpoints trả 403 khi không có token")
    void protectedEndpoints_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/branches")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/orders")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/rooms")).andExpect(status().isForbidden());
        // Module 1: /api/clients (đã đổi từ /api/customers)
        mockMvc.perform(get("/api/clients")).andExpect(status().isForbidden());
        // Module 3: /api/room-types, /api/membership
        mockMvc.perform(get("/api/room-types")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/membership/tiers")).andExpect(status().isForbidden());
        // Module 4: /api/providers, /api/import-receipts, /api/damage-reports
        mockMvc.perform(get("/api/providers")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/import-receipts")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/damage-reports")).andExpect(status().isForbidden());
        // Module 5: /api/reports
        mockMvc.perform(get("/api/reports/summary")).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("OPTIONS request được phép (CORS preflight)")
    void optionsRequests_permitted() throws Exception {
        mockMvc.perform(options("/api/branches"))
                .andExpect(status().isOk());
    }
}
