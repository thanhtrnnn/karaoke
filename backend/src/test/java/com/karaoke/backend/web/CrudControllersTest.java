package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CrudControllersTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("TESTADMIN")) {
            UserAccount admin = new UserAccount();
            admin.setId("TESTADMIN");
            admin.setUsername("testadmin");
            admin.setEmail("testadmin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("pass"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    // --- Branch CRUD ---
    @Test
    void branch_crud() throws Exception {
        // Create
        mockMvc.perform(post("/api/branches")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BR-TEST\",\"name\":\"Test Branch\",\"address\":\"123 Test St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("BR-TEST"))
                .andExpect(jsonPath("$.name").value("Test Branch"));

        // List
        mockMvc.perform(get("/api/branches").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get
        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Branch"));

        // Update
        mockMvc.perform(put("/api/branches/BR-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated Branch\",\"address\":\"456 New St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Branch"));

        // Delete
        mockMvc.perform(delete("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        // Verify 404
        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    // --- Customer CRUD ---
    @Test
    void customer_crud() throws Exception {
        mockMvc.perform(post("/api/customers")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KH-TEST\",\"fullName\":\"Test Customer\",\"phone\":\"0909999999\",\"tier\":\"Dong\",\"points\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KH-TEST"));

        mockMvc.perform(get("/api/customers").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/customers/KH-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated Customer\",\"phone\":\"0909999999\",\"tier\":\"Bac\",\"points\":100}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Customer"));

        mockMvc.perform(delete("/api/customers/KH-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Room CRUD + PATCH status ---
    @Test
    void room_crudAndPatchStatus() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-ROOM");
        branch.setName("Branch for Room");
        branchRepository.save(branch);

        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"RM-TEST\",\"name\":\"Test Room\",\"type\":\"VIP\",\"capacity\":10,\"hourlyPrice\":100000,\"status\":\"AVAILABLE\",\"branch\":{\"id\":\"BR-ROOM\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        mockMvc.perform(patch("/api/rooms/RM-TEST/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"OCCUPIED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OCCUPIED"));

        mockMvc.perform(delete("/api/rooms/RM-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- MenuItem CRUD ---
    @Test
    void menuItem_crud() throws Exception {
        mockMvc.perform(post("/api/menu-items")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"SP-TEST\",\"name\":\"Test Item\",\"category\":\"Do uong\",\"price\":30000,\"stock\":10,\"active\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("SP-TEST"));

        mockMvc.perform(get("/api/menu-items?category=Do uong").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/menu-items/SP-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Employee CRUD ---
    @Test
    void employee_crud() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-EMP");
        branch.setName("Branch for Employee");
        branchRepository.save(branch);

        mockMvc.perform(post("/api/employees")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"NV-TEST\",\"fullName\":\"Test Employee\",\"phone\":\"0988888888\",\"role\":\"RECEPTIONIST\",\"branch\":{\"id\":\"BR-EMP\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("NV-TEST"));

        mockMvc.perform(get("/api/employees").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/employees/NV-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Protected endpoint without token ---
    @Test
    void protectedEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isForbidden());
    }
}
