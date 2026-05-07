package com.karaoke.backend.web;

import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.RoomStatus;
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
import java.time.LocalDateTime;
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
        BigDecimal revenue = invoices.findAll().stream()
                .filter(invoice -> invoice.getStatus() == InvoiceStatus.PAID)
                .map(invoice -> invoice.getGrandTotal() == null ? BigDecimal.ZERO : invoice.getGrandTotal())
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
                "employees", employees.count(),
                "revenue", revenue
        );
    }

    @GetMapping("/revenue")
    @Operation(
            summary = "Doanh thu theo thời gian",
            description = "Trả về dữ liệu doanh thu theo giờ/ngày/tháng. Vì chưa có dữ liệu invoice thực, trả về dữ liệu trống."
    )
    List<Map<String, Object>> revenue(@RequestParam(defaultValue = "weekly") String period) {
        // Since we don't have real invoice data with timestamps yet,
        // return empty data structure that matches the frontend expectations
        List<Map<String, Object>> result = new ArrayList<>();

        switch (period) {
            case "hourly" -> {
                for (int h = 12; h <= 24; h += 2) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", h + "h");
                    point.put("value", 0);
                    result.add(point);
                }
                Map<String, Object> point = new LinkedHashMap<>();
                point.put("label", "02h");
                point.put("value", 0);
                result.add(point);
            }
            case "weekly" -> {
                String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
                for (String day : days) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", day);
                    point.put("value", 0);
                    result.add(point);
                }
            }
            case "monthly" -> {
                for (int m = 1; m <= 12; m++) {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", "Th" + m);
                    point.put("value", 0);
                    result.add(point);
                }
            }
        }

        return result;
    }

    @GetMapping("/notifications")
    @Operation(summary = "Thông báo hệ thống tự động")
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
