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
class InvoiceControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private BranchRepository branchRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private ServiceOrderRepository orderRepository;
    @Autowired private InvoiceRepository invoiceRepository;
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

    private Room createRoomWithOrder(String roomId, String orderId, String itemId, int qty, BigDecimal price) {
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

        return room;
    }

    @Test
    void generate_computesServiceTotal() throws Exception {
        createRoomWithOrder("INV-R1", "INV-O1", "INV-I1", 2, new BigDecimal("30000"));

        mockMvc.perform(post("/api/invoices/generate?roomId=INV-R1")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.serviceTotal").value(60000))
                .andExpect(jsonPath("$.roomTotal").value(200000))
                .andExpect(jsonPath("$.grandTotal").value(260000));
    }

    @Test
    void pay_setsStatusPaidAndPaidAt() throws Exception {
        createRoomWithOrder("INV-R2", "INV-O2", "INV-I2", 1, new BigDecimal("50000"));

        String response = mockMvc.perform(post("/api/invoices/generate?roomId=INV-R2")
                        .header("Authorization", ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String invoiceId = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(response).get("id").asText();

        mockMvc.perform(put("/api/invoices/" + invoiceId + "/pay")
                        .header("Authorization", ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\":\"CASH\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paidAt").exists())
                .andExpect(jsonPath("$.paymentMethod").value("CASH"));
    }

    @Test
    void generate_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/api/invoices/generate?roomId=INV-R1"))
                .andExpect(status().isForbidden());
    }
}
