package com.karaoke.backend.hrm;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lớp thực thể thiết kế "HoaDon" (Báo cáo Nhân sự & Báo cáo — UC13/UC14/UC21).
 * Ánh xạ tới {@link com.karaoke.backend.domain.RoomReceipt} (bảng tblRoomReceipt).
 */
public record HoaDon(
        String maHoaDon,
        LocalDateTime thoiGian,
        BigDecimal tienPhong,
        BigDecimal tienDichVu,
        BigDecimal tongTien
) {
    public static HoaDon from(com.karaoke.backend.domain.RoomReceipt r) {
        LocalDateTime thoiGian = r.getPaidAt() != null ? r.getPaidAt() : r.getCheckoutTime();
        return new HoaDon(r.getId(), thoiGian, r.getRoomFee(), r.getServiceFee(), r.getTotalAmount());
    }
}
