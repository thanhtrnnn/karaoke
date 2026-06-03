package com.karaoke.backend.web;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test khẳng định DỮ LIỆU SEED pha kiểm thử (DataSeeder) đã được nạp đầy đủ.
 *
 * <p>DataSeeder chạy một lần lúc khởi động application context (CommandLineRunner) trên DB dùng
 * chung, nên dữ liệu test-phase có mặt sẵn khi các test này chạy. Mỗi test dùng token admin
 * (Bearer dev-token-TESTADMIN) — giống template CrudControllersTest — và kiểm tra mảng trả về
 * có độ dài tối thiểu đúng với số bản ghi đã seed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SeedDataIntegrityTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

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

    // CORE — seed CN001, CN002, CN003 ⇒ ≥ 3 chi nhánh
    @Test
    void seed_branches_atLeast3() throws Exception {
        mockMvc.perform(get("/api/branches").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    // HR — seed NV001..NV006 ⇒ ≥ 6 nhân viên
    @Test
    void seed_employees_atLeast6() throws Exception {
        mockMvc.perform(get("/api/employees").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(6)));
    }

    // CRM — seed KH001..KH004 ⇒ ≥ 4 khách hàng
    @Test
    void seed_clients_atLeast4() throws Exception {
        mockMvc.perform(get("/api/clients").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(4)));
    }

    // SERVICES (UC06) — seed ORD001..ORD004 ⇒ là mảng, ≥ 4 (tối thiểu ≥ 1)
    @Test
    void seed_orders_atLeast4() throws Exception {
        mockMvc.perform(get("/api/orders").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(4)));
    }

    // SERVICES (UC09) — seed BC001 ⇒ ≥ 1 báo cáo hư hỏng
    @Test
    void seed_damageReports_atLeast1() throws Exception {
        mockMvc.perform(get("/api/damage-reports").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // SERVICES (UC12) — seed PN001 ⇒ ≥ 1 phiếu nhập kho
    @Test
    void seed_importReceipts_atLeast1() throws Exception {
        mockMvc.perform(get("/api/import-receipts").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // HR (UC11) — seed 3 ca làm việc ⇒ ≥ 3 ca
    @Test
    void seed_shifts_atLeast3() throws Exception {
        mockMvc.perform(get("/api/shifts").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    // HR (UC11) — seed dg1, dg2, dg3 ⇒ ≥ 3 đánh giá
    @Test
    void seed_evaluations_atLeast3() throws Exception {
        mockMvc.perform(get("/api/evaluations").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    // HR (UC11) — seed qd1 ⇒ ≥ 1 quyết định
    @Test
    void seed_decisions_atLeast1() throws Exception {
        mockMvc.perform(get("/api/decisions").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // BILLING (UC14) — seed HD001, HD002 ⇒ ≥ 2 hóa đơn phòng
    @Test
    void seed_roomReceipts_atLeast2() throws Exception {
        mockMvc.perform(get("/api/room-receipts").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));
    }
}
