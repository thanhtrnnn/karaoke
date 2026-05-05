package com.karaoke.backend.web;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import com.karaoke.backend.domain.Customer;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
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
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Đặt phòng, check-in, hoàn tất và hủy đặt phòng")
public class BookingController {
    private final BookingRepository bookings;
    private final CustomerRepository customers;
    private final RoomRepository rooms;

    public BookingController(BookingRepository bookings, CustomerRepository customers, RoomRepository rooms) {
        this.bookings = bookings;
        this.customers = customers;
        this.rooms = rooms;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách đặt phòng",
            responses = @ApiResponse(responseCode = "200", description = "Danh sách đặt phòng",
                    content = @Content(examples = @ExampleObject(value = """
                            [
                              {
                                "id": "BK-A1B2C3D4",
                                "customer": {"id": "KH001", "fullName": "Nguyễn Văn Tuấn"},
                                "room": {"id": "P01", "name": "VIP 01"},
                                "startTime": "2026-05-06T19:00:00",
                                "endTime": "2026-05-06T21:00:00",
                                "guestCount": 8,
                                "status": "CONFIRMED"
                              }
                            ]
                            """)))
    )
    List<Booking> list(@RequestParam(required = false) BookingStatus status) {
        return status == null ? bookings.findAll() : bookings.findByStatus(status);
    }

    @PostMapping
    @Operation(
            summary = "Tạo đặt phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "customerId": "KH001",
                              "roomId": "P01",
                              "startTime": "2026-05-06T19:00:00",
                              "endTime": "2026-05-06T21:00:00",
                              "guestCount": 8
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Đặt phòng đã tạo",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "BK-A1B2C3D4",
                              "customer": {"id": "KH001", "fullName": "Nguyễn Văn Tuấn"},
                              "room": {"id": "P01", "name": "VIP 01", "status": "RESERVED"},
                              "startTime": "2026-05-06T19:00:00",
                              "endTime": "2026-05-06T21:00:00",
                              "guestCount": 8,
                              "status": "CONFIRMED"
                            }
                            """)))
    )
    Booking create(@Valid @RequestBody CreateBookingRequest request) {
        Customer customer = customers.findById(request.customerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + request.customerId()));
        Room room = rooms.findById(request.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + request.roomId()));
        Booking booking = new Booking(
                "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                customer,
                room,
                request.startTime(),
                request.endTime(),
                request.guestCount(),
                BookingStatus.CONFIRMED
        );
        room.setStatus(RoomStatus.RESERVED);
        rooms.save(room);
        return bookings.save(booking);
    }

    @PutMapping("/{id}/status")
    @Operation(
            summary = "Cập nhật trạng thái đặt phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "status": "CHECKED_IN"
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Trạng thái đã cập nhật",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "BK-A1B2C3D4",
                              "status": "CHECKED_IN"
                            }
                            """)))
    )
    Booking updateStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusRequest request) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + id));
        booking.setStatus(request.status());
        if (request.status() == BookingStatus.CHECKED_IN) {
            booking.getRoom().setStatus(RoomStatus.OCCUPIED);
        }
        if (request.status() == BookingStatus.COMPLETED || request.status() == BookingStatus.CANCELLED) {
            booking.getRoom().setStatus(RoomStatus.AVAILABLE);
        }
        rooms.save(booking.getRoom());
        return bookings.save(booking);
    }

    record CreateBookingRequest(
            @NotBlank String customerId,
            @NotBlank String roomId,
            @NotNull LocalDateTime startTime,
            @NotNull LocalDateTime endTime,
            int guestCount
    ) {
    }

    record UpdateStatusRequest(@NotNull BookingStatus status) {
    }
}
