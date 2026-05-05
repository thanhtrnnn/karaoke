package com.karaoke.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tblBranch")
public class Branch {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String phone;
    private boolean active = true;
}
