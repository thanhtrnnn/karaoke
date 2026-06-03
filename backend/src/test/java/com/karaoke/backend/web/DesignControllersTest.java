package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Kiểm thử tầng CONTROL theo TÀI LIỆU THIẾT KẾ (module Account / Core) cùng với
 * cập nhật hồ sơ (Profile). Bao phủ các lớp:
 *   LoginController            → GET  /api/design/login/check
 *   StaffController            → GET  /api/design/staff
 *   DesignCustomerController   → GET  /api/design/customer
 *   DesignMembershipTier...    → GET  /api/design/membership-tier
 *   ProfileController          → GET  /api/design/profile/{id}
 *   AuthController.updateProfile→ PUT  /api/auth/profile
 *
 * Các endpoint /api/design/** yêu cầu đăng nhập → gửi kèm token của tài khoản
 * seed (admin = USR001) dưới dạng "Bearer dev-token-USR001".
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Design Controllers — Kiểm thử tầng thiết kế (Account / Core / Profile)")
class DesignControllersTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Tài khoản admin được seed sẵn (DataSeeder): id=USR001, username=admin, pass=admin123.
    private static final String ADMIN_TOKEN = "Bearer dev-token-USR001";

    // ─── LoginController: checkLogin(username, password) : boolean ────────────────

    @Test
    @DisplayName("UC01 — Kiểm tra đăng nhập đúng mật khẩu trả true")
    void login_check_correctCredentials_returnsTrue() throws Exception {
        mockMvc.perform(get("/api/design/login/check")
                        .header("Authorization", ADMIN_TOKEN)
                        .param("username", "admin")
                        .param("password", "admin123"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    @DisplayName("UC01 — Kiểm tra đăng nhập sai mật khẩu trả false")
    void login_check_wrongPassword_returnsFalse() throws Exception {
        mockMvc.perform(get("/api/design/login/check")
                        .header("Authorization", ADMIN_TOKEN)
                        .param("username", "admin")
                        .param("password", "sai"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    // ─── StaffController: getAllStaff() : List<Employee> ──────────────────────────

    @Test
    @DisplayName("UC11 — Lấy danh sách nhân viên trả về mảng có ≥ 3 phần tử")
    void staff_getAll_returnsArrayWithSeededEmployees() throws Exception {
        mockMvc.perform(get("/api/design/staff")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
    }

    // ─── DesignCustomerController: searchCustomers(keyword) : List<Customer> ───────

    @Test
    @DisplayName("UC17 — Tìm kiếm khách hàng theo keyword trả về kết quả có hoTen")
    void customer_search_byKeyword_returnsMatchesWithHoTen() throws Exception {
        mockMvc.perform(get("/api/design/customer")
                        .header("Authorization", ADMIN_TOKEN)
                        .param("keyword", "Nguy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[0].hoTen").exists());
    }

    // ─── DesignMembershipTierController: getAllTiers() : List<MembershipTier> ──────

    @Test
    @DisplayName("UC18 — Lấy danh sách hạng hội viên trả về mảng")
    void membershipTier_getAll_returnsArray() throws Exception {
        mockMvc.perform(get("/api/design/membership-tier")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ─── ProfileController: getProfile(id) : User ─────────────────────────────────

    @Test
    @DisplayName("UC01 — Lấy thông tin profile theo ID trả về user admin")
    void profile_getById_returnsAdminUser() throws Exception {
        mockMvc.perform(get("/api/design/profile/USR001")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"));
    }

    // ─── AuthController.updateProfile: PUT /api/auth/profile (public route) ────────

    @Test
    @DisplayName("UC01 — Cập nhật profile trả về thông tin đã cập nhật")
    void auth_updateProfile_returnsUpdatedAdmin() throws Exception {
        mockMvc.perform(put("/api/auth/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String username = "admin";
                                    public final String fullName = "Quản Trị";
                                    public final String email = "admin@karaoke.local";
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"));
    }
}
