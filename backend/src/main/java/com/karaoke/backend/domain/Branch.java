package com.karaoke.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
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
    private Boolean active = true;

    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<Room> rooms;

    // Convenience constructor without rooms
    public Branch(String id, String name, String address, String phone, boolean active) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.active = active;
    }
}
