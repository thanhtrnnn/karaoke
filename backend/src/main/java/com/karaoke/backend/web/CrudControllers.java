package com.karaoke.backend.web;

import com.karaoke.backend.domain.Branch;
import com.karaoke.backend.domain.Customer;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.Invoice;
import com.karaoke.backend.domain.InvoiceStatus;
import com.karaoke.backend.domain.PaymentMethod;
import com.karaoke.backend.domain.MembershipTierConfig;
import com.karaoke.backend.domain.MenuItem;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.domain.ServiceOrder;
import com.karaoke.backend.domain.SystemConfig;
import com.karaoke.backend.repository.BranchRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.MenuItemRepository;
import com.karaoke.backend.repository.MembershipTierConfigRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.ServiceOrderRepository;
import com.karaoke.backend.repository.SystemConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/branches")
@Tag(name = "Branches", description = "Quản lý chi nhánh")
class BranchController {
    private final BranchRepository repository;

    BranchController(BranchRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Danh sách chi nhánh")
    List<Branch> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết chi nhánh")
    Branch get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Branch not found: " + id));
    }

    @PostMapping
    @Operation(
            summary = "Tạo chi nhánh",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "CN002",
                      "name": "Midnight Elegance Quận 3",
                      "address": "20 Võ Văn Tần, Quận 3, TP.HCM",
                      "phone": "02887654321",
                      "active": true
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "CN002",
                      "name": "Midnight Elegance Quận 3",
                      "address": "20 Võ Văn Tần, Quận 3, TP.HCM",
                      "phone": "02887654321",
                      "active": true
                    }
                    """)))
    )
    Branch create(@RequestBody Branch branch) {
        return repository.save(branch);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chi nhánh")
    Branch update(@PathVariable String id, @RequestBody Branch branch) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Branch not found: " + id);
        }
        branch.setId(id);
        return repository.save(branch);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chi nhánh")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Quản lý khách hàng và hội viên")
class CustomerController {
    private final CustomerRepository repository;

    CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách khách hàng",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {
                        "id": "KH001",
                        "salutation": "Anh",
                        "firstName": "Tuấn",
                        "lastName": "Nguyễn Văn",
                        "fullName": "Nguyễn Văn Tuấn",
                        "phone": "0901234567",
                        "tier": "Vàng",
                        "points": 1250
                      }
                    ]
                    """)))
    )
    List<Customer> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết khách hàng")
    Customer get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
    }

    @PostMapping
    @Operation(
            summary = "Tạo khách hàng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "KH005",
                      "salutation": "Chị",
                      "firstName": "Mai",
                      "lastName": "Đặng Thị",
                      "fullName": "Đặng Thị Mai",
                      "phone": "0945678901",
                      "tier": "Đồng",
                      "points": 0
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "KH005",
                      "salutation": "Chị",
                      "firstName": "Mai",
                      "lastName": "Đặng Thị",
                      "fullName": "Đặng Thị Mai",
                      "phone": "0945678901",
                      "tier": "Đồng",
                      "points": 0
                    }
                    """)))
    )
    Customer create(@RequestBody Customer customer) {
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật khách hàng")
    Customer update(@PathVariable String id, @RequestBody Customer customer) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Customer not found: " + id);
        }
        customer.setId(id);
        return repository.save(customer);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa khách hàng")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Quản lý phòng hát")
class RoomController {
    private final RoomRepository repository;

    RoomController(RoomRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách phòng",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {
                        "id": "P01",
                        "name": "VIP 01",
                        "type": "VIP",
                        "capacity": 15,
                        "hourlyPrice": 150000.00,
                        "status": "AVAILABLE",
                        "active": true
                      }
                    ]
                    """)))
    )
    List<Room> list(@RequestParam(required = false) RoomStatus status) {
        return status == null ? repository.findAll() : repository.findByStatus(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết phòng")
    Room get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
    }

    @PostMapping
    @Operation(
            summary = "Tạo phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "P06",
                      "name": "Deluxe 02",
                      "type": "Deluxe",
                      "capacity": 18,
                      "hourlyPrice": 180000,
                      "status": "AVAILABLE",
                      "branch": {"id": "CN001"},
                      "active": true
                    }
                    """)))
    )
    Room create(@RequestBody Room room) {
        return repository.save(room);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "name": "VIP 01",
                      "type": "VIP",
                      "capacity": 15,
                      "hourlyPrice": 150000,
                      "status": "AVAILABLE",
                      "branch": {"id": "CN001"},
                      "active": true
                    }
                    """))))
    Room update(@PathVariable String id, @RequestBody Room room) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Room not found: " + id);
        }
        room.setId(id);
        return repository.save(room);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái phòng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "status": "OCCUPIED"
                    }
                    """))))
    Room updateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        Room room = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));
        room.setStatus(RoomStatus.valueOf(body.get("status")));
        return repository.save(room);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phòng")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/menu-items")
@Tag(name = "Menu Items", description = "Quản lý danh mục món và tồn kho nhanh")
class MenuItemController {
    private final MenuItemRepository repository;

    MenuItemController(MenuItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách món",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {
                        "id": "SP001",
                        "name": "Bia Tiger",
                        "category": "Đồ uống",
                        "price": 30000.00,
                        "stock": 45,
                        "image": "/images/beer.png",
                        "active": true
                      }
                    ]
                    """)))
    )
    List<MenuItem> list(@RequestParam(required = false) String category) {
        return category == null ? repository.findAll() : repository.findByCategoryIgnoreCase(category);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết món")
    MenuItem get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Menu item not found: " + id));
    }

    @PostMapping
    @Operation(
            summary = "Tạo món",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "SP011",
                      "name": "Pepsi lon",
                      "category": "Đồ uống",
                      "price": 20000,
                      "stock": 50,
                      "image": "/images/beer.png",
                      "active": true
                    }
                    """)))
    )
    MenuItem create(@RequestBody MenuItem item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật món",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "name": "Bia Tiger",
                      "category": "Đồ uống",
                      "price": 35000,
                      "stock": 50,
                      "image": "/images/beer.png",
                      "active": true
                    }
                    """))))
    MenuItem update(@PathVariable String id, @RequestBody MenuItem item) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Menu item not found: " + id);
        }
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa món")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees", description = "Quản lý nhân viên")
class EmployeeController {
    private final EmployeeRepository repository;

    EmployeeController(EmployeeRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách nhân viên",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {
                        "id": "NV001",
                        "fullName": "Nguyễn Thị Lễ Tân",
                        "phone": "0981000001",
                        "role": "RECEPTIONIST",
                        "branch": {"id": "CN001"},
                        "active": true
                      }
                    ]
                    """))))
    List<Employee> list() {
        return repository.findAll();
    }

    @PostMapping
    @Operation(
            summary = "Tạo nhân viên",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "NV004",
                      "fullName": "Phạm Văn Phục Vụ",
                      "phone": "0981000004",
                      "role": "SERVICE_STAFF",
                      "branch": {"id": "CN001"},
                      "active": true
                    }
                    """)))
    )
    Employee create(@RequestBody Employee employee) {
        return repository.save(employee);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhân viên",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "fullName": "Nguyễn Thị Lễ Tân",
                      "phone": "0981000001",
                      "role": "RECEPTIONIST",
                      "branch": {"id": "CN001"},
                      "active": true
                    }
                    """))))
    Employee update(@PathVariable String id, @RequestBody Employee employee) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Employee not found: " + id);
        }
        employee.setId(id);
        return repository.save(employee);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa nhân viên")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices", description = "Hóa đơn thanh toán")
class InvoiceController {
    private final InvoiceRepository repository;
    private final ServiceOrderRepository orderRepository;
    private final RoomRepository roomRepository;

    InvoiceController(InvoiceRepository repository, ServiceOrderRepository orderRepository, RoomRepository roomRepository) {
        this.repository = repository;
        this.orderRepository = orderRepository;
        this.roomRepository = roomRepository;
    }

    @GetMapping
    @Operation(
            summary = "Danh sách hóa đơn",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {
                        "id": "INV001",
                        "booking": {"id": "BK-A1B2C3D4"},
                        "roomTotal": 300000,
                        "serviceTotal": 210000,
                        "discount": 0,
                        "grandTotal": 510000,
                        "paidAt": null,
                        "status": "DRAFT"
                      }
                    ]
                    """))))
    List<Invoice> list() {
        return repository.findAll();
    }

    @PostMapping
    @Operation(
            summary = "Tạo hóa đơn",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "INV001",
                      "booking": {"id": "BK-A1B2C3D4"},
                      "roomTotal": 300000,
                      "serviceTotal": 210000,
                      "discount": 0,
                      "grandTotal": 510000,
                      "status": "DRAFT"
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "INV001",
                      "booking": {"id": "BK-A1B2C3D4"},
                      "roomTotal": 300000,
                      "serviceTotal": 210000,
                      "discount": 0,
                      "grandTotal": 510000,
                      "paidAt": null,
                      "status": "DRAFT"
                    }
                    """)))
    )
    Invoice create(@RequestBody Invoice invoice) {
        return repository.save(invoice);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hóa đơn")
    Invoice get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
    }

    @PutMapping("/{id}/pay")
    @Operation(
            summary = "Thanh toán hóa đơn",
            responses = @ApiResponse(responseCode = "200", description = "Hóa đơn đã thanh toán",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "id": "INV001",
                              "booking": {"id": "BK-A1B2C3D4"},
                              "roomTotal": 300000,
                              "serviceTotal": 210000,
                              "discount": 0,
                              "grandTotal": 510000,
                              "paidAt": "2026-05-14T21:10:00",
                              "status": "PAID"
                            }
                            """))))
    Invoice pay(@PathVariable String id, @RequestBody(required = false) java.util.Map<String, String> body) {
        Invoice invoice = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(java.time.LocalDateTime.now());
        if (body != null && body.containsKey("paymentMethod")) {
            try {
                invoice.setPaymentMethod(PaymentMethod.valueOf(body.get("paymentMethod")));
            } catch (IllegalArgumentException ignored) {}
        }
        return repository.save(invoice);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật hóa đơn")
    Invoice update(@PathVariable String id, @RequestBody Invoice invoice) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Invoice not found: " + id);
        }
        invoice.setId(id);
        return repository.save(invoice);
    }

    @PostMapping("/generate")
    @Operation(summary = "Tạo hóa đơn từ order của phòng")
    Invoice generate(@RequestParam String roomId) {
        List<ServiceOrder> roomOrders = orderRepository.findByRoomId(roomId);

        BigDecimal serviceTotal = roomOrders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
        BigDecimal roomTotal = room.getHourlyPrice().multiply(BigDecimal.valueOf(2));

        Invoice invoice = new Invoice();
        invoice.setId("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setRoomTotal(roomTotal);
        invoice.setServiceTotal(serviceTotal);
        invoice.setDiscount(BigDecimal.ZERO);
        invoice.setGrandTotal(roomTotal.add(serviceTotal));
        invoice.setStatus(InvoiceStatus.DRAFT);
        return repository.save(invoice);
    }
}

@RestController
@RequestMapping("/api/membership")
@Tag(name = "Membership", description = "Quản lý hạng hội viên")
class MembershipController {
    private final MembershipTierConfigRepository tierRepository;
    private final CustomerRepository customerRepository;

    MembershipController(MembershipTierConfigRepository tierRepository, CustomerRepository customerRepository) {
        this.tierRepository = tierRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/tiers")
    @Operation(
            summary = "Danh sách cấu hình hạng",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    [
                      {"tierName": "Đồng", "minPoints": 0, "discount": "Giảm 0%"},
                      {"tierName": "Bạc", "minPoints": 300, "discount": "Giảm 5%"},
                      {"tierName": "Vàng", "minPoints": 1000, "discount": "Giảm 10%"},
                      {"tierName": "Kim cương", "minPoints": 5000, "discount": "Giảm 15% + Ưu tiên"}
                    ]
                    """))))
    List<MembershipTierConfig> listTiers() {
        return tierRepository.findAllByOrderByMinPointsAsc();
    }

    @PutMapping("/tiers/{tierName}")
    @Operation(
            summary = "Cập nhật cấu hình hạng",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "minPoints": 1500,
                      "discount": "Giảm 12%"
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "tierName": "Vàng",
                      "minPoints": 1500,
                      "discount": "Giảm 12%"
                    }
                    """))))
    MembershipTierConfig updateTier(@PathVariable String tierName, @RequestBody MembershipTierConfig config) {
        if (!tierRepository.existsById(tierName)) {
            throw new EntityNotFoundException("Tier not found: " + tierName);
        }
        config.setTierName(tierName);
        return tierRepository.save(config);
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Thống kê hội viên theo hạng",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "total": 4,
                      "Đồng": 2,
                      "Bạc": 1,
                      "Vàng": 1,
                      "Kim cương": 0
                    }
                    """)))
    )
    java.util.Map<String, Object> stats() {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        long total = customerRepository.count();
        result.put("total", total);
        for (MembershipTierConfig tier : tierRepository.findAllByOrderByMinPointsAsc()) {
            result.put(tier.getTierName(), customerRepository.countByTier(tier.getTierName()));
        }
        return result;
    }
}

@RestController
@RequestMapping("/api/system-config")
@Tag(name = "System Config", description = "Cấu hình hệ thống")
class SystemConfigController {
    private final SystemConfigRepository repository;

    SystemConfigController(SystemConfigRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(
            summary = "Lấy tất cả cấu hình",
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "brand.name": "Famtaoke",
                      "brand.slogan": "Hát hay nhận quà mê",
                      "branch.default": "CN001",
                      "app.version": "1.0.0"
                    }
                    """))))
    java.util.Map<String, String> getAll() {
        java.util.Map<String, String> result = new java.util.HashMap<>();
        repository.findAll().forEach(config -> result.put(config.getConfigKey(), config.getConfigValue()));
        return result;
    }

    @PutMapping
    @Operation(
            summary = "Cập nhật cấu hình",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "brand.name": "Famtaoke Premium",
                      "brand.slogan": "Hát hay nhận quà mê"
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "brand.name": "Famtaoke Premium",
                      "brand.slogan": "Hát hay nhận quà mê",
                      "branch.default": "CN001",
                      "app.version": "1.0.0"
                    }
                    """))))
    java.util.Map<String, String> updateAll(@RequestBody java.util.Map<String, String> configs) {
        configs.forEach((key, value) -> {
            SystemConfig config = repository.findById(key).orElse(new SystemConfig(key, value));
            config.setConfigValue(value);
            repository.save(config);
        });
        return getAll();
    }
}
