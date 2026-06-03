package com.karaoke.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblMember")
public class Client {
    @Id
    private String id;

    private String salutation;
    private String firstName;
    private String lastName;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String phone;

    // account UC04: email liên hệ của thành viên
    private String email;

    // account diagram: loyaltyPoints, joinedAt, accountStatus
    private String tier;
    private Integer loyaltyPoints;
    private Boolean accountStatus = true;
    private LocalDateTime joinedAt;

    /** Constructor 10 tham số (giữ tương thích các nơi đang gọi: DataSeeder). email = null. */
    public Client(String id, String salutation, String firstName, String lastName, String fullName,
                  String phone, String tier, Integer loyaltyPoints, Boolean accountStatus,
                  LocalDateTime joinedAt) {
        this.id = id;
        this.salutation = salutation;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.phone = phone;
        this.tier = tier;
        this.loyaltyPoints = loyaltyPoints;
        this.accountStatus = accountStatus;
        this.joinedAt = joinedAt;
    }

    // account diagram: addPoints, lockAccount
    public void addPoints(int baseScore) {
        this.loyaltyPoints = (this.loyaltyPoints != null ? this.loyaltyPoints : 0) + baseScore;
    }

    public void lockAccount() {
        this.accountStatus = !this.accountStatus;
    }
}
