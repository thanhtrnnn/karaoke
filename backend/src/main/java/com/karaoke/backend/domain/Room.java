package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblRoom")
public class Room {
    @Id
    private String id;

    private String name;
    private String type;
    private int capacity;
    private BigDecimal hourlyPrice;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne
    private Branch branch;

    private boolean active = true;
}
