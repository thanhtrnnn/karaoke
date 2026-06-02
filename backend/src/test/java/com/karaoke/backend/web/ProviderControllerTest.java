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
class ProviderControllerTest {

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
    void provider_crud() throws Exception {
        // Create
        mockMvc.perform(post("/api/providers")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"NCC-TEST\",\"name\":\"Cong ty ABC\",\"address\":\"123 Nguyen Hue\",\"tel\":\"0901234567\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("NCC-TEST"))
                .andExpect(jsonPath("$.name").value("Cong ty ABC"));

        // List
        mockMvc.perform(get("/api/providers").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/providers/NCC-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Cong ty ABC"));

        // Update
        mockMvc.perform(put("/api/providers/NCC-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Cong ty XYZ\",\"address\":\"456 Le Loi\",\"tel\":\"0987654321\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Cong ty XYZ"));

        // Delete
        mockMvc.perform(delete("/api/providers/NCC-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        // Verify deleted
        mockMvc.perform(get("/api/providers/NCC-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    @Test
    void provider_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/providers"))
                .andExpect(status().isForbidden());
    }

    @Test
    void provider_create_persistsAllFields() throws Exception {
        mockMvc.perform(post("/api/providers")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"NCC-002\",\"name\":\"Nha cung cap B\",\"address\":\"789 Tran Hung Dao\",\"tel\":\"0911222333\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("789 Tran Hung Dao"))
                .andExpect(jsonPath("$.tel").value("0911222333"));
    }
}
