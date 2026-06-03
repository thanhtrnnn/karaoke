package com.karaoke.backend.hrm;

/**
 * Lớp thực thể thiết kế "ChiNhanh" (Báo cáo Nhân sự & Báo cáo — UC11/UC21).
 * Ánh xạ tới {@link com.karaoke.backend.domain.Branch} (bảng tblBranch).
 * DTO chỉ-đọc dùng cho tầng HRM để khớp đúng tên tài liệu thiết kế.
 */
public record ChiNhanh(
        String maChiNhanh,
        String tenChiNhanh,
        String diaChi,
        String soDienThoai
) {
    public static ChiNhanh from(com.karaoke.backend.domain.Branch b) {
        return new ChiNhanh(b.getId(), b.getName(), b.getAddress(), b.getPhone());
    }
}
