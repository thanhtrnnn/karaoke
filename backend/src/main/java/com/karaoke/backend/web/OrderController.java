package com.karaoke.backend.web;

import com.karaoke.backend.domain.MenuItem;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.ServiceOrder;
import com.karaoke.backend.domain.ServiceOrderItem;
import com.karaoke.backend.repository.MenuItemRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.ServiceOrderRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Gọi món và quản lý trạng thái phục vụ")
public class OrderController {
    private final ServiceOrderRepository orders;
    private final RoomRepository rooms;
    private final MenuItemRepository menuItems;

    public OrderController(ServiceOrderRepository orders, RoomRepository rooms, MenuItemRepository menuItems) {
        this.orders = orders;
        this.rooms = rooms;
        this.menuItems = menuItems;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách order dịch vụ",
            responses = @ApiResponse(responseCode = "200", description = "Danh sách order",
                    content = @Content(examples = @ExampleObject(value = """
                            [
                              {
                                "id": "ORD001",
                                "roomId": "P01",
                                "roomName": "VIP 01",
                                "orderedAt": "2026-05-06T18:15:00",
                                "status": "PENDING",
                                "items": [
                                  {"menuItemId": "SP001", "name": "Bia Tiger", "quantity": 2, "unitPrice": 30000.00}
                                ]
                              }
                            ]
                            """)))
    )
    List<OrderResponse> list(@RequestParam(required = false) OrderStatus status) {
        List<ServiceOrder> result = status == null ? orders.findAll() : orders.findByStatus(status);
        return result.stream().map(OrderResponse::from).toList();
    }

    @PostMapping
    @Operation(
            summary = "Tạo order gọi món",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "roomId": "P01",
                              "items": [
                                {"menuItemId": "SP001", "quantity": 3},
                                {"menuItemId": "SP010", "quantity": 1}
                              ]
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Order đã tạo",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "ORD-A1B2C3D4",
                              "roomId": "P01",
                              "roomName": "VIP 01",
                              "orderedAt": "2026-05-06T18:20:00",
                              "status": "PENDING",
                              "items": [
                                {"menuItemId": "SP001", "name": "Bia Tiger", "quantity": 3, "unitPrice": 30000.00},
                                {"menuItemId": "SP010", "name": "Trái cây dĩa", "quantity": 1, "unitPrice": 120000.00}
                              ]
                            }
                            """)))
    )
    OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        Room room = rooms.findById(request.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + request.roomId()));
        ServiceOrder order = new ServiceOrder();
        order.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setRoom(room);
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());

        for (CreateOrderItemRequest itemRequest : request.items()) {
            MenuItem menuItem = menuItems.findById(itemRequest.menuItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Menu item not found: " + itemRequest.menuItemId()));
            if (menuItem.getStock() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Not enough stock for " + menuItem.getName());
            }
            menuItem.setStock(menuItem.getStock() - itemRequest.quantity());
            menuItems.save(menuItem);

            ServiceOrderItem item = new ServiceOrderItem(null, order, menuItem, itemRequest.quantity(), menuItem.getPrice());
            order.getItems().add(item);
        }
        return OrderResponse.from(orders.save(order));
    }

    @PutMapping("/{id}/status")
    @Operation(
            summary = "Cập nhật trạng thái order",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "status": "PREPARING"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Trạng thái order đã cập nhật",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "ORD001",
                              "roomId": "P01",
                              "roomName": "VIP 01",
                              "status": "PREPARING",
                              "items": [
                                {"menuItemId": "SP001", "name": "Bia Tiger", "quantity": 2, "unitPrice": 30000.00}
                              ]
                            }
                            """)))
    )
    OrderResponse updateStatus(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        ServiceOrder order = orders.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        order.setStatus(request.status());
        return OrderResponse.from(orders.save(order));
    }

    record CreateOrderRequest(@NotBlank String roomId, @NotEmpty List<CreateOrderItemRequest> items) {
    }

    record CreateOrderItemRequest(@NotBlank String menuItemId, int quantity) {
    }

    record UpdateOrderStatusRequest(@NotNull OrderStatus status) {
    }

    record OrderResponse(String id, String roomId, String roomName, LocalDateTime orderedAt, OrderStatus status, List<OrderItemResponse> items) {
        static OrderResponse from(ServiceOrder order) {
            return new OrderResponse(
                    order.getId(),
                    order.getRoom().getId(),
                    order.getRoom().getName(),
                    order.getOrderedAt(),
                    order.getStatus(),
                    order.getItems().stream().map(OrderItemResponse::from).toList()
            );
        }
    }

    record OrderItemResponse(String menuItemId, String name, int quantity, BigDecimal unitPrice) {
        static OrderItemResponse from(ServiceOrderItem item) {
            return new OrderItemResponse(
                    item.getMenuItem().getId(),
                    item.getMenuItem().getName(),
                    item.getQuantity(),
                    item.getUnitPrice()
            );
        }
    }
}
