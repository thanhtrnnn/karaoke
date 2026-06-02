package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PromotionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("TESTADMIN")) {
            User admin = new User();
            admin.setId("TESTADMIN");
            admin.setUsername("testadmin");
            admin.setEmail("testadmin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("pass"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    @Test
    void promotion_crud() throws Exception {
        // Create
        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KM-001\",\"name\":\"Giam 20%\",\"type\":\"PhanTram\",\"redeem\":20,\"startDate\":\"2026-01-01\",\"validUntil\":\"2026-06-30\",\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KM-001"))
                .andExpect(jsonPath("$.name").value("Giam 20%"))
                .andExpect(jsonPath("$.type").value("PhanTram"));

        // List
        mockMvc.perform(get("/api/promotions").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.redeem").value(20));

        // Update
        mockMvc.perform(put("/api/promotions/KM-001")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Giam 30%\",\"type\":\"PhanTram\",\"redeem\":30,\"startDate\":\"2026-01-01\",\"validUntil\":\"2026-12-31\",\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.redeem").value(30));

        // Delete
        mockMvc.perform(delete("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    @Test
    void promotion_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/promotions"))
                .andExpect(status().isForbidden());
    }

    @Test
    void promotion_fixedAmount_type() throws Exception {
        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KM-002\",\"name\":\"Giam 50000d\",\"type\":\"SoTien\",\"redeem\":50000,\"startDate\":\"2026-06-01\",\"validUntil\":\"2026-06-30\",\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SoTien"))
                .andExpect(jsonPath("$.redeem").value(50000));
    }
}
