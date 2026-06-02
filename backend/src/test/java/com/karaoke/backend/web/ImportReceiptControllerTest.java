package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.ProviderRepository;
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
class ImportReceiptControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ProviderRepository providerRepository;
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

        if (!providerRepository.existsById("NCC-IR")) {
            Provider provider = new Provider();
            provider.setId("NCC-IR");
            provider.setName("NCC Test");
            provider.setAddress("123 Test");
            provider.setTel("0900000000");
            providerRepository.save(provider);
        }
    }

    @Test
    void importReceipt_createAndList() throws Exception {
        // Create
        mockMvc.perform(post("/api/import-receipts")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"PN-001\",\"maPhieu\":\"PN-2026-001\",\"totalCost\":500000,\"trangThai\":\"DaNhan\",\"provider\":{\"id\":\"NCC-IR\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("PN-001"))
                .andExpect(jsonPath("$.maPhieu").value("PN-2026-001"))
                .andExpect(jsonPath("$.totalCost").value(500000));

        // List
        mockMvc.perform(get("/api/import-receipts").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void importReceipt_getById() throws Exception {
        mockMvc.perform(post("/api/import-receipts")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"PN-002\",\"maPhieu\":\"PN-2026-002\",\"totalCost\":300000,\"trangThai\":\"DaNhan\",\"provider\":{\"id\":\"NCC-IR\"}}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/import-receipts/PN-002").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maPhieu").value("PN-2026-002"));
    }

    @Test
    void importReceipt_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/import-receipts"))
                .andExpect(status().isForbidden());
    }
}
