package com.karaoke.backend.repository;

import com.karaoke.backend.domain.MembershipTier;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Module 1 (UC20) + Module 3 (UC18) — Quản lý hạng hội viên
 */
@DataJpaTest
class MembershipTierRepositoryTest {

    @Autowired
    private MembershipTierRepository repository;

    private MembershipTier createTier(String tierName, int minPoints, String discountRate) {
        MembershipTier tier = new MembershipTier();
        tier.setTierName(tierName);
        tier.setMinPoints(minPoints);
        tier.setDescription("Hạng " + tierName);
        tier.setDiscountRate(discountRate);
        return repository.save(tier);
    }

    @Test
    void findAllByOrderByMinPointsAsc_returnsSortedAscending() {
        createTier("Vang", 500, "0.90");
        createTier("Dong", 0, "1.0");
        createTier("Bac", 100, "0.95");
        createTier("KimCuong", 2000, "0.80");

        List<MembershipTier> tiers = repository.findAllByOrderByMinPointsAsc();
        assertEquals(4, tiers.size());
        assertEquals("Dong", tiers.get(0).getTierName());
        assertEquals(0, tiers.get(0).getMinPoints());
        assertEquals("Bac", tiers.get(1).getTierName());
        assertEquals("Vang", tiers.get(2).getTierName());
        assertEquals("KimCuong", tiers.get(3).getTierName());
        assertEquals(2000, tiers.get(3).getMinPoints());
    }

    @Test
    void save_persistsAllFields() {
        createTier("TestTier", 300, "0.92");

        MembershipTier found = repository.findById("TestTier").orElseThrow();
        assertEquals(300, found.getMinPoints());
        assertEquals("0.92", found.getDiscountRate());
        assertEquals("Hạng TestTier", found.getDescription());
    }

    @Test
    void findAll_emptyWhenNoTiers() {
        List<MembershipTier> tiers = repository.findAllByOrderByMinPointsAsc();
        assertTrue(tiers.isEmpty());
    }
}
