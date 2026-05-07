package com.karaoke.backend.domain;

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
@Table(name = "tblMembershipTierConfig")
public class MembershipTierConfig {
    @Id
    private String tierName;

    private int minPoints;
    private String discount;
}
