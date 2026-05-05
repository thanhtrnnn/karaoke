package com.karaoke.backend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblEmployee")
public class Employee {
    @Id
    private String id;

    private String fullName;
    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ManyToOne
    private Branch branch;

    private boolean active = true;
}
