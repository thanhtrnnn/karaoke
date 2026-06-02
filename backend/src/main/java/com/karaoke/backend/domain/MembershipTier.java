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
@Table(name = "tblMembershipTier")
public class MembershipTier {
    // account diagram: tierName (PK), minPoints, description, discountRate
    @Id
    private String tierName;

    private int minPoints;
    private String description;
    private String discountRate;
}
