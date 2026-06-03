package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblMembershipTier")
public class MembershipTier {
    // account diagram: tierName (PK), minPoints, description, discountRate
    @Id
    private String tierName;

    private int minPoints;
    private String description;
    private String discountRate;

    // account: hệ số/bonus điểm thưởng nhận được ở hạng này
    private Integer diemThuongNhan;

    /** Constructor 4 tham số (giữ tương thích các nơi đang gọi: DataSeeder). diemThuongNhan = null. */
    public MembershipTier(String tierName, int minPoints, String description, String discountRate) {
        this.tierName = tierName;
        this.minPoints = minPoints;
        this.description = description;
        this.discountRate = discountRate;
    }
}
