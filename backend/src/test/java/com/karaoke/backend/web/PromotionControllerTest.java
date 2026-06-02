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
                        .content("{\"id\":\"KM-001\",\"tenKhuyenMai\":\"Giam 20%\",\"loai\":\"PhanTram\",\"giaTriGiam\":20,\"ngayBatDau\":\"2026-01-01\",\"ngayKetThuc\":\"2026-06-30\",\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KM-001"))
                .andExpect(jsonPath("$.tenKhuyenMai").value("Giam 20%"))
                .andExpect(jsonPath("$.loai").value("PhanTram"));

        // List
        mockMvc.perform(get("/api/promotions").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.giaTriGiam").value(20));

        // Update
        mockMvc.perform(put("/api/promotions/KM-001")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenKhuyenMai\":\"Giam 30%\",\"loai\":\"PhanTram\",\"giaTriGiam\":30,\"ngayBatDau\":\"2026-01-01\",\"ngayKetThuc\":\"2026-12-31\",\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.giaTriGiam").value(30));

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
                        .content("{\"id\":\"KM-002\",\"tenKhuyenMai\":\"Giam 50000d\",\"loai\":\"SoTien\",\"giaTriGiam\":50000,\"ngayBatDau\":\"2026-06-01\",\"ngayKetThuc\":\"2026-06-30\",\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loai").value("SoTien"))
                .andExpect(jsonPath("$.giaTriGiam").value(50000));
    }
}
