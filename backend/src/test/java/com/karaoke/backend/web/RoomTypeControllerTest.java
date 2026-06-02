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
class RoomTypeControllerTest {

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
    void roomType_crud() throws Exception {
        // Create
        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"LT-VIP\",\"tenLoai\":\"VIP\",\"sucChua\":15,\"giaCuoc\":200000,\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("LT-VIP"))
                .andExpect(jsonPath("$.tenLoai").value("VIP"))
                .andExpect(jsonPath("$.sucChua").value(15));

        // List
        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/room-types/LT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.giaCuoc").value(200000));

        // Update
        mockMvc.perform(put("/api/room-types/LT-VIP")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenLoai\":\"VIP Deluxe\",\"sucChua\":20,\"giaCuoc\":300000,\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenLoai").value("VIP Deluxe"))
                .andExpect(jsonPath("$.sucChua").value(20));

        // Delete
        mockMvc.perform(delete("/api/room-types/LT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        // Verify deleted
        mockMvc.perform(get("/api/room-types/LT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    @Test
    void roomType_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/room-types"))
                .andExpect(status().isForbidden());
    }

    @Test
    void roomType_create_multipleTypes() throws Exception {
        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"LT-THUONG\",\"tenLoai\":\"Thuong\",\"sucChua\":8,\"giaCuoc\":80000,\"trangThai\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"LT-DELUXE\",\"tenLoai\":\"Deluxe\",\"sucChua\":12,\"giaCuoc\":150000,\"trangThai\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
    }
}
