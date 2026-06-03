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
    private final RoomReceiptController roomReceiptController;

    public BookingController(BookingRepository bookings, ClientRepository clients,
                             RoomRepository rooms, RoomReceiptRepository receipts,
                             RoomReceiptController roomReceiptController) {
        this.bookings = bookings;
        this.clients = clients;
        this.rooms = rooms;
        this.receipts = receipts;
        this.roomReceiptController = roomReceiptController;
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
            receipt.setRoomFee(BigDecimal.ZERO);
            receipt.setServiceFee(BigDecimal.ZERO);
            receipt.setDiscount(BigDecimal.ZERO);
            receipt.setTotalAmount(BigDecimal.ZERO);
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

    // UC06: Hủy đặt phòng — room → AVAILABLE
    @PutMapping("/{id}/cancel") @Operation(summary = "Hủy đặt phòng (UC06)")
    @Transactional
    Booking cancelBooking(@PathVariable String id) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + id));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.getRoom().setStatus(RoomStatus.AVAILABLE);
        rooms.save(booking.getRoom());
        return bookings.save(booking);
    }

    // UC07: Danh sách đặt phòng đang chờ check-in — lọc theo branch + ngày
    @GetMapping("/pending") @Operation(summary = "Danh sách đặt phòng chờ check-in (UC07)")
    List<Booking> getPendingBookings(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        return bookings.findByStatusAndBranchAndDate(BookingStatus.CONFIRMED, branchId, date);
    }

    // UC08: Danh sách phòng đang hoạt động (đã check-in, chưa check-out) — lọc theo branch
    @GetMapping("/active-rooms") @Operation(summary = "Phòng đang hoạt động (UC08)")
    List<Room> getActiveRooms(@RequestParam(required = false) String branchId) {
        return rooms.findByStatus(RoomStatus.OCCUPIED).stream()
                .filter(r -> branchId == null || (r.getBranch() != null && branchId.equals(r.getBranch().getId())))
                .toList();
    }

    // UC05 — Tìm phòng trống: phòng AVAILABLE thuộc branch (nếu có), đúng loại phòng (nếu có)
    // và không có booking đang hoạt động (CONFIRMED/CHECKED_IN) trùng khoảng [startTime, endTime].
    @GetMapping("/search-free")
    @Operation(summary = "Tìm phòng trống (UC05 — searchFreeRoom)")
    List<Room> searchFreeRoom(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime,
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endTime,
            @RequestParam(required = false) String roomType) {
        // Phòng AVAILABLE, lọc theo branch và loại phòng nếu được cung cấp
        List<Room> candidates = rooms.findByStatus(RoomStatus.AVAILABLE).stream()
                .filter(r -> branchId == null
                        || (r.getBranch() != null && branchId.equals(r.getBranch().getId())))
                .filter(r -> roomType == null
                        || (r.getRoomType() != null && roomType.equals(r.getRoomType().getId())))
                .toList();

        // Nếu không có khoảng thời gian thì chỉ trả phòng AVAILABLE đã lọc
        if (startTime == null || endTime == null) {
            return candidates;
        }

        // Loại các phòng có booking đang hoạt động trùng khoảng [startTime, endTime]
        List<Booking> active = new java.util.ArrayList<>(bookings.findByStatus(BookingStatus.CONFIRMED));
        active.addAll(bookings.findByStatus(BookingStatus.CHECKED_IN));
        return candidates.stream()
                .filter(r -> active.stream().noneMatch(b ->
                        b.getRoom() != null && r.getId().equals(b.getRoom().getId())
                                && b.getStartTime() != null && b.getEndTime() != null
                                && b.getStartTime().isBefore(endTime)
                                && b.getEndTime().isAfter(startTime)))
                .toList();
    }

    // ====================================================================
    // Các method ĐÚNG TÊN thiết kế (Sequence/Class diagram) — wrapper gọi
    // lại logic/repo có sẵn. CHỈ THÊM, không sửa các method ở trên.
    // ====================================================================

    // searchClient(keyword) — tìm khách hàng theo tên/SĐT (tái dùng repo).
    @GetMapping("/search-client")
    @Operation(summary = "Tìm khách hàng (searchClient) — theo tên hoặc SĐT")
    List<Client> searchClient(@RequestParam(required = false) String keyword) {
        return clients.searchByKeyword(keyword);
    }

    // createBooking(...) — alias đúng tên thiết kế của create(); cùng logic,
    // tái dùng record CreateBookingRequest.
    @PostMapping("/create-booking")
    @Operation(summary = "Tạo đặt phòng (createBooking) — alias của POST /api/bookings")
    @Transactional
    Booking createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return create(request);
    }

    // checkIn(bookingId) — UC07: CONFIRMED → CHECKED_IN (room OCCUPIED + tạo
    // RoomReceipt). Tái dùng logic trong updateStatus.
    @PutMapping("/{id}/check-in")
    @Operation(summary = "Check-in đặt phòng (checkIn) — UC07")
    @Transactional
    Booking checkIn(@PathVariable String id) {
        return updateStatus(id, new UpdateStatusRequest(BookingStatus.CHECKED_IN));
    }

    // searchBooking(keyword) — tìm booking theo tên khách / SĐT / mã booking.
    @GetMapping("/search-booking")
    @Operation(summary = "Tìm đặt phòng (searchBooking) — theo tên khách, SĐT hoặc mã")
    List<Booking> searchBooking(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return bookings.findAll();
        }
        String kw = keyword.toLowerCase();
        return bookings.findAll().stream()
                .filter(b ->
                        (b.getId() != null && b.getId().toLowerCase().contains(kw))
                        || (b.getCustomer() != null && b.getCustomer().getFullName() != null
                                && b.getCustomer().getFullName().toLowerCase().contains(kw))
                        || (b.getCustomer() != null && b.getCustomer().getPhone() != null
                                && b.getCustomer().getPhone().toLowerCase().contains(kw)))
                .toList();
    }

    // calculateInvoice(roomId) — đúng tên thiết kế (class diagram đặt trên
    // BookingController). Ủy quyền sang RoomReceiptController#generate(roomId):
    // tính roomFee từ giờ thực tế + serviceFee từ order vào RoomReceipt DRAFT.
    @PostMapping("/calculate-invoice")
    @Operation(summary = "Tính hóa đơn (calculateInvoice) — ủy quyền tới RoomReceiptController#generate")
    @Transactional
    RoomReceipt calculateInvoice(@RequestParam String roomId) {
        return roomReceiptController.generate(roomId);
    }

    // confirmPayment(receiptId, paymentMethod) — đúng tên thiết kế. Ủy quyền
    // sang RoomReceiptController#pay(id, body): chốt PAID + trả phòng + tích điểm.
    @PutMapping("/{receiptId}/confirm-payment")
    @Operation(summary = "Xác nhận thanh toán (confirmPayment) — ủy quyền tới RoomReceiptController#pay")
    @Transactional
    RoomReceipt confirmPayment(@PathVariable String receiptId,
                               @RequestBody(required = false) java.util.Map<String, String> body) {
        return roomReceiptController.pay(receiptId, body);
    }

    // applyPromotion(receiptId, voucherCode) — đúng tên thiết kế. Ủy quyền sang
    // RoomReceiptController#applyPromotion(id, body): áp mã giảm giá vào hóa đơn.
    @PostMapping("/{receiptId}/apply-promotion")
    @Operation(summary = "Áp dụng khuyến mãi (applyPromotion) — ủy quyền tới RoomReceiptController#applyPromotion")
    @Transactional
    RoomReceipt applyPromotion(@PathVariable String receiptId,
                              @RequestBody java.util.Map<String, String> body) {
        return roomReceiptController.applyPromotion(receiptId, body);
    }

    // updateRoomStatus(roomId, status) — đổi trạng thái phòng trực tiếp.
    @PutMapping("/room/{roomId}/status")
    @Operation(summary = "Đổi trạng thái phòng (updateRoomStatus)")
    @Transactional
    Room updateRoomStatus(@PathVariable String roomId, @RequestParam RoomStatus status) {
        Room room = rooms.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        room.setStatus(status);
        return rooms.save(room);
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
