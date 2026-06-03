package com.karaoke.backend.design;

/**
 * Lớp thực thể thiết kế "Customer" (Module Core — UC17, tài liệu exports/core).
 * Ánh xạ tới {@link com.karaoke.backend.domain.Client} (bảng tblMember).
 *
 * <p>Thuộc tính theo biểu đồ lớp thiết kế: id, hoTen, soDienThoai, email,
 * trangThai (accountStatus), diemTichLuy (loyaltyPoints). Domain Client hiện
 * không lưu email nên trường email được để {@code null}.</p>
 */
public record Customer(
        String id,
        String hoTen,
        String soDienThoai,
        String email,
        Boolean trangThai,
        Integer diemTichLuy
) {
    public static Customer from(com.karaoke.backend.domain.Client c) {
        return new Customer(
                c.getId(),
                c.getFullName(),
                c.getPhone(),
                null, // Client (tblMember) chưa lưu email
                c.getAccountStatus(),
                c.getLoyaltyPoints()
        );
    }
}
