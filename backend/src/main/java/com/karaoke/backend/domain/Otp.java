package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblOTP")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // account diagram: otpCode, type, expiresAt, verified
    private String otpCode;
    private String type;
    private LocalDateTime expiresAt;
    private boolean verified = false;

    @ManyToOne
    private User user;

    // account diagram: sendOTP, verifyOTP
    public void sendOTP(String code, String type, int expiryMinutes) {
        this.otpCode = code;
        this.type = type;
        this.expiresAt = java.time.LocalDateTime.now().plusMinutes(expiryMinutes);
        this.verified = false;
    }

    public boolean verifyOTP(String code) {
        if (this.verified) return false;
        if (this.expiresAt != null && java.time.LocalDateTime.now().isAfter(this.expiresAt)) return false;
        if (this.otpCode != null && this.otpCode.equals(code)) {
            this.verified = true;
            return true;
        }
        return false;
    }
}
