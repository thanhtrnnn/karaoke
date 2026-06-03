package com.karaoke.backend.hrm;

/**
 * Lớp thực thể thiết kế "KhachHang" (Báo cáo Nhân sự & Báo cáo — UC14).
 * Ánh xạ tới {@link com.karaoke.backend.domain.Client} (bảng tblMember).
 */
public record KhachHang(
        String maKhachHang,
        String hoTen,
        String soDienThoai,
        String hangHoiVien,
        Integer diemTichLuy
) {
    public static KhachHang from(com.karaoke.backend.domain.Client c) {
        return new KhachHang(c.getId(), c.getFullName(), c.getPhone(), c.getTier(), c.getLoyaltyPoints());
    }
}
