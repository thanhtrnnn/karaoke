package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Entity
@Table(name = "tblProduct", indexes = {
    @Index(name = "idx_menuitem_category", columnList = "category"),
    @Index(name = "idx_menuitem_active", columnList = "active")
})
public class MenuItem {
    @com.fasterxml.jackson.annotation.JsonCreator
    public MenuItem() {}

    @Id
    private String id;

    private String name;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String image;
    private boolean active = true;
}
