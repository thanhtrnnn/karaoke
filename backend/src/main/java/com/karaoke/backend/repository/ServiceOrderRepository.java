package com.karaoke.backend.repository;

import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.ServiceOrder;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, String> {
    @Override
    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
    List<ServiceOrder> findAll();

    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
    List<ServiceOrder> findByStatus(OrderStatus status);
}
