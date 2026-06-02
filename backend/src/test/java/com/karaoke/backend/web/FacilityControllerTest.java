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
            rt.setNameType("Thuong");
            rt.setCapacity(8);
            rt.setPrice(new BigDecimal("80000"));
            rt.setStatus(true);
            roomTypeRepository.save(rt);

            Room room = new Room();
            room.setId("RM-FAC");
            room.setName("Room for Facility");
            room.setRoomType(rt);
            room.setCapacity(8);
            room.setPrice(new BigDecimal("80000"));
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
                        .content("{\"id\":\"TS-001\",\"name\":\"Mic karaoke\",\"compensationPrice\":50000,\"unit\":\"Cai\",\"stock\":10,\"room\":{\"id\":\"RM-FAC\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("TS-001"))
                .andExpect(jsonPath("$.name").value("Mic karaoke"));

        // List
        mockMvc.perform(get("/api/facilities").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        mockMvc.perform(get("/api/facilities/TS-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compensationPrice").value(50000));

        // Update
        mockMvc.perform(put("/api/facilities/TS-001")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mic karaoke cao cap\",\"compensationPrice\":75000,\"unit\":\"Cai\",\"stock\":5,\"room\":{\"id\":\"RM-FAC\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock").value(5));
    }

    @Test
    void facility_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/facilities"))
                .andExpect(status().isForbidden());
    }
}
