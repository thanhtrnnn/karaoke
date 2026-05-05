package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblBooking")
public class Booking {
    @Id
    private String id;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    private Room room;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int guestCount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;
}
