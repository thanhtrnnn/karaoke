package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "tblRoomReceipt", indexes = {
    @Index(name = "idx_roomreceipt_status", columnList = "status"),
    @Index(name = "idx_roomreceipt_booking", columnList = "booking_id"),
    @Index(name = "idx_roomreceipt_paidat", columnList = "paidAt")
})
public class RoomReceipt {
    @Id
    private String id;

    @ManyToOne
    private Booking booking;

    private LocalDateTime checkinTime;
    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;
}
