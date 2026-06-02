package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblImportReceipt")
public class ImportReceipt {
    @Id
    private String id;

    private String maPhieu;
    private LocalDateTime ngayNhap;
    private BigDecimal tongTien;
    private String trangThai;

    @ManyToOne
    private Provider provider;
}
