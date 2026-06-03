package com.karaoke.backend.web;

import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test pha kiểm thử (JUnit + MockMvc) cho Module Nhân sự & Báo cáo (UC11/UC13/UC14/UC21).
 *
 * Bao phủ tầng CONTROL trong {@link com.karaoke.backend.web.HrmControllers}:
 *   - ChiNhanhController        GET  /api/hrm/chi-nhanh
 *   - NhanVienController        GET  /api/hrm/nhan-vien/by-branch, /search
 *   - KhachHangController       GET  /api/hrm/khach-hang/search, /{maKH}/lich-su
 *   - BaoCaoController          GET  /api/hrm/bao-cao/create
 *   - BaoCaoChuoiController     POST /api/hrm/bao-cao-chuoi/aggregate (chỉ ADMIN)
 *   - DanhGiaController         POST /api/hrm/danh-gia/save
 *
 * Dùng dữ liệu seed sẵn (DataSeeder): chi nhánh CN001/CN002/CN003, nhân viên NV001..NV006,
 * khách hàng KH001..KH004. Xác thực bằng dev-token (Bearer dev-token-{userId}) — tạo
 * sẵn 2 user trong @BeforeEach: ADMIN và BRANCH_MANAGER để kiểm thử cả phân quyền.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class HrmControllersTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // ADMIN: toàn quyền HRM (gồm cả tổng hợp toàn chuỗi).
    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";
    // BRANCH_MANAGER: được dùng HRM cấp chi nhánh nhưng KHÔNG được tổng hợp toàn chuỗi.
    private static final String MANAGER_TOKEN = "Bearer dev-token-TESTMGR";

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
        if (!userRepository.existsById("TESTMGR")) {
            User manager = new User();
            manager.setId("TESTMGR");
            manager.setUsername("testmgr");
            manager.setEmail("testmgr@test.com");
            manager.setPasswordHash(passwordEncoder.encode("pass"));
            manager.setRole(UserRole.BRANCH_MANAGER);
            manager.setActive(true);
            userRepository.save(manager);
        }
    }

    // ─── UC21: ChiNhanhController ─────────────────────────────────────────────
    @Test
    void getBranches_returnsArrayWithAtLeastThreeBranches() throws Exception {
        mockMvc.perform(get("/api/hrm/chi-nhanh")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    // ─── UC11: NhanVienController.getStaffByBranch ────────────────────────────
    @Test
    void getStaffByBranch_CN001_returnsArray() throws Exception {
        mockMvc.perform(get("/api/hrm/nhan-vien/by-branch")
                        .param("maCN", "CN001")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ─── UC11: NhanVienController.searchStaff ─────────────────────────────────
    @Test
    void searchStaff_byKeyword_returnsArray() throws Exception {
        mockMvc.perform(get("/api/hrm/nhan-vien/search")
                        .param("keyword", "Nguyễn")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ─── UC14: KhachHangController.searchCustomer ─────────────────────────────
    @Test
    void searchCustomer_byKeyword_returnsMatchWithMaKhachHang() throws Exception {
        mockMvc.perform(get("/api/hrm/khach-hang/search")
                        .param("keyword", "Nguy")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[0].maKhachHang").exists());
    }

    // ─── UC14: KhachHangController.getHistory ─────────────────────────────────
    @Test
    void getCustomerHistory_KH004_returnsArray() throws Exception {
        mockMvc.perform(get("/api/hrm/khach-hang/{maKH}/lich-su", "KH004")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ─── UC13: BaoCaoController.createReport ──────────────────────────────────
    @Test
    void createReport_byPeriodAndBranch_returnsTongDoanhThu() throws Exception {
        mockMvc.perform(get("/api/hrm/bao-cao/create")
                        .param("period", "Thang")
                        .param("maCN", "CN001")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tongDoanhThu").exists());
    }

    // ─── UC21: BaoCaoChuoiController.aggregateChain — ADMIN OK ────────────────
    @Test
    void aggregateChain_asAdmin_returnsToanChuoiScope() throws Exception {
        String body = "{\"period\":\"Quy\",\"branches\":[\"CN001\",\"CN002\",\"CN003\"]}";
        mockMvc.perform(post("/api/hrm/bao-cao-chuoi/aggregate")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phamVi").value("toan-chuoi"))
                .andExpect(jsonPath("$.tongDoanhThu").exists());
    }

    // ─── BẢO MẬT (UC21): BRANCH_MANAGER KHÔNG được tổng hợp toàn chuỗi → 403 ───
    @Test
    void aggregateChain_asBranchManager_isForbidden() throws Exception {
        String body = "{\"period\":\"Quy\",\"branches\":[\"CN001\",\"CN002\",\"CN003\"]}";
        mockMvc.perform(post("/api/hrm/bao-cao-chuoi/aggregate")
                        .header("Authorization", MANAGER_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    // ─── UC11: DanhGiaController.saveEvaluation ───────────────────────────────
    @Test
    void saveEvaluation_validBody_returnsOk() throws Exception {
        String body = "{\"maNhanVien\":\"NV001\",\"kyDanhGia\":\"2026-Q2\",\"diem\":80,\"nhanXet\":\"ok\"}";
        mockMvc.perform(post("/api/hrm/danh-gia/save")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kyDanhGia").value("2026-Q2"))
                .andExpect(jsonPath("$.diem").value(80));
    }
}
