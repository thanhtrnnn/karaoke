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
class OrderRepositoryTest {

    @Autowired private OrderRepository orderRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private RoomTypeRepository roomTypeRepository;

    private Branch createBranch(String id) {
        Branch b = new Branch();
        b.setId(id);
        b.setName("Branch " + id);
        return branchRepository.save(b);
    }

    private RoomType createRoomType(String id) {
        RoomType rt = new RoomType();
        rt.setId(id);
        rt.setTenLoai("VIP");
        rt.setSucChua(10);
        rt.setGiaCuoc(new BigDecimal("100000"));
        rt.setTrangThai(true);
        return roomTypeRepository.save(rt);
    }

    private Room createRoom(String id, Branch branch, RoomType roomType, RoomStatus status) {
        Room r = new Room();
        r.setId(id);
        r.setName("Room " + id);
        r.setRoomType(roomType);
        r.setCapacity(10);
        r.setHourlyPrice(new BigDecimal("100000"));
        r.setStatus(status);
        r.setBranch(branch);
        r.setActive(true);
        return roomRepository.save(r);
    }

    private Product createProduct(String id, String name, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setCategory("Do uong");
        p.setPrice(new BigDecimal("30000"));
        p.setStock(stock);
        p.setActive(true);
        return productRepository.save(p);
    }

    private Order createOrder(String id, Room room, Product product, int qty) {
        Order order = new Order();
        order.setId(id);
        order.setRoom(room);
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setProduct(product);
        detail.setQuantity(qty);
        detail.setUnitPrice(product.getPrice());
        order.setItems(List.of(detail));
        return orderRepository.save(order);
    }

    @Test
    void findAll_returnsEagerlyLoadedRelations() {
        Branch branch = createBranch("B1");
        RoomType rt = createRoomType("RT1");
        Room room = createRoom("R1", branch, rt, RoomStatus.AVAILABLE);
        Product product = createProduct("P1", "Bia", 10);
        createOrder("O1", room, product, 2);

        List<Order> orders = orderRepository.findAll();
        assertFalse(orders.isEmpty());
        Order o = orders.get(0);
        assertNotNull(o.getRoom());
        assertNotNull(o.getRoom().getBranch());
        assertFalse(o.getItems().isEmpty());
        assertNotNull(o.getItems().get(0).getProduct());
    }

    @Test
    void findByStatus_filtersCorrectly() {
        Branch branch = createBranch("B2");
        RoomType rt = createRoomType("RT2");
        Room room = createRoom("R2", branch, rt, RoomStatus.AVAILABLE);
        Product product = createProduct("P2", "Nuoc", 10);
        createOrder("O2", room, product, 1);

        List<Order> pending = orderRepository.findByStatus(OrderStatus.PENDING);
        assertFalse(pending.isEmpty());
        pending.forEach(o -> assertEquals(OrderStatus.PENDING, o.getStatus()));

        List<Order> served = orderRepository.findByStatus(OrderStatus.SERVED);
        served.forEach(o -> assertEquals(OrderStatus.SERVED, o.getStatus()));
    }

    @Test
    void findByRoomId_returnsOnlyThatRoomsOrders() {
        Branch branch = createBranch("B3");
        RoomType rt = createRoomType("RT3");
        Room room1 = createRoom("R3", branch, rt, RoomStatus.AVAILABLE);
        Room room2 = createRoom("R4", branch, rt, RoomStatus.AVAILABLE);
        Product product = createProduct("P3", "Trai cay", 10);
        createOrder("O3", room1, product, 1);
        createOrder("O4", room2, product, 1);

        List<Order> room1Orders = orderRepository.findByRoomId("R3");
        assertEquals(1, room1Orders.size());
        assertEquals("R3", room1Orders.get(0).getRoom().getId());
    }
}
