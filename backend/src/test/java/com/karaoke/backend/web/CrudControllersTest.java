package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("CRUD Controllers — UC16: Chi nhánh, UC17: Khách hàng, UC18: Hạng HV, UC19: Loại phòng, UC20: Phòng/NV")
class CrudControllersTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private MembershipTierRepository membershipTierRepository;
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
    }

    // --- Branch CRUD ---
    @Test
    @DisplayName("UC16 — CRUD chi nhánh: tạo, đọc, sửa, xóa")
    void UC16_branch_crud() throws Exception {
        mockMvc.perform(post("/api/branches")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BR-TEST\",\"name\":\"Test Branch\",\"address\":\"123 Test St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("BR-TEST"))
                .andExpect(jsonPath("$.name").value("Test Branch"));

        mockMvc.perform(get("/api/branches").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Branch"));

        mockMvc.perform(put("/api/branches/BR-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated Branch\",\"address\":\"456 New St\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Branch"));

        mockMvc.perform(delete("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/branches/BR-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isNotFound());
    }

    // --- Client CRUD (was Customer) ---
    @Test
    @DisplayName("UC17 — CRUD khách hàng: tạo, đọc, sửa, xóa")
    void UC17_client_crud() throws Exception {
        mockMvc.perform(post("/api/clients")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KH-TEST\",\"fullName\":\"Test Client\",\"phone\":\"0909999999\",\"tier\":\"Dong\",\"loyaltyPoints\":0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KH-TEST"));

        mockMvc.perform(get("/api/clients").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/clients/KH-TEST")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated Client\",\"phone\":\"0909999999\",\"tier\":\"Bac\",\"loyaltyPoints\":100}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Client"));

        mockMvc.perform(delete("/api/clients/KH-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Room CRUD + PATCH status (room needs RoomType) ---
    @Test
    @DisplayName("UC20 — CRUD phòng + đổi trạng thái PATCH")
    void UC20_room_crudAndPatchStatus() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-ROOM");
        branch.setName("Branch for Room");
        branchRepository.save(branch);

        RoomType rt = new RoomType();
        rt.setId("RT-TEST");
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"RM-TEST\",\"name\":\"Test Room\",\"roomType\":{\"id\":\"RT-TEST\"},\"capacity\":10,\"price\":100000,\"status\":\"AVAILABLE\",\"branch\":{\"id\":\"BR-ROOM\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        mockMvc.perform(patch("/api/rooms/RM-TEST/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"OCCUPIED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OCCUPIED"));

        mockMvc.perform(delete("/api/rooms/RM-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Product CRUD (was MenuItem at /api/menu-items) ---
    @Test
    @DisplayName("UC15 — CRUD sản phẩm menu")
    void UC15_product_crud() throws Exception {
        mockMvc.perform(post("/api/products")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"SP-TEST\",\"name\":\"Test Product\",\"category\":\"Do uong\",\"price\":30000,\"stock\":10,\"safetyStock\":5,\"active\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("SP-TEST"));

        mockMvc.perform(get("/api/products?category=Do uong").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/products/SP-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Employee CRUD ---
    @Test
    @DisplayName("UC20 — CRUD nhân viên")
    void UC20_employee_crud() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-EMP");
        branch.setName("Branch for Employee");
        branchRepository.save(branch);

        mockMvc.perform(post("/api/employees")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"NV-TEST\",\"fullName\":\"Test Employee\",\"phone\":\"0988888888\",\"role\":\"RECEPTIONIST\",\"branch\":{\"id\":\"BR-EMP\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("NV-TEST"));

        mockMvc.perform(get("/api/employees").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/employees/NV-TEST").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- RoomType CRUD ---
    @Test
    @DisplayName("UC19 — CRUD loại phòng")
    void UC19_roomType_crud() throws Exception {
        mockMvc.perform(post("/api/room-types")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"RT-VIP\",\"nameType\":\"VIP\",\"capacity\":12,\"price\":150000,\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("RT-VIP"))
                .andExpect(jsonPath("$.nameType").value("VIP"));

        mockMvc.perform(get("/api/room-types").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(put("/api/room-types/RT-VIP")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nameType\":\"VIP Plus\",\"capacity\":15,\"price\":200000,\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameType").value("VIP Plus"));

        mockMvc.perform(delete("/api/room-types/RT-VIP").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- Promotion CRUD ---
    @Test
    @DisplayName("UC08 — CRUD khuyến mãi/voucher")
    void UC08_promotion_crud() throws Exception {
        mockMvc.perform(post("/api/promotions")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"KM-001\",\"name\":\"Giam 10%\",\"type\":\"PhanTram\",\"redeem\":10,\"startDate\":\"2026-01-01\",\"validUntil\":\"2026-12-31\",\"status\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("KM-001"))
                .andExpect(jsonPath("$.name").value("Giam 10%"));

        mockMvc.perform(get("/api/promotions").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(delete("/api/promotions/KM-001").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk());
    }

    // --- UC16: TC02 — Thêm chi nhánh tên trùng → 409 ---
    @Test
    @DisplayName("UC16 — Trùng tên chi nhánh trả 409")
    void UC16_branchDuplicateName_returns409() throws Exception {
        mockMvc.perform(post("/api/branches")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BR-DUP1\",\"name\":\"Branch Dup\",\"address\":\"Addr\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/branches")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"BR-DUP2\",\"name\":\"Branch Dup\",\"address\":\"Addr2\"}"))
                .andExpect(status().isConflict());
    }

    // --- UC16: TC05 — Xóa chi nhánh có phòng → 409 ---
    @Test
    @DisplayName("UC16 — Xóa chi nhánh còn phòng trả 409")
    void UC16_deleteBranchWithRooms_returns409() throws Exception {
        // Create branch with room
        Branch branch = new Branch();
        branch.setId("BR-WITHROOM");
        branch.setName("Branch With Room");
        branchRepository.save(branch);

        RoomType rt = new RoomType();
        rt.setId("RT-BRWR");
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        Room room = new Room();
        room.setId("RM-BRWR");
        room.setName("Room in Branch");
        room.setRoomType(rt);
        room.setCapacity(10);
        room.setPrice(new BigDecimal("100000"));
        room.setStatus(RoomStatus.AVAILABLE);
        room.setBranch(branch);
        roomRepository.save(room);

        mockMvc.perform(delete("/api/branches/BR-WITHROOM")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isConflict());
    }

    // --- UC17: TC09 — Khóa tài khoản khách hàng ---
    @Test
    @DisplayName("UC17 — Khóa/mở tài khoản khách hàng")
    void UC17_lockClientAccount_togglesStatus() throws Exception {
        // Create client
        Client c = new Client();
        c.setId("KH-LOCK");
        c.setFullName("Lock Test");
        c.setPhone("0909999990");
        c.setTier("Dong");
        c.setLoyaltyPoints(0);
        clientRepository.save(c);

        mockMvc.perform(patch("/api/clients/KH-LOCK/lock")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value(false));

        // Toggle again → back to true
        mockMvc.perform(patch("/api/clients/KH-LOCK/lock")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value(true));
    }

    // --- UC18: TC12 — Nâng hạng thủ công ---
    @Test
    @DisplayName("UC18 — Nâng hạng thủ công thành công")
    void UC18_manualTierUpgrade_success() throws Exception {
        // Create tier first
        MembershipTier tier = new MembershipTier();
        tier.setTierName("Bac");
        tier.setMinPoints(100);
        tier.setDescription("Hang bac");
        tier.setDiscountRate("0.95");
        membershipTierRepository.save(tier);

        // Create client
        Client c = new Client();
        c.setId("KH-UPGRADE");
        c.setFullName("Upgrade Test");
        c.setPhone("0909999991");
        c.setTier("Dong");
        c.setLoyaltyPoints(0);
        clientRepository.save(c);

        mockMvc.perform(patch("/api/membership/clients/KH-UPGRADE/tier")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tierName\":\"Bac\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tier").value("Bac"));
    }

    // --- UC19: TC17 — Xóa loại phòng đang sử dụng → 409 ---
    @Test
    @DisplayName("UC19 — Xóa loại phòng đang sử dụng trả 409")
    void UC19_deleteRoomTypeInUse_returns409() throws Exception {
        // Create RoomType + Room using it
        RoomType rt = new RoomType();
        rt.setId("RT-INUSE");
        rt.setNameType("InUse");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        Branch branch = new Branch();
        branch.setId("BR-RTUSE");
        branch.setName("Branch RT");
        branchRepository.save(branch);

        Room room = new Room();
        room.setId("RM-RTUSE");
        room.setName("Room Using RT");
        room.setRoomType(rt);
        room.setCapacity(10);
        room.setPrice(new BigDecimal("100000"));
        room.setStatus(RoomStatus.AVAILABLE);
        room.setBranch(branch);
        roomRepository.save(room);

        mockMvc.perform(delete("/api/room-types/RT-INUSE")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isConflict());
    }

    // --- UC20: TC22 — Xóa phòng có booking → 409 ---
    @Test
    @DisplayName("UC20 — Xóa phòng đang có booking trả 409")
    void UC20_deleteRoomWithBooking_returns409() throws Exception {
        Branch branch = new Branch();
        branch.setId("BR-RMBOOK");
        branch.setName("Branch RB");
        branchRepository.save(branch);

        RoomType rt = new RoomType();
        rt.setId("RT-RMBOOK");
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        Room room = new Room();
        room.setId("RM-BOOKED");
        room.setName("Booked Room");
        room.setRoomType(rt);
        room.setCapacity(10);
        room.setPrice(new BigDecimal("100000"));
        room.setStatus(RoomStatus.OCCUPIED);
        room.setBranch(branch);
        roomRepository.save(room);

        Client client = new Client();
        client.setId("KH-RMBOOK");
        client.setFullName("Book Client");
        client.setPhone("0909999992");
        clientRepository.save(client);

        com.karaoke.backend.domain.Booking booking = new com.karaoke.backend.domain.Booking();
        booking.setId("BK-RMBOOK");
        booking.setCustomer(client);
        booking.setRoom(room);
        booking.setStartTime(java.time.LocalDateTime.now().plusHours(1));
        booking.setEndTime(java.time.LocalDateTime.now().plusHours(3));
        booking.setGuestCount(5);
        booking.setStatus(com.karaoke.backend.domain.BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        mockMvc.perform(delete("/api/rooms/RM-BOOKED")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isConflict());
    }

    // --- Protected endpoints without token return 403 ---
    @Test
    @DisplayName("Bảo vệ — Endpoint không có token trả 403")
    void protectedEndpoints_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/branches")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/clients")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/rooms")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/room-types")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/promotions")).andExpect(status().isForbidden());
    }
}
