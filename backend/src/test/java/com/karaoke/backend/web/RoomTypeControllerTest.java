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
                        .content("{\"id\":\"LT-VIP\",\"nameType\":\"VIP\",\"capacity\":15,\"price\":200000,\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("LT-VIP"))
                .andExpect(jsonPath("$.nameType").value("VIP"))
                .andExpect(jsonPath("$.capacity").value(15));

        // List
        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/room-types/LT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(200000));

        // Update
        mockMvc.perform(put("/api/room-types/LT-VIP")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nameType\":\"VIP Deluxe\",\"capacity\":20,\"price\":300000,\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameType").value("VIP Deluxe"))
                .andExpect(jsonPath("$.capacity").value(20));

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
                        .content("{\"id\":\"LT-THUONG\",\"nameType\":\"Thuong\",\"capacity\":8,\"price\":80000,\"status\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"LT-DELUXE\",\"nameType\":\"Deluxe\",\"capacity\":12,\"price\":150000,\"status\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
    }
}
