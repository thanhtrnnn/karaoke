package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";

    @BeforeEach
    void setup() {
        UserAccount admin = new UserAccount();
        admin.setId("TESTADMIN");
        admin.setUsername("testadmin");
        admin.setEmail("testadmin@test.com");
        admin.setPasswordHash(passwordEncoder.encode("pass"));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
    }

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private Room createRoom(String id, Branch branch, RoomStatus status) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setType("VIP");
        r.setCapacity(10);
        r.setHourlyPrice(new BigDecimal("100000"));
        r.setStatus(status);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private Customer createCustomer(String id, String phone) {
        Customer c = new Customer();
        c.setId(id);
        c.setFullName("Test Customer");
        c.setPhone(phone);
        c.setTier("Dong");
        c.setPoints(0);
        return customerRepository.save(c);
    }

    @Test
    void create_setsRoomReserved() throws Exception {
        Branch branch = createBranch("B1");
        Room room = createRoom("R1", branch, RoomStatus.AVAILABLE);
        Customer customer = createCustomer("C1", "0901111111");

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String customerId = "C1";
                                    public final String roomId = "R1";
                                    public final String startTime = LocalDateTime.now().plusHours(1).toString();
                                    public final String endTime = LocalDateTime.now().plusHours(3).toString();
                                    public final int guestCount = 5;
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.room.id").value("R1"));

        Room updated = roomRepository.findById("R1").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(RoomStatus.RESERVED, updated.getStatus());
    }

    @Test
    void checkIn_setsRoomOccupied() throws Exception {
        Branch branch = createBranch("B2");
        Room room = createRoom("R2", branch, RoomStatus.RESERVED);
        Customer customer = createCustomer("C2", "0902222222");

        Booking booking = new Booking();
        booking.setId("BK-TEST1");
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setStartTime(LocalDateTime.now().plusHours(1));
        booking.setEndTime(LocalDateTime.now().plusHours(3));
        booking.setGuestCount(5);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        mockMvc.perform(put("/api/bookings/BK-TEST1/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CHECKED_IN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKED_IN"));

        Room updated = roomRepository.findById("R2").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(RoomStatus.OCCUPIED, updated.getStatus());
    }

    @Test
    void complete_setsRoomAvailable() throws Exception {
        Branch branch = createBranch("B3");
        Room room = createRoom("R3", branch, RoomStatus.OCCUPIED);
        Customer customer = createCustomer("C3", "0903333333");

        Booking booking = new Booking();
        booking.setId("BK-TEST2");
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setStartTime(LocalDateTime.now().minusHours(2));
        booking.setEndTime(LocalDateTime.now().plusHours(1));
        booking.setGuestCount(5);
        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        mockMvc.perform(put("/api/bookings/BK-TEST2/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        Room updated = roomRepository.findById("R3").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(RoomStatus.AVAILABLE, updated.getStatus());
    }

    @Test
    void cancel_setsRoomAvailable() throws Exception {
        Branch branch = createBranch("B4");
        Room room = createRoom("R4", branch, RoomStatus.RESERVED);
        Customer customer = createCustomer("C4", "0904444444");

        Booking booking = new Booking();
        booking.setId("BK-TEST3");
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setStartTime(LocalDateTime.now().plusHours(1));
        booking.setEndTime(LocalDateTime.now().plusHours(3));
        booking.setGuestCount(5);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        mockMvc.perform(put("/api/bookings/BK-TEST3/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELLED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        Room updated = roomRepository.findById("R4").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(RoomStatus.AVAILABLE, updated.getStatus());
    }

    @Test
    void create_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\":\"C1\",\"roomId\":\"R1\",\"startTime\":\"2025-01-01T10:00\",\"endTime\":\"2025-01-01T12:00\",\"guestCount\":5}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_badCustomerId_returns404() throws Exception {
        Branch branch = createBranch("B5");
        Room room = createRoom("R5", branch, RoomStatus.AVAILABLE);

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String customerId = "NONEXISTENT";
                                    public final String roomId = "R5";
                                    public final String startTime = LocalDateTime.now().plusHours(1).toString();
                                    public final String endTime = LocalDateTime.now().plusHours(3).toString();
                                    public final int guestCount = 5;
                                }
                        )))
                .andExpect(status().isNotFound());
    }
}
