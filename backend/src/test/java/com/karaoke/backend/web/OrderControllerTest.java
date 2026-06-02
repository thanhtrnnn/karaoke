package com.karaoke.backend.web;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Module 4 — Dịch vụ & Sản phẩm (UC08 – Tạo order, UC11 – Quản lý kho)
 * Tests: order creation, stock deduction, insufficient stock, status transitions, unit price
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
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

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private Room createRoom(String id, Branch branch) {
        RoomType rt = new RoomType();
        rt.setId("RT-" + id);
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setRoomType(rt);
        r.setCapacity(10);
        r.setPrice(new BigDecimal("100000"));
        r.setStatus(RoomStatus.OCCUPIED);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private Product createProduct(String id, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName("Product " + id);
        p.setCategory("Do uong");
        p.setPrice(new BigDecimal("30000"));
        p.setCurrentStock(stock);
        p.setActive(true);
        return productRepository.save(p);
    }

    // UC08 — Gọi món: stock giảm sau khi order
    @Test
    void create_decrementsStock() throws Exception {
        Branch branch = createBranch("B1");
        Room room = createRoom("R1", branch);
        createProduct("P1", 10);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R1";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String productId = "P1";
                                                public final int quantity = 3;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items[0].quantity").value(3));

        Product updated = productRepository.findById("P1").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(7, updated.getCurrentStock());
    }

    // UC11 — Kiểm tra tồn kho: không đủ hàng → 400
    @Test
    void create_insufficientStock_returns400() throws Exception {
        Branch branch = createBranch("B2");
        Room room = createRoom("R2", branch);
        createProduct("P2", 2);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R2";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String productId = "P2";
                                                public final int quantity = 5;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Not enough stock")));
    }

    // UC08 — Chuyển trạng thái order: PENDING → PREPARING → SERVED
    @Test
    void updateStatus_transitions() throws Exception {
        Branch branch = createBranch("B3");
        Room room = createRoom("R3", branch);
        Product product = createProduct("P3", 10);

        Order order = new Order();
        order.setId("ORD-TEST1");
        order.setRoom(room);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderTime(java.time.LocalDateTime.now());
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setProduct(product);
        detail.setQuantity(1);
        detail.setUnitPrice(product.getPrice());
        order.setItems(List.of(detail));
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

    // Giá đơn vị ghi nhận đúng tại thời điểm order
    @Test
    void create_setsCorrectUnitPrice() throws Exception {
        Branch branch = createBranch("B4");
        Room room = createRoom("R4", branch);
        Product product = createProduct("P4", 10);
        product.setPrice(new BigDecimal("50000"));
        productRepository.save(product);

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Object() {
                                    public final String roomId = "R4";
                                    public final Object[] items = new Object[]{
                                            new Object() {
                                                public final String productId = "P4";
                                                public final int quantity = 2;
                                            }
                                    };
                                }
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].unitPrice").value(50000));
    }

    // Không có token → 403
    @Test
    void create_withoutToken_returns403() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomId\":\"R1\",\"items\":[]}"))
                .andExpect(status().isForbidden());
    }

    // Danh sách order
    @Test
    void list_returnsArray() throws Exception {
        mockMvc.perform(get("/api/orders").header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
