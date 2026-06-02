package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
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
@Table(name = "tblDamageReport")
public class DamageReport {
    @Id
    private String id;

    private String maBaoCao;
    private LocalDateTime ngayTao;
    private String trangThai;

    @ManyToOne
    private User employee;
}
