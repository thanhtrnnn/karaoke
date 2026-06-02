package com.karaoke.backend.web;

import com.karaoke.backend.domain.Order;
import com.karaoke.backend.domain.OrderDetail;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.Product;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.repository.OrderRepository;
import com.karaoke.backend.repository.ProductRepository;
import com.karaoke.backend.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
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
    private final OrderRepository orders;
    private final RoomRepository rooms;
    private final ProductRepository products;

    public OrderController(OrderRepository orders, RoomRepository rooms, ProductRepository products) {
        this.orders = orders;
        this.rooms = rooms;
        this.products = products;
    }

    @GetMapping
    @Operation(summary = "Danh sách order dịch vụ")
    List<OrderResponse> list(@RequestParam(required = false) OrderStatus status) {
        List<Order> result = status == null ? orders.findAll() : orders.findByStatus(status);
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
                                {"productId": "SP001", "quantity": 3},
                                {"productId": "SP010", "quantity": 1}
                              ]
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Order đã tạo")
    )
    @Transactional
    OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        Room room = rooms.findById(request.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + request.roomId()));
        Order order = new Order();
        order.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setRoom(room);
        order.setOrderedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());

        for (CreateOrderItemRequest itemRequest : request.items()) {
            Product product = products.findById(itemRequest.productId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemRequest.productId()));
            if (product.getStock() < itemRequest.quantity()) {
                throw new IllegalArgumentException("Not enough stock for " + product.getName());
            }
            product.setStock(product.getStock() - itemRequest.quantity());
            products.save(product);

            OrderDetail item = new OrderDetail(null, order, product, itemRequest.quantity(), product.getPrice());
            order.getItems().add(item);
        }
        return OrderResponse.from(orders.save(order));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái order")
    OrderResponse updateStatus(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
        order.setStatus(request.status());
        return OrderResponse.from(orders.save(order));
    }

    record CreateOrderRequest(@NotBlank String roomId, @NotEmpty List<CreateOrderItemRequest> items) {}

    record CreateOrderItemRequest(@NotBlank String productId, @Min(1) int quantity) {}

    record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}

    record OrderResponse(String id, String roomId, String roomName, LocalDateTime orderedAt, OrderStatus status, List<OrderItemResponse> items) {
        static OrderResponse from(Order order) {
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

    record OrderItemResponse(String productId, String name, int quantity, BigDecimal unitPrice) {
        static OrderItemResponse from(OrderDetail item) {
            return new OrderItemResponse(
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getUnitPrice()
            );
        }
    }
}
