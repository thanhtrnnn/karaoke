package com.karaoke.backend.web;

import com.karaoke.backend.domain.CaLamViec;
import com.karaoke.backend.domain.ChamCong;
import com.karaoke.backend.domain.DanhGia;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.QuyetDinh;
import com.karaoke.backend.repository.CaLamViecRepository;
import com.karaoke.backend.repository.ChamCongRepository;
import com.karaoke.backend.repository.DanhGiaRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.QuyetDinhRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// ─── Shifts (CaLamViec) ───────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/shifts")
@Tag(name = "Shifts", description = "Phân ca làm việc nhân viên (UC11)")
class ShiftController {
    private final CaLamViecRepository repository;
    private final EmployeeRepository employees;
    private final ChamCongRepository chamCongRepository;

    ShiftController(CaLamViecRepository repository, EmployeeRepository employees, ChamCongRepository chamCongRepository) {
        this.repository = repository;
        this.employees = employees;
        this.chamCongRepository = chamCongRepository;
    }

    @GetMapping @Operation(summary = "Danh sách ca làm việc — lọc theo employeeId hoặc branchId")
    List<CaLamViec> list(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String branchId) {
        if (employeeId != null) return repository.findByEmployee_Id(employeeId);
        if (branchId != null) return repository.findByEmployee_Branch_Id(branchId);
        return repository.findAll();
    }

    // UC11: Phân ca — kiểm tra trùng ca trước khi lưu
    @PostMapping @Operation(summary = "Tạo ca làm việc (UC11 — kiểm tra trùng ca)")
    @Transactional
    CaLamViec create(@Valid @RequestBody CreateShiftRequest request) {
        Employee employee = employees.findById(request.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + request.employeeId()));

        if (repository.existsDuplicateShift(request.employeeId(), request.ngayLam(), request.loaiCa())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Nhân viên đã có ca " + request.loaiCa() + " trong ngày " + request.ngayLam());
        }

        CaLamViec shift = new CaLamViec();
        shift.setEmployee(employee);
        shift.setNgayLam(request.ngayLam());
        shift.setGioBatDau(request.gioBatDau());
        shift.setGioKetThuc(request.gioKetThuc());
        shift.setLoaiCa(request.loaiCa());
        CaLamViec saved = repository.save(shift);

        // UC11: Tự động tạo bản ghi Chấm Công khi phân ca
        ChamCong cc = new ChamCong();
        cc.setCaLamViec(saved);
        cc.setTrangThai("ChoChamCong");
        chamCongRepository.save(cc);

        return saved;
    }

    record CreateShiftRequest(
            @NotBlank String employeeId,
            @NotNull LocalDate ngayLam,
            LocalTime gioBatDau,
            LocalTime gioKetThuc,
            @NotBlank String loaiCa
    ) {}
}

// ─── Attendance (ChamCong) ────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/timekeeping")
@Tag(name = "Timekeeping", description = "Chấm công nhân viên (UC11)")
class TimekeepingController {
    private final ChamCongRepository repository;
    private final CaLamViecRepository shifts;

    TimekeepingController(ChamCongRepository repository, CaLamViecRepository shifts) {
        this.repository = repository;
        this.shifts = shifts;
    }

    @GetMapping @Operation(summary = "Danh sách chấm công — lọc theo employeeId hoặc branchId")
    List<ChamCong> list(
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String branchId) {
        if (employeeId != null) return repository.findByCaLamViec_Employee_Id(employeeId);
        if (branchId != null) return repository.findByCaLamViec_Employee_Branch_Id(branchId);
        return repository.findAll();
    }

    @PostMapping @Operation(summary = "Ghi nhận chấm công")
    @Transactional
    ChamCong create(@RequestBody CreateChamCongRequest request) {
        CaLamViec shift = shifts.findById(request.caLamViecId())
                .orElseThrow(() -> new EntityNotFoundException("CaLamViec not found: " + request.caLamViecId()));
        ChamCong cc = new ChamCong();
        cc.setCaLamViec(shift);
        cc.setGioVaoThuc(request.gioVaoThuc());
        cc.setGioRaThuc(request.gioRaThuc());

        // UC11: Tự động tính trạng thái chấm công
        if (request.trangThai() != null) {
            cc.setTrangThai(request.trangThai());
        } else if (request.gioVaoThuc() == null) {
            cc.setTrangThai("Vang");
        } else if (shift.getGioBatDau() != null
                && request.gioVaoThuc().toLocalTime().isAfter(shift.getGioBatDau().plusMinutes(15))) {
            cc.setTrangThai("Muon");
        } else {
            cc.setTrangThai("DungGio");
        }

        return repository.save(cc);
    }

    record CreateChamCongRequest(
            @NotNull Long caLamViecId,
            java.time.LocalDateTime gioVaoThuc,
            java.time.LocalDateTime gioRaThuc,
            String trangThai
    ) {}
}

// ─── Evaluations (DanhGia) ────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/evaluations")
@Tag(name = "Evaluations", description = "Đánh giá hiệu suất nhân viên (UC11)")
class EvaluationController {
    private final DanhGiaRepository repository;
    private final EmployeeRepository employees;

    EvaluationController(DanhGiaRepository repository, EmployeeRepository employees) {
        this.repository = repository;
        this.employees = employees;
    }

    @GetMapping @Operation(summary = "Danh sách đánh giá — lọc theo employeeId")
    List<DanhGia> list(@RequestParam(required = false) String employeeId) {
        return employeeId != null ? repository.findByEmployee_Id(employeeId) : repository.findAll();
    }

    @PostMapping @Operation(summary = "Tạo đánh giá nhân viên (UC11 — score 0–10)")
    @Transactional
    DanhGia create(@Valid @RequestBody CreateEvaluationRequest request) {
        Employee employee = employees.findById(request.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + request.employeeId()));
        DanhGia dg = new DanhGia();
        dg.setEmployee(employee);
        dg.setKyDanhGia(request.kyDanhGia());
        dg.setDiem(request.diem());
        dg.setNhanXet(request.nhanXet());
        dg.setNgayDanhGia(request.ngayDanhGia() != null ? request.ngayDanhGia() : LocalDate.now());
        return repository.save(dg);
    }

    record CreateEvaluationRequest(
            @NotBlank String employeeId,
            @NotBlank String kyDanhGia,
            @Min(0) @Max(10) int diem,
            String nhanXet,
            LocalDate ngayDanhGia
    ) {}
}

// ─── Decisions (QuyetDinh) ────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/decisions")
@Tag(name = "Decisions", description = "Khen thưởng / kỷ luật nhân viên (UC11)")
class DecisionController {
    private final QuyetDinhRepository repository;
    private final EmployeeRepository employees;

    DecisionController(QuyetDinhRepository repository, EmployeeRepository employees) {
        this.repository = repository;
        this.employees = employees;
    }

    @GetMapping @Operation(summary = "Danh sách quyết định — lọc theo employeeId")
    List<QuyetDinh> list(@RequestParam(required = false) String employeeId) {
        return employeeId != null ? repository.findByEmployee_Id(employeeId) : repository.findAll();
    }

    @PostMapping @Operation(summary = "Tạo quyết định khen thưởng/kỷ luật (UC11)")
    @Transactional
    QuyetDinh create(@Valid @RequestBody CreateDecisionRequest request) {
        Employee employee = employees.findById(request.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + request.employeeId()));
        QuyetDinh qd = new QuyetDinh();
        qd.setEmployee(employee);
        qd.setLoai(request.loai());
        qd.setNoiDung(request.noiDung());
        qd.setNgayQuyetDinh(request.ngayQuyetDinh() != null ? request.ngayQuyetDinh() : LocalDate.now());
        return repository.save(qd);
    }

    record CreateDecisionRequest(
            @NotBlank String employeeId,
            @NotBlank String loai,
            @NotBlank String noiDung,
            LocalDate ngayQuyetDinh
    ) {}
}
