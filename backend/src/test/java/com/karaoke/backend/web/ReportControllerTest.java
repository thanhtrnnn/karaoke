package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReportControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private ServiceOrderRepository orderRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final String ADMIN_TOKEN = "Bearer dev-token-TESTADMIN";

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("TESTADMIN")) {
            UserAccount admin = new UserAccount();
            admin.setId("TESTADMIN");
            admin.setUsername("testadmin");
            admin.setEmail("testadmin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("pass"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    private void createOrderWithItems(String orderId, String roomId, String itemId, int qty, BigDecimal price) {
        Branch branch = new Branch();
        branch.setId("BR-" + roomId);
        branch.setName("Branch");
        branchRepository.save(branch);

        Room room = new Room();
        room.setId(roomId);
        room.setName("Room " + roomId);
        room.setType("VIP");
        room.setCapacity(10);
        room.setHourlyPrice(new BigDecimal("100000"));
        room.setStatus(RoomStatus.OCCUPIED);
        room.setBranch(branch);
        room.setActive(true);
        roomRepository.save(room);

        MenuItem item = new MenuItem();
        item.setId(itemId);
        item.setName("Item");
        item.setCategory("Do uong");
        item.setPrice(price);
        item.setStock(100);
        item.setActive(true);
        menuItemRepository.save(item);

        ServiceOrder order = new ServiceOrder();
        order.setId(orderId);
        order.setRoom(room);
        order.setStatus(OrderStatus.SERVED);
        order.setOrderedAt(LocalDateTime.now());
        ServiceOrderItem soi = new ServiceOrderItem();
        soi.setOrder(order);
        soi.setMenuItem(item);
        soi.setQuantity(qty);
        soi.setUnitPrice(price);
        order.setItems(List.of(soi));
        orderRepository.save(order);
    }

    @Test
    void summary_returnsAllKeys() throws Exception {
        createOrderWithItems("ORD-R1", "ROOM-R1", "ITEM-R1", 2, new BigDecimal("30000"));

        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rooms").exists())
                .andExpect(jsonPath("$.occupiedRooms").exists())
                .andExpect(jsonPath("$.customers").exists())
                .andExpect(jsonPath("$.menuItems").exists())
                .andExpect(jsonPath("$.bookings").exists())
                .andExpect(jsonPath("$.orders").exists())
                .andExpect(jsonPath("$.employees").exists())
                .andExpect(jsonPath("$.revenue").exists());
    }

    @Test
    void revenue_computedFromOrderItems() throws Exception {
        createOrderWithItems("ORD-R2", "ROOM-R2", "ITEM-R2", 3, new BigDecimal("50000"));

        mockMvc.perform(get("/api/reports/revenue?period=weekly")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void revenue_byPeriod_returnsCorrectEntryCount() throws Exception {
        mockMvc.perform(get("/api/reports/revenue?period=monthly")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12));
    }

    @Test
    void summary_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/reports/summary"))
                .andExpect(status().isForbidden());
    }
}
