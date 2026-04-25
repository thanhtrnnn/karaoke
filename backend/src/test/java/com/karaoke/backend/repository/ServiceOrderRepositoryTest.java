package com.karaoke.backend.repository;

import com.karaoke.backend.domain.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ServiceOrderRepositoryTest {

    @Autowired
    private ServiceOrderRepository orderRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;

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

    private MenuItem createMenuItem(String id, String name, int stock) {
        MenuItem m = new MenuItem();
        m.setId(id);
        m.setName(name);
        m.setCategory("Do uong");
        m.setPrice(new BigDecimal("30000"));
        m.setStock(stock);
        m.setActive(true);
        return menuItemRepository.save(m);
    }

    private ServiceOrder createOrder(String id, Room room, MenuItem item, int qty) {
        ServiceOrder order = new ServiceOrder();
        order.setId(id);
        order.setRoom(room);
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        ServiceOrderItem soi = new ServiceOrderItem();
        soi.setOrder(order);
        soi.setMenuItem(item);
        soi.setQuantity(qty);
        soi.setUnitPrice(item.getPrice());
        order.setItems(List.of(soi));
        return orderRepository.save(order);
    }

    @Test
    void findAll_returnsEagerlyLoadedRelations() {
        Branch branch = createBranch("B1");
        Room room = createRoom("R1", branch, RoomStatus.AVAILABLE);
        MenuItem item = createMenuItem("M1", "Bia", 10);
        createOrder("O1", room, item, 2);

        List<ServiceOrder> orders = orderRepository.findAll();
        assertFalse(orders.isEmpty());
        ServiceOrder o = orders.get(0);
        assertNotNull(o.getRoom());
        assertNotNull(o.getRoom().getBranch());
        assertFalse(o.getItems().isEmpty());
        assertNotNull(o.getItems().get(0).getMenuItem());
    }

    @Test
    void findByStatus_filtersCorrectly() {
        Branch branch = createBranch("B2");
        Room room = createRoom("R2", branch, RoomStatus.AVAILABLE);
        MenuItem item = createMenuItem("M2", "Nuoc", 10);
        createOrder("O2", room, item, 1);

        List<ServiceOrder> pending = orderRepository.findByStatus(OrderStatus.PENDING);
        assertFalse(pending.isEmpty());
        pending.forEach(o -> assertEquals(OrderStatus.PENDING, o.getStatus()));

        List<ServiceOrder> served = orderRepository.findByStatus(OrderStatus.SERVED);
        served.forEach(o -> assertEquals(OrderStatus.SERVED, o.getStatus()));
    }

    @Test
    void findByRoomId_returnsOnlyThatRoomsOrders() {
        Branch branch = createBranch("B3");
        Room room1 = createRoom("R3", branch, RoomStatus.AVAILABLE);
        Room room2 = createRoom("R4", branch, RoomStatus.AVAILABLE);
        MenuItem item = createMenuItem("M3", "Trai cay", 10);
        createOrder("O3", room1, item, 1);
        createOrder("O4", room2, item, 1);

        List<ServiceOrder> room1Orders = orderRepository.findByRoomId("R3");
        assertEquals(1, room1Orders.size());
        assertEquals("R3", room1Orders.get(0).getRoom().getId());
    }
}
