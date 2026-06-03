package com.karaoke.backend.web;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
 * Module Booking — UC05 Tìm phòng trống (searchFreeRoom).
 * Kiểm thử endpoint GET /api/bookings/search-free với dữ liệu seed:
 *   - CN001: P01, P04, P05 ở trạng thái AVAILABLE
 *   - CN002: P21, P23 ở trạng thái AVAILABLE
 * Tham số (tất cả không bắt buộc): branchId, startTime, endTime, roomType.
 * Định dạng thời gian: ISO_DATE_TIME (yyyy-MM-ddTHH:mm:ss).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Booking Search Free — UC05: Tìm phòng trống")
class BookingSearchFreeTest {

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

    // CN001 có 3 phòng AVAILABLE trong seed (P01, P04, P05) → mảng, ít nhất 1 phần tử.
    @Test
    @DisplayName("UC05 — Tìm phòng trống CN001 trả về ít nhất 1 phòng AVAILABLE")
    void UC05_searchFree_branchCN001_returnsAvailableRooms() throws Exception {
        mockMvc.perform(get("/api/bookings/search-free")
                        .param("branchId", "CN001")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // CN002 có 2 phòng AVAILABLE trong seed (P21, P23) → mảng, ít nhất 1 phần tử.
    @Test
    @DisplayName("UC05 — Tìm phòng trống CN002 trả về ít nhất 1 phòng AVAILABLE")
    void UC05_searchFree_branchCN002_returnsAvailableRooms() throws Exception {
        mockMvc.perform(get("/api/bookings/search-free")
                        .param("branchId", "CN002")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }

    // Không truyền tham số → trả tất cả phòng AVAILABLE (mọi chi nhánh) → mảng.
    @Test
    @DisplayName("UC05 — Tìm phòng trống không tham số trả về tất cả AVAILABLE")
    void UC05_searchFree_noParams_returnsArray() throws Exception {
        mockMvc.perform(get("/api/bookings/search-free")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(0)));
    }

    // Có khoảng thời gian (ISO_DATE_TIME) ở tương lai xa → không booking nào trùng
    // nên vẫn trả các phòng AVAILABLE của CN001 → mảng, ít nhất 1 phần tử.
    @Test
    @DisplayName("UC05 — Tìm phòng trống CN001 với khoảng thời gian trả về kết quả")
    void UC05_searchFree_branchCN001_withTimeRange_returnsArray() throws Exception {
        mockMvc.perform(get("/api/bookings/search-free")
                        .param("branchId", "CN001")
                        .param("startTime", "2030-01-01T10:00:00")
                        .param("endTime", "2030-01-01T12:00:00")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)));
    }
}
