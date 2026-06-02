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

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FacilityControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
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

        if (!roomRepository.existsById("RM-FAC")) {
            Branch branch = new Branch();
            branch.setId("BR-FAC");
            branch.setName("Branch Facility");
            branchRepository.save(branch);

            RoomType rt = new RoomType();
            rt.setId("RT-FAC");
            rt.setTenLoai("Thuong");
            rt.setSucChua(8);
            rt.setGiaCuoc(new BigDecimal("80000"));
            rt.setTrangThai(true);
            roomTypeRepository.save(rt);

            Room room = new Room();
            room.setId("RM-FAC");
            room.setName("Room for Facility");
            room.setRoomType(rt);
            room.setCapacity(8);
            room.setHourlyPrice(new BigDecimal("80000"));
            room.setStatus(RoomStatus.AVAILABLE);
            room.setBranch(branch);
            room.setActive(true);
            roomRepository.save(room);
        }
    }

    @Test
    void facility_crud() throws Exception {
        // Create
        mockMvc.perform(post("/api/facilities")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"TS-001\",\"tenTaiSan\":\"Mic karaoke\",\"loai\":\"AmThanh\",\"trangThai\":\"HoatDong\",\"room\":{\"id\":\"RM-FAC\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("TS-001"))
                .andExpect(jsonPath("$.tenTaiSan").value("Mic karaoke"));

        // List
        mockMvc.perform(get("/api/facilities").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/facilities/TS-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loai").value("AmThanh"));

        // Update
        mockMvc.perform(put("/api/facilities/TS-001")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tenTaiSan\":\"Mic karaoke cao cap\",\"loai\":\"AmThanh\",\"trangThai\":\"BaoTri\",\"room\":{\"id\":\"RM-FAC\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("BaoTri"));
    }

    @Test
    void facility_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/facilities"))
                .andExpect(status().isForbidden());
    }
}
