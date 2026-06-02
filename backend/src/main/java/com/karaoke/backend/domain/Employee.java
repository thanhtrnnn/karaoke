package com.karaoke.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Entity
@Table(name = "tblEmployee")
public class Employee {
    @com.fasterxml.jackson.annotation.JsonCreator
    public Employee() {}

    @Id
    private String id;

    // services diagram: full_name, dob, tel, email, role, status, username, password
    @Column(name = "full_name")
    private String fullName;

    private LocalDate dob;
    private String tel;
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String status = "Working";
    private Boolean active = true;

    private String username;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @ManyToOne
    private Branch branch;

    // services diagram: getAllStaff, addStaff, updateStaff, deleteStaff
    // Note: Employee auth is handled via User entity + AuthController, not this class
}
