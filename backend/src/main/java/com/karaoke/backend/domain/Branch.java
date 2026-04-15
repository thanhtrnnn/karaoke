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
@AllArgsConstructor
@Entity
@Table(name = "tblBranch")
public class Branch {
    @com.fasterxml.jackson.annotation.JsonCreator
    public Branch() {}

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String phone;
    private boolean active = true;

    @OneToMany(mappedBy = "branch")
    @JsonIgnore
    private List<Room> rooms;
}
