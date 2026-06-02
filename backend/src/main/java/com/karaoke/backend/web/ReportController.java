package com.karaoke.backend.web;

import com.karaoke.backend.domain.Order;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.OrderRepository;
import com.karaoke.backend.repository.ProductRepository;
import com.karaoke.backend.repository.RoomReceiptRepository;
import com.karaoke.backend.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Báo cáo nhanh cho dashboard")
public class ReportController {
    private final RoomRepository rooms;
    private final ClientRepository clients;
    private final ProductRepository products;
    private final BookingRepository bookings;
    private final RoomReceiptRepository receipts;
    private final EmployeeRepository employees;
    private final OrderRepository orders;

    public ReportController(
            RoomRepository rooms,
            ClientRepository clients,
            ProductRepository products,
            BookingRepository bookings,
            RoomReceiptRepository receipts,
            EmployeeRepository employees,
            OrderRepository orders
    ) {
        this.rooms = rooms;
        this.clients = clients;
        this.products = products;
        this.bookings = bookings;
        this.receipts = receipts;
        this.employees = employees;
        this.orders = orders;
    }

    @GetMapping("/summary")
    @Operation(
            summary = "Tổng hợp số liệu dashboard",
            responses = @ApiResponse(responseCode = "200", description = "Số liệu tổng hợp",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "rooms": 5,
                              "occupiedRooms": 1,
                              "clients": 4,
                              "products": 10,
                              "bookings": 0,
                              "orders": 0,
                              "employees": 3,
                              "revenue": 0
                            }
                            """)))
    )
    Map<String, Object> summary() {
        BigDecimal revenue = orders.findAll().stream()
                .map(order -> order.getItems() == null ? BigDecimal.ZERO :
                        order.getItems().stream()
                                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long occupiedRooms = rooms.findAll().stream()
                .filter(room -> room.getStatus() == RoomStatus.OCCUPIED)
                .count();

        return Map.of(
                "rooms", rooms.count(),
                "occupiedRooms", occupiedRooms,
                "clients", clients.count(),
                "products", products.count(),
                "bookings", bookings.count(),
                "orders", orders.count(),
                "employees", employees.count(),
                "revenue", revenue
        );
    }

    @GetMapping("/revenue")
    @Operation(
            summary = "Doanh thu theo thời gian",
            description = "Trả về dữ liệu doanh thu theo giờ/ngày/tháng. Giá trị period: hourly, weekly, monthly"
    )
    List<Map<String, Object>> revenue(@RequestParam(defaultValue = "weekly") String period) {
        ZoneId gmt7 = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(gmt7);
        List<Map<String, Object>> result = new ArrayList<>();
        List<Order> allOrders = orders.findAll();

        java.util.function.Function<Order, BigDecimal> orderTotal = order ->
                order.getItems() == null ? BigDecimal.ZERO :
                order.getItems().stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        switch (period) {
            case "hourly" -> {
                Map<Integer, BigDecimal> hourMap = new LinkedHashMap<>();
                for (int h = 0; h <= 23; h++) hourMap.put(h, BigDecimal.ZERO);
                for (Order o : allOrders) {
                    if (o.getOrderedAt() == null) continue;
                    ZonedDateTime ordered = o.getOrderedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(gmt7);
                    if (ordered.toLocalDate().equals(now.toLocalDate())) {
                        hourMap.merge(ordered.getHour(), orderTotal.apply(o), BigDecimal::add);
                    }
                }
                for (int h = 10; h <= 23; h++) {
                    result.add(Map.of("label", String.format("%02dh", h), "value", hourMap.get(h).longValue()));
                }
                for (int h = 0; h <= 2; h++) {
                    result.add(Map.of("label", String.format("%02dh", h), "value", hourMap.get(h).longValue()));
                }
            }
            case "weekly" -> {
                Map<DayOfWeek, BigDecimal> dayMap = new LinkedHashMap<>();
                for (DayOfWeek d : DayOfWeek.values()) dayMap.put(d, BigDecimal.ZERO);
                ZonedDateTime weekStart = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toLocalDate().atStartOfDay(gmt7);
                for (Order o : allOrders) {
                    if (o.getOrderedAt() == null) continue;
                    ZonedDateTime ordered = o.getOrderedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(gmt7);
                    if (!ordered.isBefore(weekStart) && ordered.isBefore(weekStart.plusWeeks(1))) {
                        dayMap.merge(ordered.getDayOfWeek(), orderTotal.apply(o), BigDecimal::add);
                    }
                }
                String[] dayLabels = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
                DayOfWeek[] days = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                        DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY};
                for (int i = 0; i < 7; i++) {
                    result.add(Map.of("label", dayLabels[i], "value", dayMap.get(days[i]).longValue()));
                }
            }
            case "monthly" -> {
                Map<Integer, BigDecimal> monthMap = new LinkedHashMap<>();
                for (int m = 1; m <= 12; m++) monthMap.put(m, BigDecimal.ZERO);
                for (Order o : allOrders) {
                    if (o.getOrderedAt() == null) continue;
                    ZonedDateTime ordered = o.getOrderedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(gmt7);
                    if (ordered.getYear() == now.getYear()) {
                        monthMap.merge(ordered.getMonthValue(), orderTotal.apply(o), BigDecimal::add);
                    }
                }
                for (int m = 1; m <= 12; m++) {
                    result.add(Map.of("label", "Th" + m, "value", monthMap.get(m).longValue()));
                }
            }
        }
        return result;
    }

    @GetMapping("/notifications")
    @Operation(summary = "Thông báo hệ thống tự động")
    List<Map<String, String>> notifications() {
        List<Map<String, String>> result = new ArrayList<>();

        products.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 10 && p.isActive())
                .forEach(p -> {
                    Map<String, String> notif = new LinkedHashMap<>();
                    notif.put("id", "stock-" + p.getId());
                    notif.put("title", "Kho " + p.getName() + " sắp hết (" + p.getStock() + " còn lại)");
                    notif.put("time", "Vừa xong");
                    notif.put("type", "error");
                    result.add(notif);
                });

        orders.findByStatus(OrderStatus.PENDING).forEach(order -> {
            Map<String, String> notif = new LinkedHashMap<>();
            notif.put("id", "order-" + order.getId());
            notif.put("title", "Order " + order.getId() + " - Phòng " + order.getRoom().getName() + " chờ xử lý");
            notif.put("time", "Vừa xong");
            notif.put("type", "warning");
            result.add(notif);
        });

        rooms.findByStatus(RoomStatus.OCCUPIED).forEach(room -> {
            Map<String, String> notif = new LinkedHashMap<>();
            notif.put("id", "room-" + room.getId());
            notif.put("title", "Phòng " + room.getName() + " đang có khách");
            notif.put("time", "Đang hoạt động");
            notif.put("type", "success");
            result.add(notif);
        });

        return result;
    }
}
