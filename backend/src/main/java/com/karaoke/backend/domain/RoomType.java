package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblRoomType")
public class RoomType {
    @Id
    private String id;

    private String tenLoai;
    private Integer sucChua;
    private BigDecimal giaCuoc;
    private boolean trangThai = true;
}
