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

    private MembershipTier createTier(String tenHang, int diemToiThieu, String heSoUuDai) {
        MembershipTier tier = new MembershipTier();
        tier.setTenHang(tenHang);
        tier.setDiemToiThieu(diemToiThieu);
        tier.setMoTa("Hạng " + tenHang);
        tier.setHeSoUuDai(heSoUuDai);
        return repository.save(tier);
    }

    @Test
    void findAllByOrderByDiemToiThieuAsc_returnsSortedAscending() {
        createTier("Vang", 500, "0.90");
        createTier("Dong", 0, "1.0");
        createTier("Bac", 100, "0.95");
        createTier("KimCuong", 2000, "0.80");

        List<MembershipTier> tiers = repository.findAllByOrderByDiemToiThieuAsc();
        assertEquals(4, tiers.size());
        assertEquals("Dong", tiers.get(0).getTenHang());
        assertEquals(0, tiers.get(0).getDiemToiThieu());
        assertEquals("Bac", tiers.get(1).getTenHang());
        assertEquals("Vang", tiers.get(2).getTenHang());
        assertEquals("KimCuong", tiers.get(3).getTenHang());
        assertEquals(2000, tiers.get(3).getDiemToiThieu());
    }

    @Test
    void save_persistsAllFields() {
        createTier("TestTier", 300, "0.92");

        MembershipTier found = repository.findById("TestTier").orElseThrow();
        assertEquals(300, found.getDiemToiThieu());
        assertEquals("0.92", found.getHeSoUuDai());
        assertEquals("Hạng TestTier", found.getMoTa());
    }

    @Test
    void findAll_emptyWhenNoTiers() {
        List<MembershipTier> tiers = repository.findAllByOrderByDiemToiThieuAsc();
        assertTrue(tiers.isEmpty());
    }
}
