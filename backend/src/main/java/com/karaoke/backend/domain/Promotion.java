package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblPromotion")
public class Promotion {
    @Id
    private String id;

    // booking diagram: name, type, redeem, startDate, validUntil, status
    private String name;
    private String type;
    private BigDecimal redeem;
    private LocalDate startDate;
    private LocalDate validUntil;
    private Boolean status = true;
}
