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
@Table(name = "tblProduct")
public class MenuItem {
    @Id
    private String id;

    private String name;
    private String category;
    private BigDecimal price;
    private int stock;
    private String image;
    private boolean active = true;
}
