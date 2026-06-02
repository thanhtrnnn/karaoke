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
    @Id
    private String tenHang;

    private int diemToiThieu;
    private String moTa;
    private String heSoUuDai;
}
