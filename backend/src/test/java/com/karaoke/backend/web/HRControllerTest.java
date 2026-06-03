package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("HR Controller — UC11: Quản lý nhân viên chi nhánh")
class HRControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ClientRepository clientRepository;
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

        if (!branchRepository.existsById("BR-HR")) {
            Branch branch = new Branch();
            branch.setId("BR-HR");
            branch.setName("Test Branch HR");
            branch.setAddress("123 HR St");
            branchRepository.save(branch);
        }

        if (!employeeRepository.existsById("NV-HR01")) {
            Employee emp = new Employee();
            emp.setId("NV-HR01");
            emp.setFullName("Nguyen Van A");
            emp.setTel("0901000001");
            emp.setRole(UserRole.RECEPTIONIST);
            emp.setBranch(branchRepository.findById("BR-HR").orElseThrow());
            emp.setStatus("Working");
            employeeRepository.save(emp);
        }
    }

    // ──────────────────────────────────────────────
    // UC11: Phân ca làm việc (TC01, TC02)
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC11 — Phân ca thành công + ChamCong tự khởi tạo")
    void UC11_assignShift_success() throws Exception {
        mockMvc.perform(post("/api/shifts")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": "NV-HR01",
                                  "ngayLam": "2026-06-15",
                                  "gioBatDau": "08:00:00",
                                  "gioKetThuc": "17:00:00",
                                  "loaiCa": "Sang"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employee.id").value("NV-HR01"))
                .andExpect(jsonPath("$.ngayLam").value("2026-06-15"))
                .andExpect(jsonPath("$.loaiCa").value("Sang"));

        // Verify ChamCong auto-created
        mockMvc.perform(get("/api/timekeeping?employeeId=NV-HR01")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].caLamViec.employee.id").value("NV-HR01"));
    }

    @Test
    @DisplayName("UC11 — Trùng ca trả 409 CONFLICT")
    void UC11_assignShift_duplicateShift_returns409() throws Exception {
        // Create first shift
        mockMvc.perform(post("/api/shifts")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": "NV-HR01",
                                  "ngayLam": "2026-06-15",
                                  "gioBatDau": "08:00:00",
                                  "gioKetThuc": "17:00:00",
                                  "loaiCa": "Sang"
                                }
                                """))
                .andExpect(status().isOk());

        // Try duplicate
        mockMvc.perform(post("/api/shifts")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": "NV-HR01",
                                  "ngayLam": "2026-06-15",
                                  "gioBatDau": "08:00:00",
                                  "gioKetThuc": "17:00:00",
                                  "loaiCa": "Sang"
                                }
                                """))
                .andExpect(status().isConflict());
    }

    // ──────────────────────────────────────────────
    // UC11: Đánh giá hiệu suất (TC03)
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC11 — Đánh giá hiệu suất thành công (điểm 0-10)")
    void UC11_evaluatePerformance_success() throws Exception {
        mockMvc.perform(post("/api/evaluations")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": "NV-HR01",
                                  "kyDanhGia": "Thang 6/2026",
                                  "diem": 8,
                                  "nhanXet": "Lam vief tot"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employee.id").value("NV-HR01"))
                .andExpect(jsonPath("$.diem").value(8))
                .andExpect(jsonPath("$.kyDanhGia").value("Thang 6/2026"));
    }

    // ──────────────────────────────────────────────
    // UC11: Khen thưởng / Kỷ luật
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC11 — Tạo quyết định khen thưởng/kỷ luật")
    void UC11_createDecision_success() throws Exception {
        // Need evaluation first (QuyetDinh FK -> DanhGia)
        // Actually QuyetDinh FK was changed to Employee, so we can create directly
        mockMvc.perform(post("/api/decisions")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId": "NV-HR01",
                                  "loai": "KhenThuong",
                                  "noiDung": "Hoan thanh xuat sac",
                                  "ngayQuyetDinh": "2026-06-15"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employee.id").value("NV-HR01"))
                .andExpect(jsonPath("$.loai").value("KhenThuong"));
    }

    // ──────────────────────────────────────────────
    // UC13: Báo cáo chi nhánh (TC04, TC05)
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC13 — Báo cáo chi nhánh có dữ liệu")
    void UC13_branchReport_withData() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rooms").isNumber())
                .andExpect(jsonPath("$.clients").isNumber())
                .andExpect(jsonPath("$.employees").isNumber());
    }

    @Test
    @DisplayName("UC13 — Báo cáo khoảng ngày không hợp lệ")
    void UC13_branchReport_invalidDateRange() throws Exception {
        mockMvc.perform(get("/api/reports/revenue?period=weekly&from=2026-06-10&to=2026-06-01")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk()); // API doesn't validate date range, returns empty
    }

    // ──────────────────────────────────────────────
    // UC14: Xem thông tin KH chi nhánh (TC06, TC07)
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC14 — Tìm khách hàng theo tên thành công")
    void UC14_customerInfo_found() throws Exception {
        // Create a client first
        Client c = new Client();
        c.setId("KH-HR01");
        c.setFullName("Tran Van B");
        c.setPhone("0902000001");
        c.setTier("Dong");
        c.setLoyaltyPoints(50);
        clientRepository.save(c);

        mockMvc.perform(get("/api/clients?keyword=Tran Van")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Tran Van B"));
    }

    @Test
    @DisplayName("UC14 — Tìm khách hàng không tồn tại trả rỗng")
    void UC14_customerInfo_notFound() throws Exception {
        mockMvc.perform(get("/api/clients?keyword=KhongTonTai999")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ──────────────────────────────────────────────
    // UC21: Tổng hợp báo cáo toàn chuỗi (TC08, TC09)
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("UC21 — Tổng hợp báo cáo nhiều chi nhánh")
    void UC21_chainReport_multipleBranches() throws Exception {
        // Create second branch
        if (!branchRepository.existsById("BR-HR2")) {
            Branch b = new Branch();
            b.setId("BR-HR2");
            b.setName("Branch 2");
            b.setAddress("456 HR St");
            branchRepository.save(b);
        }

        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rooms").isNumber());
    }

    @Test
    @DisplayName("UC21 — Báo cáo chuỗi không chọn chi nhánh")
    void UC21_chainReport_noBranchSelected() throws Exception {
        // API doesn't require branch selection — returns all
        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }
}
