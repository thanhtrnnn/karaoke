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
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RoomReceiptControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private RoomReceiptRepository roomReceiptRepository;
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

    private Room createRoomWithOrder(String roomId, String orderId, String productId, int qty, BigDecimal price) {
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

        return room;
    }

    @Test
    void generate_computesServiceTotal() throws Exception {
        createRoomWithOrder("INV-R1", "INV-O1", "INV-P1", 2, new BigDecimal("30000"));

        mockMvc.perform(post("/api/room-receipts/generate?roomId=INV-R1")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.serviceFee").value(60000))
                .andExpect(jsonPath("$.roomFee").value(200000))
                .andExpect(jsonPath("$.totalAmount").value(260000));
    }

    @Test
    void pay_setsStatusPaidAndPaidAt() throws Exception {
        createRoomWithOrder("INV-R2", "INV-O2", "INV-P2", 1, new BigDecimal("50000"));

        String response = mockMvc.perform(post("/api/room-receipts/generate?roomId=INV-R2")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String receiptId = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(response).get("id").asText();

        mockMvc.perform(put("/api/room-receipts/" + receiptId + "/pay")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paidAt").exists())
                .andExpect(jsonPath("$.paymentMethod").value("CASH"));
    }

    @Test
    void generate_withoutToken_returns403() throws Exception {
        mockMvc.perform(post("/api/room-receipts/generate?roomId=INV-R1"))
                .andExpect(status().isForbidden());
    }
}
