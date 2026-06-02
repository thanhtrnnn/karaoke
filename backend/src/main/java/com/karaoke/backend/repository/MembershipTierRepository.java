package com.karaoke.backend.repository;

import com.karaoke.backend.domain.MembershipTier;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipTierRepository extends JpaRepository<MembershipTier, String> {
    List<MembershipTier> findAllByOrderByDiemToiThieuAsc();
}
