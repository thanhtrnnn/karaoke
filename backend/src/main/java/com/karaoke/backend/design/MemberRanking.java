package com.karaoke.backend.design;

/**
 * Lớp thực thể thiết kế "MemberRanking" (Module Booking, tài liệu exports/booking).
 * Ánh xạ tới {@link com.karaoke.backend.domain.MembershipTier} (bảng tblMembershipTier).
 *
 * <p>Thuộc tính theo biểu đồ lớp thiết kế: rankingID (= tierName/PK), name,
 * base_score (= minPoints), coupon (= discountRate). Lưu ý domain
 * {@code MembershipTier.discountRate} có kiểu {@code String} nên {@code coupon}
 * cũng là {@code String}.</p>
 */
public record MemberRanking(
        String rankingID,
        String name,
        int base_score,
        String coupon
) {
    public static MemberRanking from(com.karaoke.backend.domain.MembershipTier t) {
        return new MemberRanking(
                t.getTierName(),
                t.getTierName(),
                t.getMinPoints(),
                t.getDiscountRate()
        );
    }
}
