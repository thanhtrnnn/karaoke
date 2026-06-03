package com.karaoke.backend.hrm;

/**
 * Lớp thực thể thiết kế "DanhGiaNhanVien" (Báo cáo Nhân sự & Báo cáo — UC11).
 * Ánh xạ tới {@link com.karaoke.backend.domain.DanhGia} (bảng tbl_danh_gia).
 * Dùng làm dữ liệu vào cho saveEvaluation().
 */
public record DanhGiaNhanVien(
        String maNhanVien,
        String kyDanhGia,
        Integer diem,
        String nhanXet
) {}
