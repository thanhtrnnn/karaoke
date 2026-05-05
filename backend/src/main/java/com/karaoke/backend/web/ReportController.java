package com.karaoke.backend.web;

import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.MenuItemRepository;
import com.karaoke.backend.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    public ReportController(
            RoomRepository rooms,
            CustomerRepository customers,
            MenuItemRepository menuItems,
            BookingRepository bookings,
            InvoiceRepository invoices,
            EmployeeRepository employees
    ) {
        this.rooms = rooms;
        this.customers = customers;
        this.menuItems = menuItems;
        this.bookings = bookings;
        this.invoices = invoices;
        this.employees = employees;
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
}
