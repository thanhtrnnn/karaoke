package com.karaoke.backend.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    // services diagram: reportTime, totalFine (+ aux maBaoCao, trangThai kept)
    private String maBaoCao;
    private LocalDateTime reportTime;
    private BigDecimal totalFine;
    private String trangThai;

    @ManyToOne
    private Employee employee;

    @ManyToOne
    private RoomReceipt roomReceipt;

    @OneToMany(mappedBy = "damageReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DamageDetail> details = new ArrayList<>();
}
