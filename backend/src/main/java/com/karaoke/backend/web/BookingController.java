package com.karaoke.backend.web;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.ClientRepository;
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
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
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
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Đặt phòng, check-in, hoàn tất và hủy đặt phòng")
public class BookingController {
    private final BookingRepository bookings;
    private final ClientRepository clients;
    private final RoomRepository rooms;

    public BookingController(BookingRepository bookings, ClientRepository clients, RoomRepository rooms) {
        this.bookings = bookings;
        this.clients = clients;
        this.rooms = rooms;
    }

    @GetMapping
    @Operation(summary = "Danh sách đặt phòng")
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
                              "clientId": "KH001",
                              "roomId": "P01",
                              "startTime": "2026-05-06T19:00:00",
                              "endTime": "2026-05-06T21:00:00",
                              "guestCount": 8
                            }
                            """))
            ),
            responses = @ApiResponse(responseCode = "200", description = "Đặt phòng đã tạo")
    )
    @Transactional
    Booking create(@Valid @RequestBody CreateBookingRequest request) {
        Client client = clients.findById(request.clientId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + request.clientId()));
        Room room = rooms.findById(request.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + request.roomId()));
        Booking booking = new Booking(
                "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                client,
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

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật đặt phòng (gia hạn giờ)")
    Booking update(@PathVariable String id, @Valid @RequestBody UpdateBookingRequest request) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + id));
        if (request.endTime() != null) booking.setEndTime(request.endTime());
        if (request.guestCount() > 0) booking.setGuestCount(request.guestCount());
        return bookings.save(booking);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đặt phòng")
    @Transactional
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
            @NotBlank String clientId,
            @NotBlank String roomId,
            @NotNull LocalDateTime startTime,
            @NotNull LocalDateTime endTime,
            @Min(1) int guestCount
    ) {}

    record UpdateStatusRequest(@NotNull BookingStatus status) {}

    record UpdateBookingRequest(LocalDateTime endTime, int guestCount) {}
}
