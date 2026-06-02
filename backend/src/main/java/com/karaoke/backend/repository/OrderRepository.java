package com.karaoke.backend.repository;

import com.karaoke.backend.domain.Order;
import com.karaoke.backend.domain.OrderStatus;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, String> {
    @Override
    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.product"})
    List<Order> findAll();

    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.product"})
    List<Order> findByStatus(OrderStatus status);

    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.product"})
    List<Order> findByRoomId(String roomId);
}
