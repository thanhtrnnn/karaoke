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

    @ManyToOne
    private Employee employee;

    @OneToMany(mappedBy = "importReceipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImportDetail> details = new ArrayList<>();
}
