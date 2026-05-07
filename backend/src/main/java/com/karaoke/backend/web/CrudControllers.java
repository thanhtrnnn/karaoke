package com.karaoke.backend.web;

import com.karaoke.backend.domain.Branch;
import com.karaoke.backend.domain.Customer;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.Invoice;
import com.karaoke.backend.domain.MenuItem;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.repository.BranchRepository;
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
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    Branch get(@PathVariable String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Branch not found: " + id));
    }

    @PostMapping
    @Operation(
            summary = "Tạo chi nhánh",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "CN002",
                      "name": "Famtaoke Quận 3",
                      "address": "20 Võ Văn Tần, Quận 3, TP.HCM",
                      "phone": "02887654321",
                      "active": true
                    }
                    """))),
            responses = @ApiResponse(responseCode = "200", content = @Content(examples = @ExampleObject(value = """
                    {
                      "id": "CN002",
                      "name": "Famtaoke Quận 3",
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
    Branch update(@PathVariable String id, @RequestBody Branch branch) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Branch not found: " + id);
        }
        branch.setId(id);
        return repository.save(branch);
    }

    @DeleteMapping("/{id}")
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
    Customer update(@PathVariable String id, @RequestBody Customer customer) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Customer not found: " + id);
        }
        customer.setId(id);
        return repository.save(customer);
    }

    @DeleteMapping("/{id}")
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
    Room create(Room room) {
        return repository.save(room);
    }

    @PutMapping("/{id}")
    Room update(@PathVariable String id, @RequestBody Room room) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Room not found: " + id);
        }
        room.setId(id);
        return repository.save(room);
    }

    @DeleteMapping("/{id}")
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
    MenuItem update(@PathVariable String id, @RequestBody MenuItem item) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Menu item not found: " + id);
        }
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
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
    @Operation(summary = "Danh sách nhân viên")
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
    Employee update(@PathVariable String id, @RequestBody Employee employee) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Employee not found: " + id);
        }
        employee.setId(id);
        return repository.save(employee);
    }

    @DeleteMapping("/{id}")
    void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices", description = "Hóa đơn thanh toán")
class InvoiceController {
    private final InvoiceRepository repository;

    InvoiceController(InvoiceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Danh sách hóa đơn")
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
                      "paidAt": "2026-05-06T21:10:00",
                      "status": "PAID"
                    }
                    """)))
    )
    Invoice create(@RequestBody Invoice invoice) {
        return repository.save(invoice);
    }
}
