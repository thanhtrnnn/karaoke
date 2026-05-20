package com.karaoke.backend.repository;

import com.karaoke.backend.domain.MembershipTierConfig;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipTierConfigRepository extends JpaRepository<MembershipTierConfig, String> {
    List<MembershipTierConfig> findAllByOrderByMinPointsAsc();
}
