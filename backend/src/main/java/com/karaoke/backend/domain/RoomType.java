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
}
