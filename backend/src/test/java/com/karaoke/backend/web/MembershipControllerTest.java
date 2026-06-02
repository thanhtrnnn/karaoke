package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Module 1 (UC20) + Module 3 (UC18) — Quản lý hạng hội viên
 * Tests: list tiers sorted by diemToiThieu, update tier, membership stats
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MembershipControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private MembershipTierRepository tierRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("TESTADMIN")) {
            User admin = new User();
            admin.setId("TESTADMIN");
            admin.setUsername("testadmin");
            admin.setEmail("testadmin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("pass"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }

        // Seed hạng hội viên theo tài liệu UC18
        if (!tierRepository.existsById("Dong")) {
            MembershipTier dong = new MembershipTier();
            dong.setTierName("Dong");
            dong.setMinPoints(0);
            dong.setDescription("Hạng đồng — khách mới");
            dong.setDiscountRate("1.0");
            tierRepository.save(dong);

            MembershipTier bac = new MembershipTier();
            bac.setTierName("Bac");
            bac.setMinPoints(100);
            bac.setDescription("Hạng bạc");
            bac.setDiscountRate("0.95");
            tierRepository.save(bac);

            MembershipTier vang = new MembershipTier();
            vang.setTierName("Vang");
            vang.setMinPoints(500);
            vang.setDescription("Hạng vàng");
            vang.setDiscountRate("0.90");
            tierRepository.save(vang);

            MembershipTier kim = new MembershipTier();
            kim.setTierName("KimCuong");
            kim.setMinPoints(2000);
            kim.setDescription("Hạng kim cương");
            kim.setDiscountRate("0.80");
            tierRepository.save(kim);
        }
    }

    // UC18 — Danh sách hạng sắp xếp theo diemToiThieu tăng dần
    @Test
    void listTiers_sortedByDiemToiThieu() throws Exception {
        mockMvc.perform(get("/api/membership/tiers").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(4)))
                .andExpect(jsonPath("$[0].tierName").value("Dong"))
                .andExpect(jsonPath("$[0].minPoints").value(0));
    }

    // UC18 — Cập nhật ngưỡng điểm hạng
    @Test
    void updateTier_changesHeSoUuDai() throws Exception {
        mockMvc.perform(put("/api/membership/tiers/Bac")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tierName\":\"Bac\",\"minPoints\":150,\"description\":\"Hạng bạc mới\",\"discountRate\":\"0.93\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minPoints").value(150))
                .andExpect(jsonPath("$.discountRate").value("0.93"));
    }

    // UC18 — Tier không tồn tại → 404
    @Test
    void updateTier_notFound_returns404() throws Exception {
        mockMvc.perform(put("/api/membership/tiers/GHOST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tierName\":\"GHOST\",\"minPoints\":9999,\"description\":\"none\",\"discountRate\":\"1.0\"}"))
                .andExpect(status().isNotFound());
    }

    // Module 3 — Thống kê hội viên theo hạng
    @Test
    void stats_returnsCountPerTier() throws Exception {
        Client c1 = new Client();
        c1.setId("KH-STAT1");
        c1.setFullName("Client 1");
        c1.setPhone("0901000001");
        c1.setTier("Bac");
        c1.setLoyaltyPoints(100);
        clientRepository.save(c1);

        Client c2 = new Client();
        c2.setId("KH-STAT2");
        c2.setFullName("Client 2");
        c2.setPhone("0901000002");
        c2.setTier("Bac");
        c2.setLoyaltyPoints(200);
        clientRepository.save(c2);

        mockMvc.perform(get("/api/membership/stats").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.Bac").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
    }

    // Không có token → 403
    @Test
    void tiers_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/membership/tiers"))
                .andExpect(status().isForbidden());
    }
}
