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
 * Test tìm kiếm Dịch vụ/Sản phẩm + cảnh báo tồn kho (module Services).
 *
 * Dùng dữ liệu seed (DataSeeder):
 *  - SP001 "Bia Tiger", SP002 "Bia Heineken"  → khớp keyword "Bia"
 *  - SP011 "Nước suối"  currentStock=8 <= safetyStock=30  → cảnh báo tồn kho thấp
 *  - NCC001 "Công ty Bia Sài Gòn"  → khớp keyword "Bia"
 *  - TS001 "Micro karaoke"  → khớp keyword "Micro"
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ServicesSearchTest {

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

    // --- Tìm kiếm sản phẩm: keyword khớp nhiều kết quả (UC06/UC15) ---
    @Test
    void searchProducts_byKeywordBia_returnsAtLeastTwo() throws Exception {
        mockMvc.perform(get("/api/products?keyword=Bia").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));
    }

    // --- Tìm kiếm sản phẩm: keyword không tồn tại → mảng rỗng ---
    @Test
    void searchProducts_byUnknownKeyword_returnsEmptyArray() throws Exception {
        mockMvc.perform(get("/api/products?keyword=khongtontai999").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // --- Tìm kiếm tài sản phòng theo tên (TS001 "Micro karaoke") ---
    @Test
    void searchFacilities_byKeywordMicro_returnsAtLeastOne() throws Exception {
        mockMvc.perform(get("/api/facilities?keyword=Micro").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // --- Tìm kiếm nhà cung cấp theo tên (NCC001 "Công ty Bia Sài Gòn") ---
    @Test
    void searchProviders_byKeywordBia_returnsAtLeastOne() throws Exception {
        mockMvc.perform(get("/api/providers?keyword=Bia").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // --- Cảnh báo tồn kho thấp: SP011 "Nước suối" (8 <= 30) sinh thông báo ---
    @Test
    void notifications_returnsLowStockWarnings() throws Exception {
        mockMvc.perform(get("/api/reports/notifications").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }
}
