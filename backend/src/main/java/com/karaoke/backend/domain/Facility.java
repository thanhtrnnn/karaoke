package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
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
@Table(name = "tblFacility")
public class Facility {
    @Id
    private String id;

    // services diagram: name, compensationPrice, unit, stock
    private String name;
    private BigDecimal compensationPrice;
    private String unit;
    private Integer stock;

    @ManyToOne
    private Room room;
}
