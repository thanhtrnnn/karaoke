package com.karaoke.backend.hrm;

import java.math.BigDecimal;

/**
 * Lớp thực thể thiết kế "BaoCao" (Báo cáo Nhân sự & Báo cáo — UC13/UC21).
 * Số liệu báo cáo được TÍNH on-the-fly từ HoaDon/Order (không persist) —
 * khớp đúng cấu trúc thuộc tính trong tài liệu (period, doanh thu, công suất, lượt khách, F&B).
 */
public record BaoCao(
        String ky,
        String phamVi,
        BigDecimal tongDoanhThu,
        Long congSuatPhong,
        Long luotKhach,
        BigDecimal doanhSoFnB
) {}
