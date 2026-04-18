package com.karaoke.backend.web;

import com.karaoke.backend.domain.Invoice;
import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.domain.ServiceOrder;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.MenuItemRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.ServiceOrderRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
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
    private final CustomerRepository customers;
    private final MenuItemRepository menuItems;
    private final BookingRepository bookings;
    private final InvoiceRepository invoices;
    private final EmployeeRepository employees;
    private final ServiceOrderRepository orders;

    public ReportController(
            RoomRepository rooms,
            CustomerRepository customers,
            MenuItemRepository menuItems,
            BookingRepository bookings,
            InvoiceRepository invoices,
            EmployeeRepository employees,
            ServiceOrderRepository orders
    ) {
        this.rooms = rooms;
        this.customers = customers;
        this.menuItems = menuItems;
        this.bookings = bookings;
        this.invoices = invoices;
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
                              "customers": 4,
                              "menuItems": 10,
                              "bookings": 0,
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
                "customers", customers.count(),
                "menuItems", menuItems.count(),
                "bookings", bookings.count(),
                "orders", orders.count(),
                "employees", employees.count(),
                "revenue", revenue
        );
    }

    @GetMapping("/revenue")
    @Operation(
            summary = "Doanh thu theo thời gian",
            description = "Trả về dữ liệu doanh thu theo giờ/ngày/tháng. Giá trị period: hourly, weekly, monthly",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {"label": "Thứ 2", "value": 1500000},
                      {"label": "Thứ 3", "value": 2300000},
                      {"label": "Thứ 4", "value": 1800000},
                      {"label": "Thứ 5", "value": 3200000},
                      {"label": "Thứ 6", "value": 4500000},
                      {"label": "Thứ 7", "value": 5200000},
                      {"label": "Chủ nhật", "value": 4800000}
                    ]
                    """))))
    List<Map<String, Object>> revenue(@RequestParam(defaultValue = "weekly") String period) {
        ZoneId gmt7 = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(gmt7);
        List<Map<String, Object>> result = new ArrayList<>();

        List<ServiceOrder> allOrders = orders.findAll();

        // Helper to compute order total from items
        java.util.function.Function<ServiceOrder, BigDecimal> orderTotal = order ->
                order.getItems() == null ? BigDecimal.ZERO :
                order.getItems().stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        switch (period) {
            case "hourly" -> {
                Map<Integer, BigDecimal> hourMap = new LinkedHashMap<>();
                for (int h = 0; h <= 23; h++) hourMap.put(h, BigDecimal.ZERO);

                for (ServiceOrder o : allOrders) {
                    if (o.getOrderedAt() == null) continue;
                    ZonedDateTime ordered = o.getOrderedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(gmt7);
                    if (ordered.toLocalDate().equals(now.toLocalDate())) {
                        hourMap.merge(ordered.getHour(), orderTotal.apply(o), BigDecimal::add);
                    }
                }

                for (int h = 10; h <= 23; h++) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", String.format("%02dh", h));
                    point.put("value", hourMap.get(h).longValue());
                    result.add(point);
                }
                for (int h = 0; h <= 2; h++) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", String.format("%02dh", h));
                    point.put("value", hourMap.get(h).longValue());
                    result.add(point);
                }
            }
            case "weekly" -> {
                Map<DayOfWeek, BigDecimal> dayMap = new LinkedHashMap<>();
                for (DayOfWeek d : DayOfWeek.values()) dayMap.put(d, BigDecimal.ZERO);

                ZonedDateTime weekStart = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toLocalDate().atStartOfDay(gmt7);

                for (ServiceOrder o : allOrders) {
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
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", dayLabels[i]);
                    point.put("value", dayMap.get(days[i]).longValue());
                    result.add(point);
                }
            }
            case "monthly" -> {
                Map<Integer, BigDecimal> monthMap = new LinkedHashMap<>();
                for (int m = 1; m <= 12; m++) monthMap.put(m, BigDecimal.ZERO);

                for (ServiceOrder o : allOrders) {
                    if (o.getOrderedAt() == null) continue;
                    ZonedDateTime ordered = o.getOrderedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(gmt7);
                    if (ordered.getYear() == now.getYear()) {
                        monthMap.merge(ordered.getMonthValue(), orderTotal.apply(o), BigDecimal::add);
                    }
                }

                for (int m = 1; m <= 12; m++) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", "Th" + m);
                    point.put("value", monthMap.get(m).longValue());
                    result.add(point);
                }
            }
        }

        return result;
    }

    @GetMapping("/notifications")
    @Operation(
            summary = "Thông báo hệ thống tự động",
            description = "Cảnh báo tồn kho thấp, order chờ xử lý, phòng đang có khách",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {"id": "stock-SP001", "title": "Kho Bia Tiger sắp hết (5 còn lại)", "time": "Vừa xong", "type": "error"},
                      {"id": "order-ORD001", "title": "Order ORD001 - Phòng VIP 01 chờ xử lý", "time": "Vừa xong", "type": "warning"},
                      {"id": "room-P01", "title": "Phòng VIP 01 đang có khách", "time": "Đang hoạt động", "type": "success"}
                    ]
                    """))))
    List<Map<String, String>> notifications() {
        List<Map<String, String>> result = new ArrayList<>();

        // Low stock warnings
        menuItems.findAll().stream()
                .filter(item -> item.getStock() <= 10 && item.isActive())
                .forEach(item -> {
                    Map<String, String> notif = new LinkedHashMap<>();
                    notif.put("id", "stock-" + item.getId());
                    notif.put("title", "Kho " + item.getName() + " sắp hết (" + item.getStock() + " còn lại)");
                    notif.put("time", "Vừa xong");
                    notif.put("type", "error");
                    result.add(notif);
                });

        // Pending orders
        orders.findByStatus(OrderStatus.PENDING).forEach(order -> {
            Map<String, String> notif = new LinkedHashMap<>();
            notif.put("id", "order-" + order.getId());
            notif.put("title", "Order " + order.getId() + " - Phòng " + order.getRoom().getName() + " chờ xử lý");
            notif.put("time", "Vừa xong");
            notif.put("type", "warning");
            result.add(notif);
        });

        // Occupied rooms
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
