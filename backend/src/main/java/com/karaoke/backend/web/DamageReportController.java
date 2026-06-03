package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/damage-reports")
@Tag(name = "Damage Reports", description = "Báo cáo hư hỏng tài sản (UC10)")
class DamageReportController {
    private final DamageReportRepository repository;
    private final FacilityRepository facilityRepository;
    private final RoomReceiptRepository receiptRepository;
    private final EmployeeRepository employeeRepository;

    DamageReportController(DamageReportRepository repository, FacilityRepository facilityRepository, RoomReceiptRepository receiptRepository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.facilityRepository = facilityRepository;
        this.receiptRepository = receiptRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping @Operation(summary = "Danh sách báo cáo hư hỏng")
    List<DamageReport> list() { return repository.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết báo cáo")
    DamageReport get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("DamageReport not found: " + id));
    }

    // UC10: Tìm RoomReceipt đang mở (DRAFT) cho một phòng — dùng để link damage report
    @GetMapping("/active-receipt")
    @Operation(summary = "Tìm hóa đơn đang mở cho phòng (UC10)")
    RoomReceipt getActiveReceipt(@RequestParam String roomId) {
        return receiptRepository.findDraftByRoomId(roomId)
                .orElse(null);
    }

    // UC10: saveDamageReport — tạo report + details + trừ facility stock + update roomReceipt.damageFee
    @PostMapping @Operation(summary = "Tạo báo cáo hư hỏng (UC10)")
    @Transactional
    DamageReport create(@RequestBody DamageReport report) {
        if (report.getReportTime() == null) report.setReportTime(LocalDateTime.now());
        if (report.getTrangThai() == null || report.getTrangThai().isBlank()) report.setTrangThai("Chờ xử lý");

        // Resolve employee: prefer username lookup (User.id ≠ Employee.id)
        if (report.getEmployeeUsername() != null && !report.getEmployeeUsername().isBlank()) {
            employeeRepository.findByUsername(report.getEmployeeUsername()).ifPresent(report::setEmployee);
        }

        BigDecimal totalFine = BigDecimal.ZERO;
        if (report.getDetails() != null) {
            for (DamageDetail detail : report.getDetails()) {
                detail.setDamageReport(report);
                if (detail.getFacility() != null && detail.getQuantity() > 0) {
                    Facility fac = detail.getFacility();
                    BigDecimal lineTotal = fac.getCompensationPrice() != null
                            ? fac.getCompensationPrice().multiply(BigDecimal.valueOf(detail.getQuantity()))
                            : BigDecimal.ZERO;
                    detail.setUnitFineAmount(fac.getCompensationPrice());
                    detail.setLineTotal(lineTotal);
                    totalFine = totalFine.add(lineTotal);
                    // UC10: trừ facility stock
                    fac.setStock(Math.max(0, (fac.getStock() != null ? fac.getStock() : 0) - detail.getQuantity()));
                    facilityRepository.save(fac);
                }
            }
        }
        report.setTotalFine(totalFine);

        DamageReport saved = repository.save(report);

        // UC10: cập nhật damageFee trong RoomReceipt
        if (saved.getRoomReceipt() != null && totalFine.compareTo(BigDecimal.ZERO) > 0) {
            RoomReceipt receipt = saved.getRoomReceipt();
            receipt.updateDamageFee(totalFine);
            receiptRepository.save(receipt);
        }
        return saved;
    }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật báo cáo")
    DamageReport update(@PathVariable String id, @RequestBody DamageReport report) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("DamageReport not found: " + id);
        report.setId(id);
        return repository.save(report);
    }
}
