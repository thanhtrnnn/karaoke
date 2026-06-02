package com.karaoke.backend.web;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomReceipt;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.RoomReceiptRepository;
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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Đặt phòng, check-in, check-out và hủy (UC05–UC08)")
public class BookingController {
    private final BookingRepository bookings;
    private final ClientRepository clients;
    private final RoomRepository rooms;
    private final RoomReceiptRepository receipts;

    public BookingController(BookingRepository bookings, ClientRepository clients,
                             RoomRepository rooms, RoomReceiptRepository receipts) {
        this.bookings = bookings;
        this.clients = clients;
        this.rooms = rooms;
        this.receipts = receipts;
    }

    @GetMapping
    @Operation(summary = "Danh sách đặt phòng")
    List<Booking> list(@RequestParam(required = false) BookingStatus status) {
        return status == null ? bookings.findAll() : bookings.findByStatus(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết đặt phòng")
    Booking get(@PathVariable String id) {
        return bookings.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + id));
    }

    // UC05 — Đặt phòng
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

        // UC05: Validate room is AVAILABLE before reserving
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phòng " + room.getId() + " hiện không trống (trạng thái: " + room.getStatus() + ")");
        }

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

    // UC06 hủy, UC07 check-in, UC08 check-out
    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đặt phòng")
    @Transactional
    Booking updateStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusRequest request) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + id));
        booking.setStatus(request.status());

        if (request.status() == BookingStatus.CHECKED_IN) {
            // UC07: room → OCCUPIED, tạo RoomReceipt với checkinTime
            booking.getRoom().setStatus(RoomStatus.OCCUPIED);
            RoomReceipt receipt = new RoomReceipt();
            receipt.setId("RR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            receipt.setBooking(booking);
            receipt.setCheckinTime(LocalDateTime.now());
            receipt.setRoomTotal(BigDecimal.ZERO);
            receipt.setServiceTotal(BigDecimal.ZERO);
            receipt.setDiscount(BigDecimal.ZERO);
            receipt.setGrandTotal(BigDecimal.ZERO);
            receipt.setStatus(InvoiceStatus.DRAFT);
            receipts.save(receipt);
        }

        if (request.status() == BookingStatus.COMPLETED || request.status() == BookingStatus.CANCELLED) {
            // UC06/UC08: room → AVAILABLE
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
