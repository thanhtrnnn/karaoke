package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Entity
@Table(name = "tblRoom", indexes = {
    @Index(name = "idx_room_status", columnList = "status"),
    @Index(name = "idx_room_branch", columnList = "branch_id")
})
public class Room {
    @com.fasterxml.jackson.annotation.JsonCreator
    public Room() {}

    @Id
    private String id;

    private String name;

    @ManyToOne
    private RoomType roomType;

    private Integer capacity;

    // services/booking diagram: price (renamed from hourlyPrice)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne
    private Branch branch;

    private Boolean active = true;
}
