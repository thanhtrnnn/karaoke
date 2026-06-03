package com.karaoke.backend.web;

import com.karaoke.backend.domain.Branch;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.DamageReport;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.Facility;
import com.karaoke.backend.domain.ImportReceipt;
import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.MembershipTier;
import com.karaoke.backend.domain.PaymentMethod;
import com.karaoke.backend.domain.Product;
import com.karaoke.backend.domain.Promotion;
import com.karaoke.backend.domain.Provider;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomReceipt;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.domain.RoomType;
import com.karaoke.backend.domain.SystemConfig;
import com.karaoke.backend.repository.BranchRepository;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.DamageReportRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.FacilityRepository;
import com.karaoke.backend.repository.ImportReceiptRepository;
import com.karaoke.backend.repository.MembershipTierRepository;
import com.karaoke.backend.repository.OrderRepository;
import com.karaoke.backend.repository.ProductRepository;
import com.karaoke.backend.repository.PromotionRepository;
import com.karaoke.backend.repository.ProviderRepository;
import com.karaoke.backend.repository.RoomReceiptRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.RoomTypeRepository;
import com.karaoke.backend.repository.SystemConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.server.ResponseStatusException;
import com.karaoke.backend.repository.BookingRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// ─── Branch ───────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/branches")
@Tag(name = "Branches", description = "Quản lý chi nhánh")
class BranchController {
    private final BranchRepository repository;
    private final RoomRepository roomRepository;

    BranchController(BranchRepository repository, RoomRepository roomRepository) {
        this.repository = repository;
        this.roomRepository = roomRepository;
    }

    @GetMapping @Operation(summary = "Danh sách chi nhánh")
    List<Branch> list() { return repository.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết chi nhánh")
    Branch get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Branch not found: " + id));
    }

    @PostMapping @Operation(summary = "Tạo chi nhánh")
    Branch create(@RequestBody Branch branch) {
        // UC16: Tên chi nhánh không được trùng
        if (branch.getName() != null && repository.existsByNameIgnoreCase(branch.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên chi nhánh đã tồn tại");
        }
        return repository.save(branch);
    }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật chi nhánh")
    Branch update(@PathVariable String id, @RequestBody Branch branch) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Branch not found: " + id);
        // UC16: Tên chi nhánh không được trùng (trừ chính nó)
        if (branch.getName() != null && repository.existsByNameIgnoreCaseAndIdNot(branch.getName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên chi nhánh đã tồn tại");
        }
        branch.setId(id);
        return repository.save(branch);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa chi nhánh")
    void delete(@PathVariable String id) {
        // UC16: không xóa chi nhánh còn phòng
        if (roomRepository.existsByBranchId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chi nhánh còn phòng, không thể xóa");
        }
        repository.deleteById(id);
    }
}

// ─── Client ───────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Quản lý khách hàng và hội viên")
class ClientController {
    private final ClientRepository repository;

    ClientController(ClientRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách khách hàng — hỗ trợ keyword search (UC14, UC17)")
    List<Client> list(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return repository.searchByKeyword(keyword);
        return repository.findAll();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết khách hàng")
    Client get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Client not found: " + id));
    }

    @PostMapping @Operation(summary = "Tạo khách hàng")
    Client create(@RequestBody Client client) { return repository.save(client); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật khách hàng")
    Client update(@PathVariable String id, @RequestBody Client client) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Client not found: " + id);
        client.setId(id);
        return repository.save(client);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa khách hàng")
    void delete(@PathVariable String id) { repository.deleteById(id); }

    @PatchMapping("/{id}/lock") @Operation(summary = "Khóa/mở khóa tài khoản khách hàng (UC17)")
    Client lock(@PathVariable String id) {
        Client client = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Client not found: " + id));
        client.setAccountStatus(!client.getAccountStatus());
        return repository.save(client);
    }
}

// ─── RoomType ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/room-types")
@Tag(name = "Room Types", description = "Quản lý loại phòng")
class RoomTypeController {
    private final RoomTypeRepository repository;
    private final RoomRepository roomRepository;

    RoomTypeController(RoomTypeRepository repository, RoomRepository roomRepository) {
        this.repository = repository;
        this.roomRepository = roomRepository;
    }

    @GetMapping @Operation(summary = "Danh sách loại phòng")
    List<RoomType> list() { return repository.findAll(); }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết loại phòng")
    RoomType get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("RoomType not found: " + id));
    }

    @PostMapping @Operation(
            summary = "Tạo loại phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "LR001",
                      "nameType": "VIP",
                      "capacity": 15,
                      "price": 150000,
                      "status": true
                    }
                    """)))
    )
    RoomType create(@RequestBody RoomType roomType) { return repository.save(roomType); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật loại phòng")
    RoomType update(@PathVariable String id, @RequestBody RoomType roomType) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("RoomType not found: " + id);
        roomType.setId(id);
        return repository.save(roomType);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa loại phòng")
    void delete(@PathVariable String id) {
        // UC19: Không xóa loại phòng đang có phòng vật lý sử dụng
        if (roomRepository.existsByRoomTypeId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Loại phòng đang được sử dụng tại các chi nhánh, không thể xóa");
        }
        repository.deleteById(id);
    }
}

// ─── Room ─────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Quản lý phòng hát")
class RoomController {
    private final RoomRepository repository;
    private final BookingRepository bookingRepository;

    RoomController(RoomRepository repository, BookingRepository bookingRepository) {
        this.repository = repository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping @Operation(summary = "Danh sách phòng — lọc theo status hoặc branchId (UC20)")
    List<Room> list(@RequestParam(required = false) RoomStatus status,
                    @RequestParam(required = false) String branchId) {
        List<Room> all = status == null ? repository.findAll() : repository.findByStatus(status);
        if (branchId != null) all = all.stream().filter(r -> r.getBranch() != null && branchId.equals(r.getBranch().getId())).toList();
        return all;
    }

    @GetMapping("/active") @Operation(summary = "Danh sách phòng đang sử dụng — trạng thái OCCUPIED (UC06/UC10)")
    List<Room> getActiveRooms() {
        return repository.findByStatus(RoomStatus.OCCUPIED);
    }

    @GetMapping("/search") @Operation(summary = "Tìm phòng theo tên — lọc tên chứa keyword (UC06/UC10)")
    List<Room> searchRoomByName(@RequestParam String keyword) {
        if (keyword == null || keyword.isBlank()) return repository.findAll();
        String kw = keyword.toLowerCase();
        return repository.findAll().stream()
                .filter(r -> r.getName() != null && r.getName().toLowerCase().contains(kw))
                .toList();
    }

    @GetMapping("/pending-search") @Operation(summary = "Tìm phòng đang chờ xử lý — trạng thái RESERVED (chờ nhận) hoặc CLEANING (chờ dọn) khớp keyword (UC06/UC10)")
    List<Room> searchPendingRoom(@RequestParam String keyword) {
        String kw = keyword == null ? "" : keyword.toLowerCase();
        return repository.findAll().stream()
                .filter(r -> r.getStatus() == RoomStatus.RESERVED || r.getStatus() == RoomStatus.CLEANING)
                .filter(r -> kw.isEmpty() || (r.getName() != null && r.getName().toLowerCase().contains(kw)))
                .toList();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết phòng")
    Room get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
    }

    @PostMapping @Operation(summary = "Tạo phòng")
    Room create(@RequestBody Room room) { return repository.save(room); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật phòng")
    Room update(@PathVariable String id, @RequestBody Room room) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Room not found: " + id);
        room.setId(id);
        return repository.save(room);
    }

    @PatchMapping("/{id}/status") @Operation(summary = "Cập nhật trạng thái phòng")
    Room updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        Room room = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
        room.setStatus(RoomStatus.valueOf(body.get("status")));
        return repository.save(room);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa phòng")
    void delete(@PathVariable String id) {
        // UC20: không xóa phòng đang có đặt chỗ active
        if (bookingRepository.existsActiveByRoomId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phòng đang có đặt chỗ, không thể xóa");
        }
        repository.deleteById(id);
    }
}

// ─── Product ──────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Quản lý danh mục sản phẩm và tồn kho")
class ProductController {
    private final ProductRepository repository;

    ProductController(ProductRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách sản phẩm (UC06/UC15 — tìm theo tên)")
    List<Product> list(@RequestParam(required = false) String category,
                       @RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return repository.findByNameContainingIgnoreCase(keyword);
        return category == null ? repository.findAll() : repository.findByCategoryIgnoreCase(category);
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết sản phẩm")
    Product get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
    }

    @PostMapping @Operation(
            summary = "Tạo sản phẩm",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "SP011",
                      "name": "Pepsi lon",
                      "category": "Đồ uống",
                      "price": 20000,
                      "currentStock": 50,
                      "safetyStock": 5,
                      "image": "/images/pepsi.png",
                      "active": true
                    }
                    """)))
    )
    Product create(@RequestBody Product product) { return repository.save(product); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật sản phẩm")
    Product update(@PathVariable String id, @RequestBody Product product) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Product not found: " + id);
        product.setId(id);
        return repository.save(product);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa sản phẩm")
    void delete(@PathVariable String id) { repository.deleteById(id); }
}

// ─── Employee ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Quản lý nhân viên")
class EmployeeController {
    private final EmployeeRepository repository;

    EmployeeController(EmployeeRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách nhân viên — lọc theo branchId (UC11)")
    List<Employee> list(@RequestParam(required = false) String branchId) {
        return branchId != null ? repository.findByBranchId(branchId) : repository.findAll();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết nhân viên")
    Employee get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }

    @PostMapping @Operation(summary = "Tạo nhân viên")
    Employee create(@RequestBody Employee employee) { return repository.save(employee); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật nhân viên")
    Employee update(@PathVariable String id, @RequestBody Employee employee) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Employee not found: " + id);
        employee.setId(id);
        return repository.save(employee);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa nhân viên")
    void delete(@PathVariable String id) { repository.deleteById(id); }
}

// ─── RoomReceipt ──────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/room-receipts")
@Tag(name = "Room Receipts", description = "Hóa đơn phòng")
class RoomReceiptController {
    private final RoomReceiptRepository repository;
    private final OrderRepository orderRepository;
    private final RoomRepository roomRepository;
    private final ClientRepository clientRepository;
    private final PromotionRepository promotionRepository;

    RoomReceiptController(RoomReceiptRepository repository, OrderRepository orderRepository,
                          RoomRepository roomRepository, ClientRepository clientRepository,
                          PromotionRepository promotionRepository) {
        this.repository = repository;
        this.orderRepository = orderRepository;
        this.roomRepository = roomRepository;
        this.clientRepository = clientRepository;
        this.promotionRepository = promotionRepository;
    }

    @GetMapping @Operation(summary = "Danh sách hóa đơn phòng — hỗ trợ filter clientId (UC14)")
    List<RoomReceipt> list(@RequestParam(required = false) String clientId) {
        if (clientId != null) return repository.findByBooking_Customer_Id(clientId);
        return repository.findAll();
    }

    @PostMapping @Operation(summary = "Tạo hóa đơn phòng")
    RoomReceipt create(@RequestBody RoomReceipt receipt) { return repository.save(receipt); }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết hóa đơn phòng")
    RoomReceipt get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("RoomReceipt not found: " + id));
    }

    // UC08: Thanh toán — cập nhật room status + tích lũy điểm khách hàng
    @PutMapping("/{id}/pay") @Operation(summary = "Thanh toán hóa đơn (UC08)")
    @Transactional
    RoomReceipt pay(@PathVariable String id, @RequestBody(required = false) java.util.Map<String, String> body) {
        RoomReceipt receipt = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RoomReceipt not found: " + id));
        receipt.setStatus(InvoiceStatus.PAID);
        receipt.setPaidAt(LocalDateTime.now());
        if (body != null && body.containsKey("paymentMethod")) {
            try { receipt.setPaymentMethod(PaymentMethod.valueOf(body.get("paymentMethod"))); }
            catch (IllegalArgumentException ignored) {}
        }
        RoomReceipt saved = repository.save(receipt);

        // Cập nhật Room → AVAILABLE sau thanh toán
        if (receipt.getBooking() != null && receipt.getBooking().getRoom() != null) {
            Room room = receipt.getBooking().getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        // UC08: Tích lũy điểm khách hàng (totalAmount / 10,000)
        if (receipt.getBooking() != null && receipt.getBooking().getCustomer() != null
                && receipt.getTotalAmount() != null) {
            Client client = receipt.getBooking().getCustomer();
            int pointsEarned = receipt.getTotalAmount().divide(BigDecimal.valueOf(10000), 0, java.math.RoundingMode.FLOOR).intValue();
            client.setLoyaltyPoints((client.getLoyaltyPoints() != null ? client.getLoyaltyPoints() : 0) + pointsEarned);
            clientRepository.save(client);
        }

        return saved;
    }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật hóa đơn")
    RoomReceipt update(@PathVariable String id, @RequestBody RoomReceipt receipt) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("RoomReceipt not found: " + id);
        receipt.setId(id);
        return repository.save(receipt);
    }

    // UC08: Áp dụng khuyến mãi / voucher
    @PostMapping("/{id}/apply-promotion") @Operation(summary = "Áp dụng mã khuyến mãi vào hóa đơn (UC08)")
    @Transactional
    RoomReceipt applyPromotion(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        RoomReceipt receipt = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RoomReceipt not found: " + id));
        String promoId = body.get("voucherCode");
        com.karaoke.backend.domain.Promotion promo = promotionRepository.findById(promoId)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found: " + promoId));

        if (!promo.getStatus()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã khuyến mãi đã hết hạn");
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        if (promo.getValidUntil() != null && today.isAfter(promo.getValidUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã khuyến mãi đã hết hạn");
        }

        BigDecimal discount = promo.getRedeem() != null ? promo.getRedeem() : BigDecimal.ZERO;
        receipt.setDiscount(discount);
        BigDecimal base = (receipt.getRoomFee() != null ? receipt.getRoomFee() : BigDecimal.ZERO)
                .add(receipt.getServiceFee() != null ? receipt.getServiceFee() : BigDecimal.ZERO);
        receipt.setTotalAmount(base.subtract(discount).max(BigDecimal.ZERO));
        return repository.save(receipt);
    }

    // UC08: Tính hóa đơn từ check-in thực tế
    @PostMapping("/generate") @Operation(summary = "Tính hóa đơn từ order + giờ thực tế (UC08)")
    @Transactional
    RoomReceipt generate(@RequestParam String roomId) {
        BigDecimal serviceTotal = orderRepository.findByRoomId(roomId).stream()
                .flatMap(o -> o.getItems().stream())
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));

        // Tìm RoomReceipt DRAFT đang mở (tạo từ check-in)
        java.util.Optional<RoomReceipt> existingDraft = repository.findDraftByRoomId(roomId);
        RoomReceipt receipt = existingDraft.orElse(null);

        if (receipt != null) {
            // Tính roomFee từ checkinTime thực tế
            BigDecimal roomFee;
            if (receipt.getCheckinTime() != null) {
                double hours = Duration.between(receipt.getCheckinTime(), LocalDateTime.now()).toMinutes() / 60.0;
                hours = Math.max(hours, 0.5); // tối thiểu 30 phút
                roomFee = room.getPrice().multiply(BigDecimal.valueOf(hours));
            } else {
                roomFee = room.getPrice().multiply(BigDecimal.valueOf(2));
            }
            receipt.setRoomFee(roomFee);
            receipt.setServiceFee(serviceTotal);
            receipt.setDiscount(receipt.getDiscount() != null ? receipt.getDiscount() : BigDecimal.ZERO);
            receipt.setTotalAmount(roomFee.add(serviceTotal).subtract(receipt.getDiscount()));
            return repository.save(receipt);
        }

        // Không có draft → tạo mới
        BigDecimal roomFee = room.getPrice().multiply(BigDecimal.valueOf(2));
        RoomReceipt newReceipt = new RoomReceipt();
        newReceipt.setId("RR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newReceipt.setRoomFee(roomFee);
        newReceipt.setServiceFee(serviceTotal);
        newReceipt.setDiscount(BigDecimal.ZERO);
        newReceipt.setTotalAmount(roomFee.add(serviceTotal));
        newReceipt.setStatus(InvoiceStatus.DRAFT);
        return repository.save(newReceipt);
    }
}

// ─── Membership ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/membership")
@Tag(name = "Membership", description = "Quản lý hạng hội viên")
class MembershipController {
    private final MembershipTierRepository tierRepository;
    private final ClientRepository clientRepository;

    MembershipController(MembershipTierRepository tierRepository, ClientRepository clientRepository) {
        this.tierRepository = tierRepository;
        this.clientRepository = clientRepository;
    }

    @GetMapping("/tiers") @Operation(summary = "Danh sách hạng hội viên")
    List<MembershipTier> listTiers() { return tierRepository.findAllByOrderByMinPointsAsc(); }

    @PutMapping("/tiers/{tierName}") @Operation(summary = "Cập nhật hạng hội viên")
    MembershipTier updateTier(@PathVariable String tierName, @RequestBody MembershipTier tier) {
        if (!tierRepository.existsById(tierName)) throw new EntityNotFoundException("Tier not found: " + tierName);
        tier.setTierName(tierName);
        return tierRepository.save(tier);
    }

    @GetMapping("/stats") @Operation(summary = "Thống kê hội viên theo hạng")
    java.util.Map<String, Object> stats() {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("total", clientRepository.count());
        for (MembershipTier tier : tierRepository.findAllByOrderByMinPointsAsc()) {
            result.put(tier.getTierName(), clientRepository.countByTier(tier.getTierName()));
        }
        return result;
    }

    // UC18: Nâng hạng thủ công cho khách hàng cụ thể
    @PatchMapping("/clients/{clientId}/tier") @Operation(summary = "Thay đổi hạng thủ công cho khách hàng (UC18)")
    @Transactional
    Client manualUpgrade(@PathVariable String clientId, @RequestBody java.util.Map<String, String> body) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + clientId));
        String newTier = body.get("tierName");
        if (newTier == null || newTier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tierName is required");
        }
        if (!tierRepository.existsById(newTier)) {
            throw new EntityNotFoundException("Tier not found: " + newTier);
        }
        client.setTier(newTier);
        return clientRepository.save(client);
    }
}

// ─── Promotion ────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/promotions")
@Tag(name = "Promotions", description = "Quản lý khuyến mãi")
class PromotionController {
    private final PromotionRepository repository;

    PromotionController(PromotionRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách khuyến mãi")
    List<Promotion> list(@RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return activeOnly ? repository.findByStatusTrue() : repository.findAll();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết khuyến mãi")
    Promotion get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Promotion not found: " + id));
    }

    @PostMapping @Operation(summary = "Tạo khuyến mãi")
    Promotion create(@RequestBody Promotion promotion) { return repository.save(promotion); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật khuyến mãi")
    Promotion update(@PathVariable String id, @RequestBody Promotion promotion) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Promotion not found: " + id);
        promotion.setId(id);
        return repository.save(promotion);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa khuyến mãi")
    void delete(@PathVariable String id) { repository.deleteById(id); }
}

// ─── Facility ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/facilities")
@Tag(name = "Facilities", description = "Quản lý tài sản phòng")
class FacilityController {
    private final FacilityRepository repository;

    FacilityController(FacilityRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách tài sản — lọc theo phòng hoặc keyword")
    List<Facility> list(
            @RequestParam(required = false) String roomId,
            @RequestParam(required = false) String keyword) {
        if (roomId != null && !roomId.isBlank()) {
            return repository.findByRoomId(roomId).stream()
                    .filter(f -> keyword == null || keyword.isBlank()
                            || (f.getName() != null && f.getName().toLowerCase().contains(keyword.toLowerCase())))
                    .toList();
        }
        if (keyword != null && !keyword.isBlank()) return repository.findByNameContainingIgnoreCase(keyword);
        return repository.findAll();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết tài sản")
    Facility get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Facility not found: " + id));
    }

    @PostMapping @Operation(
            summary = "Tạo tài sản",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "TS001",
                      "tenTaiSan": "Micro karaoke",
                      "loai": "Thiết bị âm thanh",
                      "trangThai": "Bình thường",
                      "room": {"id": "P01"}
                    }
                    """)))
    )
    Facility create(@RequestBody Facility facility) { return repository.save(facility); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật tài sản")
    Facility update(@PathVariable String id, @RequestBody Facility facility) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Facility not found: " + id);
        facility.setId(id);
        return repository.save(facility);
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/providers")
@Tag(name = "Providers", description = "Quản lý nhà cung cấp")
class ProviderController {
    private final ProviderRepository repository;

    ProviderController(ProviderRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Danh sách nhà cung cấp")
    List<Provider> list(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) return repository.findByNameContainingIgnoreCase(keyword);
        return repository.findAll();
    }

    @GetMapping("/{id}") @Operation(summary = "Chi tiết nhà cung cấp")
    Provider get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Provider not found: " + id));
    }

    @PostMapping @Operation(
            summary = "Tạo nhà cung cấp",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "NCC001",
                      "name": "Công ty Bia Sài Gòn",
                      "address": "123 Lý Thường Kiệt, TP.HCM",
                      "tel": "02812345678"
                    }
                    """)))
    )
    Provider create(@RequestBody Provider provider) { return repository.save(provider); }

    @PutMapping("/{id}") @Operation(summary = "Cập nhật nhà cung cấp")
    Provider update(@PathVariable String id, @RequestBody Provider provider) {
        if (!repository.existsById(id)) throw new EntityNotFoundException("Provider not found: " + id);
        provider.setId(id);
        return repository.save(provider);
    }

    @DeleteMapping("/{id}") @Operation(summary = "Xóa nhà cung cấp")
    void delete(@PathVariable String id) { repository.deleteById(id); }
}

// ─── ImportReceipt ────────────────────────────────────────────────────────────

// ─── System Config ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/system-config")
@Tag(name = "System Config", description = "Cấu hình hệ thống")
class SystemConfigController {
    private final SystemConfigRepository repository;

    SystemConfigController(SystemConfigRepository repository) { this.repository = repository; }

    @GetMapping @Operation(summary = "Lấy tất cả cấu hình")
    java.util.Map<String, String> getAll() {
        java.util.Map<String, String> result = new java.util.HashMap<>();
        repository.findAll().forEach(config -> result.put(config.getConfigKey(), config.getConfigValue()));
        return result;
    }

    @PutMapping @Operation(summary = "Cập nhật cấu hình")
    java.util.Map<String, String> updateAll(@RequestBody java.util.Map<String, String> configs) {
        configs.forEach((key, value) -> {
            SystemConfig config = repository.findById(key).orElse(new SystemConfig(key, value));
            config.setConfigValue(value);
            repository.save(config);
        });
        return getAll();
    }
}
