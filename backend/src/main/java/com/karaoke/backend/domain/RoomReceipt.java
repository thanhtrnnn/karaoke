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
    @Index(name = "idx_roomreceipt_paidat", columnList = "paid_at")
})
public class RoomReceipt {
    @Id
    private String id;

    @ManyToOne
    private Booking booking;

    @ManyToOne
    private Employee employee;

    // booking/services diagram: checkinTime, checkoutTime, roomFee, serviceFee,
    // damageFee, discount, totalAmount, status, paymentMethod
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;
    private BigDecimal roomFee;
    private BigDecimal serviceFee;
    private BigDecimal damageFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;
}
