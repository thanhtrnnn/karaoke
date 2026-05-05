package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
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
@Table(name = "tblInvoice")
public class Invoice {
    @Id
    private String id;

    @ManyToOne
    private Booking booking;

    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;
}
