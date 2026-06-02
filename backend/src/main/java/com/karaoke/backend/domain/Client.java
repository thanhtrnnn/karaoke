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

    // account diagram: loyaltyPoints, joinedAt, accountStatus
    private String tier;
    private Integer loyaltyPoints;
    private boolean accountStatus = true;
    private LocalDateTime joinedAt;

    // account diagram: addPoints, lockAccount
    public void addPoints(int baseScore) {
        this.loyaltyPoints = (this.loyaltyPoints != null ? this.loyaltyPoints : 0) + baseScore;
    }

    public void lockAccount() {
        this.accountStatus = !this.accountStatus;
    }
}
