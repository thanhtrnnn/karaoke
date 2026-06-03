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

    // core diagram UC19: nameType, capacity, price, status
    private String nameType;
    private Integer capacity;
    private BigDecimal price;
    private Boolean status = true;

    // core test-data: mô tả loại phòng (description)
    private String moTa;

    /** Constructor 5 tham số (giữ tương thích các nơi đang gọi: DataSeeder). moTa = null. */
    public RoomType(String id, String nameType, Integer capacity, BigDecimal price, Boolean status) {
        this.id = id;
        this.nameType = nameType;
        this.capacity = capacity;
        this.price = price;
        this.status = status;
    }
}
