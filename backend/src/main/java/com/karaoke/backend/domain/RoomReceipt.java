package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Duration;
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

    // booking/services diagram: CalculateTotalAmount, calculateTimeFee, calculateServiceFee,
    // updateServiceFee, updateDamageFee, updateStatus
    public BigDecimal calculateTimeFee(Room room) {
        if (this.checkinTime == null || this.checkoutTime == null || room == null) return BigDecimal.ZERO;
        double hours = Duration.between(this.checkinTime, this.checkoutTime).toMinutes() / 60.0;
        hours = Math.max(hours, 0.5); // minimum 30 minutes
        return room.getPrice().multiply(BigDecimal.valueOf(hours));
    }

    public BigDecimal calculateServiceFee() {
        return this.serviceFee != null ? this.serviceFee : BigDecimal.ZERO;
    }

    public void updateServiceFee(BigDecimal additionalFee) {
        this.serviceFee = (this.serviceFee != null ? this.serviceFee : BigDecimal.ZERO)
                .add(additionalFee != null ? additionalFee : BigDecimal.ZERO);
        recalculateTotal();
    }

    public void updateDamageFee(BigDecimal damageFee) {
        this.damageFee = damageFee;
        recalculateTotal();
    }

    public void recalculateTotal() {
        BigDecimal base = (roomFee != null ? roomFee : BigDecimal.ZERO)
                .add(serviceFee != null ? serviceFee : BigDecimal.ZERO)
                .add(damageFee != null ? damageFee : BigDecimal.ZERO);
        this.totalAmount = base.subtract(discount != null ? discount : BigDecimal.ZERO).max(BigDecimal.ZERO);
    }
}
