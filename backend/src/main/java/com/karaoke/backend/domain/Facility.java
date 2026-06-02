package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblFacility")
public class Facility {
    @Id
    private String id;

    private String tenTaiSan;
    private String loai;
    private String trangThai;
    private Integer soLuong;
    private java.math.BigDecimal giaBuuCap;
    private String donVi;

    @ManyToOne
    private Room room;
}
