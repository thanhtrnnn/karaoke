package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.EmployeeRepository;
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
class DamageReportControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

        if (!employeeRepository.existsById("EMP-DR")) {
            Employee emp = new Employee();
            emp.setId("EMP-DR");
            emp.setFullName("Test Employee");
            emp.setRole(UserRole.SERVICE_STAFF);
            employeeRepository.save(emp);
        }
    }

    @Test
    void damageReport_createAndList() throws Exception {
        // Create
        mockMvc.perform(post("/api/damage-reports")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BC-001\",\"maBaoCao\":\"BC-2026-001\",\"trangThai\":\"ChoXuLy\",\"employee\":{\"id\":\"EMP-DR\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("BC-001"))
                .andExpect(jsonPath("$.maBaoCao").value("BC-2026-001"))
                .andExpect(jsonPath("$.trangThai").value("ChoXuLy"));

        // List
        mockMvc.perform(get("/api/damage-reports").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void damageReport_updateStatus() throws Exception {
        // Create first
        mockMvc.perform(post("/api/damage-reports")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BC-002\",\"maBaoCao\":\"BC-2026-002\",\"trangThai\":\"ChoXuLy\",\"employee\":{\"id\":\"EMP-DR\"}}"))
                .andExpect(status().isOk());

        // Update status
        mockMvc.perform(put("/api/damage-reports/BC-002")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"maBaoCao\":\"BC-2026-002\",\"trangThai\":\"DaXuLy\",\"employee\":{\"id\":\"EMP-DR\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("DaXuLy"));
    }

    @Test
    void damageReport_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/damage-reports"))
                .andExpect(status().isForbidden());
    }
}
