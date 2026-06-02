package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private EmployeeRepository employeeRepository;
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

    // --- Branch CRUD ---
    @Test
    void branch_crud() throws Exception {
        mockMvc.perform(post("/api/branches")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BR-TEST\",\"name\":\"Test Branch\",\"address\":\"123 Test St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("BR-TEST"))
                .andExpect(jsonPath("$.name").value("Test Branch"));

        mockMvc.perform(get("/api/branches").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Branch"));

        mockMvc.perform(put("/api/branches/BR-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated Branch\",\"address\":\"456 New St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Branch"));

        mockMvc.perform(delete("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    // --- Client CRUD (was Customer) ---
    @Test
    void client_crud() throws Exception {
        mockMvc.perform(post("/api/clients")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KH-TEST\",\"fullName\":\"Test Client\",\"phone\":\"0909999999\",\"tier\":\"Dong\",\"points\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KH-TEST"));

        mockMvc.perform(get("/api/clients").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/clients/KH-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated Client\",\"phone\":\"0909999999\",\"tier\":\"Bac\",\"points\":100}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Client"));

        mockMvc.perform(delete("/api/clients/KH-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Room CRUD + PATCH status (room needs RoomType) ---
    @Test
    void room_crudAndPatchStatus() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-ROOM");
        branch.setName("Branch for Room");
        branchRepository.save(branch);

        RoomType rt = new RoomType();
        rt.setId("RT-TEST");
        rt.setTenLoai("VIP");
        rt.setSucChua(10);
        rt.setGiaCuoc(new BigDecimal("100000"));
        rt.setTrangThai(true);
        roomTypeRepository.save(rt);

        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"RM-TEST\",\"name\":\"Test Room\",\"roomType\":{\"id\":\"RT-TEST\"},\"capacity\":10,\"hourlyPrice\":100000,\"status\":\"AVAILABLE\",\"branch\":{\"id\":\"BR-ROOM\"}}"))
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

    // --- Product CRUD (was MenuItem at /api/menu-items) ---
    @Test
    void product_crud() throws Exception {
        mockMvc.perform(post("/api/products")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"SP-TEST\",\"name\":\"Test Product\",\"category\":\"Do uong\",\"price\":30000,\"stock\":10,\"soLuongToiThieu\":5,\"active\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("SP-TEST"));

        mockMvc.perform(get("/api/products?category=Do uong").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/products/SP-TEST").header("Authorization", ADMIN_TOKEN))
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

    // --- RoomType CRUD ---
    @Test
    void roomType_crud() throws Exception {
        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"RT-VIP\",\"tenLoai\":\"VIP\",\"sucChua\":12,\"giaCuoc\":150000,\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("RT-VIP"))
                .andExpect(jsonPath("$.tenLoai").value("VIP"));

        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(put("/api/room-types/RT-VIP")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenLoai\":\"VIP Plus\",\"sucChua\":15,\"giaCuoc\":200000,\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenLoai").value("VIP Plus"));

        mockMvc.perform(delete("/api/room-types/RT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Promotion CRUD ---
    @Test
    void promotion_crud() throws Exception {
        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KM-001\",\"tenKhuyenMai\":\"Giam 10%\",\"loai\":\"PhanTram\",\"giaTriGiam\":10,\"ngayBatDau\":\"2026-01-01\",\"ngayKetThuc\":\"2026-12-31\",\"trangThai\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KM-001"))
                .andExpect(jsonPath("$.tenKhuyenMai").value("Giam 10%"));

        mockMvc.perform(get("/api/promotions").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(delete("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Protected endpoints without token return 403 ---
    @Test
    void protectedEndpoints_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/clients")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/rooms")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/room-types")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/promotions")).andExpect(status().isForbidden());
    }
}
