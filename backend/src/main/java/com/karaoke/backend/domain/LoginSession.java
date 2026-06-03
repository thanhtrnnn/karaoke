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
@Table(name = "tblLoginSession")
public class LoginSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // account diagram: sessionToken, loginTime, expiresAt, device
    private String sessionToken;
    private LocalDateTime loginTime;
    private LocalDateTime expiresAt;
    private String device;

    // account TC07: trạng thái phiên (vd: "Đã thu hồi")
    private String trangThai;

    @ManyToOne
    private User user;
}
