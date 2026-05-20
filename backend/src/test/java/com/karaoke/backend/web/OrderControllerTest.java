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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private ServiceOrderRepository orderRepository;
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

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private Room createRoom(String id, Branch branch) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setType("VIP");
        r.setCapacity(10);
        r.setHourlyPrice(new BigDecimal("100000"));
        r.setStatus(RoomStatus.OCCUPIED);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private MenuItem createMenuItem(String id, int stock) {
        MenuItem m = new MenuItem();
        m.setId(id);
        m.setName("Item " + id);
        m.setCategory("Do uong");
        m.setPrice(new BigDecimal("30000"));
        m.setStock(stock);
        m.setActive(true);
        return menuItemRepository.save(m);
    }

    @Test
    void create_decrementsStock() throws Exception {
        Branch branch = createBranch("B1");
        Room room = createRoom("R1", branch);
        MenuItem item = createMenuItem("M1", 10);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R1";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String menuItemId = "M1";
                                                public final int quantity = 3;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items[0].quantity").value(3));

        MenuItem updated = menuItemRepository.findById("M1").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(7, updated.getStock());
    }

    @Test
    void create_insufficientStock_returns400() throws Exception {
        Branch branch = createBranch("B2");
        Room room = createRoom("R2", branch);
        MenuItem item = createMenuItem("M2", 2);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R2";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String menuItemId = "M2";
                                                public final int quantity = 5;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Not enough stock")));
    }

    @Test
    void updateStatus_transitions() throws Exception {
        Branch branch = createBranch("B3");
        Room room = createRoom("R3", branch);
        MenuItem item = createMenuItem("M3", 10);

        ServiceOrder order = new ServiceOrder();
        order.setId("ORD-TEST1");
        order.setRoom(room);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderedAt(java.time.LocalDateTime.now());
        ServiceOrderItem soi = new ServiceOrderItem();
        soi.setOrder(order);
        soi.setMenuItem(item);
        soi.setQuantity(1);
        soi.setUnitPrice(item.getPrice());
        order.setItems(java.util.List.of(soi));
        orderRepository.save(order);

        mockMvc.perform(put("/api/orders/ORD-TEST1/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PREPARING\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));

        mockMvc.perform(put("/api/orders/ORD-TEST1/status")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"SERVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SERVED"));
    }

    @Test
    void create_setsCorrectUnitPrice() throws Exception {
        Branch branch = createBranch("B4");
        Room room = createRoom("R4", branch);
        MenuItem item = createMenuItem("M4", 10);
        item.setPrice(new BigDecimal("50000"));
        menuItemRepository.save(item);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R4";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String menuItemId = "M4";
                                                public final int quantity = 2;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].unitPrice").value(50000));
    }
}
