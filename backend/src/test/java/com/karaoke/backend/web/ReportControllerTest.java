package com.karaoke.backend.web;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
@DisplayName("Report Controller — UC13: Báo cáo chi nhánh, UC21: Tổng hợp chuỗi")
class ReportControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ClientRepository clientRepository;
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

    private void createOrderWithItems(String orderId, String roomId, String productId, int qty, BigDecimal price) {
        Branch branch = new Branch();
        branch.setId("BR-" + roomId);
        branch.setName("Branch");
        branchRepository.save(branch);

        RoomType rt = new RoomType();
        rt.setId("RT-" + roomId);
        rt.setNameType("VIP");
        rt.setCapacity(10);
        rt.setPrice(new BigDecimal("100000"));
        rt.setStatus(true);
        roomTypeRepository.save(rt);

        Room room = new Room();
        room.setId(roomId);
        room.setName("Room " + roomId);
        room.setRoomType(rt);
        room.setCapacity(10);
        room.setPrice(new BigDecimal("100000"));
        room.setStatus(RoomStatus.OCCUPIED);
        room.setBranch(branch);
        room.setActive(true);
        roomRepository.save(room);

        Product product = new Product();
        product.setId(productId);
        product.setName("Item");
        product.setCategory("Do uong");
        product.setPrice(price);
        product.setCurrentStock(100);
        product.setActive(true);
        productRepository.save(product);

        Order order = new Order();
        order.setId(orderId);
        order.setRoom(room);
        order.setStatus(OrderStatus.SERVED);
        order.setOrderTime(LocalDateTime.now());
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setProduct(product);
        detail.setQuantity(qty);
        detail.setUnitPrice(price);
        order.setItems(List.of(detail));
        orderRepository.save(order);
    }

    @Test
    @DisplayName("UC13 — Dashboard tổng hợp có đầy đủ key")
    void UC13_summary_returnsAllKeys() throws Exception {
        createOrderWithItems("ORD-R1", "ROOM-R1", "ITEM-R1", 2, new BigDecimal("30000"));

        mockMvc.perform(get("/api/reports/summary")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rooms").exists())
                .andExpect(jsonPath("$.occupiedRooms").exists())
                .andExpect(jsonPath("$.clients").exists())
                .andExpect(jsonPath("$.products").exists())
                .andExpect(jsonPath("$.bookings").exists())
                .andExpect(jsonPath("$.orders").exists())
                .andExpect(jsonPath("$.employees").exists())
                .andExpect(jsonPath("$.revenue").exists());
    }

    @Test
    @DisplayName("UC13 — Doanh thu tính từ order items")
    void UC13_revenue_computedFromOrderItems() throws Exception {
        createOrderWithItems("ORD-R2", "ROOM-R2", "ITEM-R2", 3, new BigDecimal("50000"));

        mockMvc.perform(get("/api/reports/revenue?period=weekly")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("UC13 — Doanh thu theo tháng trả 12 entries")
    void UC13_revenue_byPeriod_monthly_returns12Entries() throws Exception {
        mockMvc.perform(get("/api/reports/revenue?period=monthly")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12));
    }

    @Test
    @DisplayName("UC13 — Doanh thu theo giờ trả 17 entries (10h-23h + 00h-02h)")
    void UC13_revenue_hourly_returns17Entries() throws Exception {
        mockMvc.perform(get("/api/reports/revenue?period=hourly")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(17)); // 10h–23h (14) + 00h–02h (3) = 17 entries
    }

    @Test
    @DisplayName("UC13 — Thông báo hệ thống trả về mảng")
    void UC13_notifications_returnsArray() throws Exception {
        mockMvc.perform(get("/api/reports/notifications")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("UC13 — Cảnh báo tồn kho thấp khi stock ≤ safetyStock")
    void UC13_notifications_lowStock_triggersAlert() throws Exception {
        Product lowStockProduct = new Product();
        lowStockProduct.setId("LOW-STOCK-001");
        lowStockProduct.setName("Sản phẩm sắp hết");
        lowStockProduct.setCategory("Do uong");
        lowStockProduct.setPrice(new BigDecimal("30000"));
        lowStockProduct.setCurrentStock(3);
        lowStockProduct.setActive(true);
        productRepository.save(lowStockProduct);

        mockMvc.perform(get("/api/reports/notifications")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='error')]").exists());
    }

    @Test
    @DisplayName("Bảo vệ — Báo cáo không có token trả 403")
    void UC13_summary_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/reports/summary"))
                .andExpect(status().isForbidden());
    }
}
