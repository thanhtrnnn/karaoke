package com.karaoke.backend.web;

import com.karaoke.backend.domain.CaLamViec;
import com.karaoke.backend.domain.ChamCong;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.DanhGia;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.QuyetDinh;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomReceipt;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.hrm.BaoCao;
import com.karaoke.backend.hrm.ChiNhanh;
import com.karaoke.backend.hrm.DanhGiaNhanVien;
import com.karaoke.backend.hrm.HoaDon;
import com.karaoke.backend.hrm.KhachHang;
import com.karaoke.backend.repository.BranchRepository;
import com.karaoke.backend.repository.CaLamViecRepository;
import com.karaoke.backend.repository.ChamCongRepository;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.DanhGiaRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.QuyetDinhRepository;
import com.karaoke.backend.repository.RoomReceiptRepository;
import com.karaoke.backend.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// =====================================================================================
// Tầng CONTROL đúng tên TÀI LIỆU THIẾT KẾ (Module Nhân sự & Báo cáo).
// Mỗi lớp khớp 1-1 với lớp Control trong báo cáo (NhanVienController, CaLamViecController,
// DanhGiaController, QuyetDinhController, BaoCaoController, KhachHangController,
// ChiNhanhController, BaoCaoChuoiController) — wrapper mỏng, ủy quyền (delegate) sang
// repository/logic hiện có. Mount dưới /api/hrm/** để không đụng route đang chạy.
// =====================================================================================

// ─── UC11: NhanVienController ─────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/nhan-vien")
@Tag(name = "HRM - NhanVienController", description = "UC11 — Quản lý nhân viên chi nhánh (thiết kế)")
class NhanVienController {
    private final EmployeeRepository employees;

    NhanVienController(EmployeeRepository employees) { this.employees = employees; }

    @GetMapping("/by-branch") @Operation(summary = "getStaffByBranch(maCN) : List<Employee>")
    List<Employee> getStaffByBranch(@RequestParam(required = false) String maCN) {
        return (maCN == null || maCN.isBlank()) ? employees.findAll() : employees.findByBranchId(maCN);
    }

    @GetMapping("/search") @Operation(summary = "searchStaff(keyword, maCN) : List<Employee>")
    List<Employee> searchStaff(@RequestParam String keyword, @RequestParam(required = false) String maCN) {
        String kw = keyword == null ? "" : keyword.toLowerCase();
        return employees.findAll().stream()
                .filter(e -> maCN == null || maCN.isBlank()
                        || (e.getBranch() != null && maCN.equals(e.getBranch().getId())))
                .filter(e -> e.getFullName() != null && e.getFullName().toLowerCase().contains(kw))
                .toList();
    }
}

// ─── UC11: CaLamViecController ────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/ca-lam-viec")
@Tag(name = "HRM - CaLamViecController", description = "UC11 — Phân ca làm việc (thiết kế)")
class HrmCaLamViecController {
    private final CaLamViecRepository shifts;
    private final ChamCongRepository chamCong;
    private final EmployeeRepository employees;

    HrmCaLamViecController(CaLamViecRepository shifts, ChamCongRepository chamCong, EmployeeRepository employees) {
        this.shifts = shifts; this.chamCong = chamCong; this.employees = employees;
    }

    @GetMapping("/check-duplicate") @Operation(summary = "checkDuplicate(ca) : boolean")
    boolean checkDuplicate(@RequestParam String maNhanVien,
                           @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate ngayLam,
                           @RequestParam String loaiCa) {
        return shifts.existsDuplicateShift(maNhanVien, ngayLam, loaiCa);
    }

    @PostMapping("/assign-shift") @Operation(summary = "assignShift(ca) : CaLamViec (tự tạo ChamCong)")
    @Transactional
    CaLamViec assignShift(@RequestBody AssignShiftRequest req) {
        Employee employee = employees.findById(req.maNhanVien())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + req.maNhanVien()));
        if (shifts.existsDuplicateShift(req.maNhanVien(), req.ngayLam(), req.loaiCa())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Nhân viên đã có ca " + req.loaiCa() + " trong ngày " + req.ngayLam());
        }
        CaLamViec shift = new CaLamViec();
        shift.setEmployee(employee);
        shift.setNgayLam(req.ngayLam());
        shift.setGioBatDau(req.gioBatDau());
        shift.setGioKetThuc(req.gioKetThuc());
        shift.setLoaiCa(req.loaiCa());
        CaLamViec saved = shifts.save(shift);
        ChamCong cc = new ChamCong();
        cc.setCaLamViec(saved);
        cc.setTrangThai("Pending");
        chamCong.save(cc);
        return saved;
    }

    record AssignShiftRequest(String maNhanVien, LocalDate ngayLam, LocalTime gioBatDau, LocalTime gioKetThuc, String loaiCa) {}
}

// ─── UC11: DanhGiaController ──────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/danh-gia")
@Tag(name = "HRM - DanhGiaController", description = "UC11 — Đánh giá hiệu suất (thiết kế)")
class HrmDanhGiaController {
    private final DanhGiaRepository danhGia;
    private final EmployeeRepository employees;

    HrmDanhGiaController(DanhGiaRepository danhGia, EmployeeRepository employees) {
        this.danhGia = danhGia; this.employees = employees;
    }

    @PostMapping("/save") @Operation(summary = "saveEvaluation(dg : DanhGiaNhanVien) : boolean")
    @Transactional
    DanhGia saveEvaluation(@RequestBody DanhGiaNhanVien dg) {
        Employee employee = employees.findById(dg.maNhanVien())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + dg.maNhanVien()));
        DanhGia entity = new DanhGia();
        entity.setEmployee(employee);
        entity.setKyDanhGia(dg.kyDanhGia());
        entity.setDiem(dg.diem());
        entity.setNhanXet(dg.nhanXet());
        entity.setNgayDanhGia(LocalDate.now());
        return danhGia.save(entity);
    }
}

// ─── UC11: QuyetDinhController ────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/quyet-dinh")
@Tag(name = "HRM - QuyetDinhController", description = "UC11 — Khen thưởng/kỷ luật (thiết kế)")
class HrmQuyetDinhController {
    private final QuyetDinhRepository quyetDinh;
    private final EmployeeRepository employees;

    HrmQuyetDinhController(QuyetDinhRepository quyetDinh, EmployeeRepository employees) {
        this.quyetDinh = quyetDinh; this.employees = employees;
    }

    @PostMapping("/save") @Operation(summary = "saveDecision(qd : QuyetDinh) : boolean")
    @Transactional
    QuyetDinh saveDecision(@RequestBody SaveDecisionRequest req) {
        Employee employee = employees.findById(req.maNhanVien())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + req.maNhanVien()));
        QuyetDinh qd = new QuyetDinh();
        qd.setEmployee(employee);
        qd.setLoai(req.loai());
        qd.setNoiDung(req.noiDung());
        qd.setNgayQuyetDinh(LocalDate.now());
        return quyetDinh.save(qd);
    }

    record SaveDecisionRequest(String maNhanVien, String loai, String noiDung) {}
}

// ─── UC13: BaoCaoController ───────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/bao-cao")
@Tag(name = "HRM - BaoCaoController", description = "UC13 — Báo cáo số liệu chi nhánh (thiết kế)")
class HrmBaoCaoController {
    private final RoomReceiptRepository receipts;
    private final ClientRepository clients;
    private final RoomRepository rooms;

    HrmBaoCaoController(RoomReceiptRepository receipts, ClientRepository clients, RoomRepository rooms) {
        this.receipts = receipts; this.clients = clients; this.rooms = rooms;
    }

    @GetMapping("/create") @Operation(summary = "createReport(period, maCN, from, to) : BaoCao")
    BaoCao createReport(@RequestParam(defaultValue = "Tháng") String period,
                        @RequestParam(required = false) String maCN,
                        @RequestParam(required = false) String from,
                        @RequestParam(required = false) String to) {
        // UC13: số liệu báo cáo phải giới hạn THEO CHI NHÁNH (maCN) và (tùy chọn) khoảng
        // thời gian [from,to]. Một RoomReceipt thuộc về chi nhánh qua đường
        // receipt -> booking -> room -> branch. Khi maCN null/blank thì lấy toàn hệ thống
        // (giữ tương thích ngược). Lọc theo ngày dựa trên paidAt.
        LocalDate fromDate = parseDateOrNull(from);
        LocalDate toDate = parseDateOrNull(to);
        List<RoomReceipt> all = receipts.findAll().stream()
                .filter(rc -> maCN == null || maCN.isBlank() || maCN.equals(receiptBranchId(rc)))
                .filter(rc -> {
                    if (fromDate == null && toDate == null) return true;
                    if (rc.getPaidAt() == null) return false;
                    LocalDate paid = rc.getPaidAt().toLocalDate();
                    if (fromDate != null && paid.isBefore(fromDate)) return false;
                    if (toDate != null && paid.isAfter(toDate)) return false;
                    return true;
                })
                .toList();
        BigDecimal doanhThu = all.stream().map(RoomReceipt::getTotalAmount)
                .filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal fnb = all.stream().map(RoomReceipt::getServiceFee)
                .filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Room> roomList = (maCN == null || maCN.isBlank()) ? rooms.findAll()
                : rooms.findAll().stream().filter(r -> r.getBranch() != null && maCN.equals(r.getBranch().getId())).toList();
        long total = roomList.size();
        long occupied = roomList.stream().filter(r -> r.getStatus() == RoomStatus.OCCUPIED).count();
        long congSuat = total > 0 ? occupied * 100 / total : 0;
        // luotKhach: số lượt khách trong phạm vi báo cáo = số hóa đơn (mỗi hóa đơn = 1 lượt
        // khách đã thanh toán). Khi không lọc chi nhánh/ngày thì giữ tổng số khách hàng cũ
        // để không phá vỡ hành vi/test toàn hệ thống.
        long luotKhach = (maCN == null || maCN.isBlank()) && fromDate == null && toDate == null
                ? clients.count() : all.size();
        return new BaoCao(period, maCN == null ? "chi-nhanh" : maCN, doanhThu, congSuat, luotKhach, fnb);
    }

    /** Đường liên kết chi nhánh của 1 hóa đơn: receipt -> booking -> room -> branch. */
    static String receiptBranchId(RoomReceipt rc) {
        if (rc.getBooking() != null && rc.getBooking().getRoom() != null
                && rc.getBooking().getRoom().getBranch() != null) {
            return rc.getBooking().getRoom().getBranch().getId();
        }
        return null;
    }

    private static LocalDate parseDateOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value); } catch (Exception ignored) { return null; }
    }

    @GetMapping("/export") @Operation(summary = "exportFile(period, maCN, format) : byte[] (CSV)")
    ResponseEntity<byte[]> exportFile(@RequestParam(defaultValue = "Tháng") String period,
                                      @RequestParam(required = false) String maCN,
                                      @RequestParam(required = false) String from,
                                      @RequestParam(required = false) String to,
                                      @RequestParam(defaultValue = "csv") String format) {
        BaoCao bc = createReport(period, maCN, from, to);
        String csv = "Kỳ,Phạm vi,Tổng doanh thu,Công suất,Lượt khách,Doanh số F&B\n"
                + bc.ky() + "," + bc.phamVi() + "," + bc.tongDoanhThu() + ","
                + bc.congSuatPhong() + "," + bc.luotKhach() + "," + bc.doanhSoFnB() + "\n";
        byte[] body = ("﻿" + csv).getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-chi-nhanh.csv\"");
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        return ResponseEntity.ok().headers(headers).body(body);
    }
}

// ─── UC14: KhachHangController ────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/khach-hang")
@Tag(name = "HRM - KhachHangController", description = "UC14 — Xem thông tin khách hàng (thiết kế)")
class HrmKhachHangController {
    private final ClientRepository clients;
    private final RoomReceiptRepository receipts;

    HrmKhachHangController(ClientRepository clients, RoomReceiptRepository receipts) {
        this.clients = clients; this.receipts = receipts;
    }

    @GetMapping("/search") @Operation(summary = "searchCustomer(keyword, maCN) : List<KhachHang>")
    List<KhachHang> searchCustomer(@RequestParam(required = false) String keyword,
                                   @RequestParam(required = false) String maCN) {
        List<Client> found = (keyword == null || keyword.isBlank())
                ? clients.findAll() : clients.searchByKeyword(keyword);
        // UC14: khi truyền maCN, chỉ trả khách hàng THUỘC chi nhánh đó. Một khách hàng
        // liên kết với chi nhánh qua hóa đơn đã phát sinh tại chi nhánh:
        // client <- receipt.booking.customer  và  receipt.booking.room.branch == maCN.
        // Khi maCN null/blank thì giữ kết quả tìm theo từ khóa trên toàn hệ thống.
        if (maCN != null && !maCN.isBlank()) {
            java.util.Set<String> branchCustomerIds = receipts.findAll().stream()
                    .filter(rc -> rc.getBooking() != null
                            && rc.getBooking().getRoom() != null
                            && rc.getBooking().getRoom().getBranch() != null
                            && maCN.equals(rc.getBooking().getRoom().getBranch().getId())
                            && rc.getBooking().getCustomer() != null)
                    .map(rc -> rc.getBooking().getCustomer().getId())
                    .collect(java.util.stream.Collectors.toSet());
            found = found.stream()
                    .filter(c -> branchCustomerIds.contains(c.getId()))
                    .toList();
        }
        return found.stream().map(KhachHang::from).toList();
    }

    @GetMapping("/{maKH}/lich-su") @Operation(summary = "getHistory(maKH) : List<HoaDon>")
    List<HoaDon> getHistory(@PathVariable String maKH) {
        return receipts.findByBooking_Customer_Id(maKH).stream().map(HoaDon::from).toList();
    }
}

// ─── UC21: ChiNhanhController ─────────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/chi-nhanh")
@Tag(name = "HRM - ChiNhanhController", description = "UC21 — Danh sách chi nhánh (thiết kế)")
class ChiNhanhController {
    private final BranchRepository branches;

    ChiNhanhController(BranchRepository branches) { this.branches = branches; }

    @GetMapping @Operation(summary = "getBranches(ids) : List<ChiNhanh>")
    List<ChiNhanh> getBranches(@RequestParam(required = false) List<String> ids) {
        return branches.findAll().stream()
                .filter(b -> ids == null || ids.isEmpty() || ids.contains(b.getId()))
                .map(ChiNhanh::from).toList();
    }
}

// ─── UC21: BaoCaoChuoiController ──────────────────────────────────────────────
@RestController
@RequestMapping("/api/hrm/bao-cao-chuoi")
@Tag(name = "HRM - BaoCaoChuoiController", description = "UC21 — Tổng hợp báo cáo toàn chuỗi (thiết kế)")
class BaoCaoChuoiController {
    private final RoomReceiptRepository receipts;
    private final ClientRepository clients;
    private final RoomRepository rooms;

    BaoCaoChuoiController(RoomReceiptRepository receipts, ClientRepository clients, RoomRepository rooms) {
        this.receipts = receipts; this.clients = clients; this.rooms = rooms;
    }

    @PostMapping("/aggregate") @Operation(summary = "aggregateChain(period, branches) : BaoCaoChuoi (tổng + xếp hạng theo chi nhánh)")
    BaoCaoChuoi aggregateChain(@RequestBody AggregateRequest req) {
        String period = req == null || req.period() == null ? "Quý" : req.period();
        List<String> branchIds = req == null ? null : req.branches();

        // UC21 (sequence: loop [mỗi chi nhánh] -> sumRevenue() -> rank):
        // Tính doanh thu / công suất / lượt khách RIÊNG cho TỪNG chi nhánh được yêu cầu,
        // rồi xếp hạng giảm dần theo doanh thu. Liên kết hóa đơn -> chi nhánh đi qua
        // receipt -> booking -> room -> branch. Nếu branches null/blank thì lấy toàn bộ
        // chi nhánh đang có (suy ra từ phòng) để tổng hợp toàn chuỗi.
        List<RoomReceipt> allReceipts = receipts.findAll();
        List<Room> allRooms = rooms.findAll();

        java.util.List<String> targetBranches;
        if (branchIds == null || branchIds.isEmpty()) {
            targetBranches = allRooms.stream()
                    .filter(r -> r.getBranch() != null)
                    .map(r -> r.getBranch().getId())
                    .distinct().sorted().toList();
        } else {
            targetBranches = branchIds;
        }

        List<BaoCao> perBranch = new java.util.ArrayList<>();
        for (String bid : targetBranches) {
            List<RoomReceipt> brReceipts = allReceipts.stream()
                    .filter(rc -> bid != null && bid.equals(HrmBaoCaoController.receiptBranchId(rc)))
                    .toList();
            BigDecimal dt = brReceipts.stream().map(RoomReceipt::getTotalAmount)
                    .filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal brFnb = brReceipts.stream().map(RoomReceipt::getServiceFee)
                    .filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
            List<Room> brRooms = allRooms.stream()
                    .filter(r -> r.getBranch() != null && bid != null && bid.equals(r.getBranch().getId()))
                    .toList();
            long brTotal = brRooms.size();
            long brOcc = brRooms.stream().filter(r -> r.getStatus() == RoomStatus.OCCUPIED).count();
            long brCongSuat = brTotal > 0 ? brOcc * 100 / brTotal : 0;
            perBranch.add(new BaoCao(period, bid, dt, brCongSuat, (long) brReceipts.size(), brFnb));
        }
        // rank: doanh thu giảm dần
        perBranch.sort(java.util.Comparator.comparing(BaoCao::tongDoanhThu).reversed());

        // Tổng toàn chuỗi = cộng dồn các chi nhánh đã tính ở trên.
        BigDecimal tongDoanhThu = perBranch.stream().map(BaoCao::tongDoanhThu)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongFnb = perBranch.stream().map(BaoCao::doanhSoFnB)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long tongLuotKhach = perBranch.stream().mapToLong(BaoCao::luotKhach).sum();
        long avgCongSuat = perBranch.isEmpty() ? 0
                : Math.round(perBranch.stream().mapToLong(BaoCao::congSuatPhong).average().orElse(0));

        BaoCao tong = new BaoCao(period, "toan-chuoi", tongDoanhThu, avgCongSuat, tongLuotKhach, tongFnb);
        // Giữ các trường top-level y như BaoCao (ky/phamVi/tongDoanhThu/...) để tương thích
        // ngược; bổ sung chiTietChiNhanh là bảng xếp hạng theo chi nhánh.
        return new BaoCaoChuoi(tong.ky(), tong.phamVi(), tong.tongDoanhThu(), tong.congSuatPhong(),
                tong.luotKhach(), tong.doanhSoFnB(), perBranch);
    }

    @PostMapping("/export") @Operation(summary = "exportFile(period, branches) : byte[] (CSV xếp hạng toàn chuỗi)")
    ResponseEntity<byte[]> exportFile(@RequestBody(required = false) AggregateRequest req) {
        BaoCaoChuoi bc = aggregateChain(req);
        StringBuilder sb = new StringBuilder();
        sb.append("Kỳ,Phạm vi,Tổng doanh thu,Công suất,Lượt khách,Doanh số F&B\n");
        sb.append(bc.ky()).append(",").append(bc.phamVi()).append(",").append(bc.tongDoanhThu()).append(",")
          .append(bc.congSuatPhong()).append(",").append(bc.luotKhach()).append(",").append(bc.doanhSoFnB()).append("\n");
        // bảng xếp hạng theo chi nhánh (UC21)
        sb.append("Hạng,Chi nhánh,Doanh thu,Công suất,Lượt khách,Doanh số F&B\n");
        int rank = 1;
        for (BaoCao b : bc.chiTietChiNhanh()) {
            sb.append(rank++).append(",").append(b.phamVi()).append(",").append(b.tongDoanhThu()).append(",")
              .append(b.congSuatPhong()).append(",").append(b.luotKhach()).append(",").append(b.doanhSoFnB()).append("\n");
        }
        byte[] body = ("﻿" + sb).getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-chuoi.csv\"");
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        return ResponseEntity.ok().headers(headers).body(body);
    }

    record AggregateRequest(String period, List<String> branches) {}

    /**
     * Kết quả tổng hợp toàn chuỗi (UC21): giữ nguyên các trường top-level của {@link BaoCao}
     * (tương thích ngược cho client cũ chỉ đọc phamVi/tongDoanhThu) và bổ sung
     * {@code chiTietChiNhanh} — bảng xếp hạng doanh thu theo từng chi nhánh.
     */
    record BaoCaoChuoi(
            String ky,
            String phamVi,
            BigDecimal tongDoanhThu,
            Long congSuatPhong,
            Long luotKhach,
            BigDecimal doanhSoFnB,
            List<BaoCao> chiTietChiNhanh
    ) {}
}
