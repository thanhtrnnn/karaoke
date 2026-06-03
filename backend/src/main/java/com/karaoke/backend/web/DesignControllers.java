package com.karaoke.backend.web;

import com.karaoke.backend.design.Customer;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.MembershipTier;
import com.karaoke.backend.domain.User;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.MembershipTierRepository;
import com.karaoke.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// =====================================================================================
// Tầng CONTROL đúng tên TÀI LIỆU THIẾT KẾ (các module Core / Booking / Services /
// Account). Mỗi lớp khớp 1-1 với lớp Control trong báo cáo (LoginController,
// StaffController, ProfileController, CustomerController, MembershipTierController) —
// wrapper mỏng, ủy quyền (delegate) sang repository hiện có. Mount dưới /api/design/**
// để không đụng route đang chạy.
// =====================================================================================

// ─── LoginController (Account/Services — đăng nhập) ───────────────────────────
@RestController
@RequestMapping("/api/design/login")
@Tag(name = "Design - LoginController", description = "Kiểm tra đăng nhập theo lớp Control thiết kế")
class LoginController {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    LoginController(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/check") @Operation(summary = "checkLogin(username, password) : boolean")
    boolean checkLogin(@RequestParam String username, @RequestParam String password) {
        return users.findByUsername(username)
                .map(u -> passwordEncoder.matches(password, u.getPasswordHash()))
                .orElse(false);
    }
}

// ─── StaffController (Services — quản lý nhân viên) ───────────────────────────
@RestController
@RequestMapping("/api/design/staff")
@Tag(name = "Design - StaffController", description = "Tra cứu nhân viên theo lớp Control thiết kế")
class StaffController {
    private final EmployeeRepository employees;

    StaffController(EmployeeRepository employees) { this.employees = employees; }

    @GetMapping @Operation(summary = "getAllStaff() : List<Employee>")
    List<Employee> getAllStaff() {
        return employees.findAll();
    }

    @GetMapping("/search") @Operation(summary = "searchStaff(keyword) : List<Employee>")
    List<Employee> searchStaff(@RequestParam String keyword) {
        String kw = keyword == null ? "" : keyword.toLowerCase();
        return employees.findAll().stream()
                .filter(e -> e.getFullName() != null && e.getFullName().toLowerCase().contains(kw))
                .toList();
    }

    @GetMapping("/{id}") @Operation(summary = "getStaffById(id) : Employee")
    Employee getStaffById(@PathVariable String id) {
        return employees.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }
}

// ─── ProfileController (Account — hồ sơ người dùng) ───────────────────────────
@RestController
@RequestMapping("/api/design/profile")
@Tag(name = "Design - ProfileController", description = "Xem hồ sơ người dùng theo lớp Control thiết kế")
class ProfileController {
    private final UserRepository users;

    ProfileController(UserRepository users) { this.users = users; }

    @GetMapping("/{id}") @Operation(summary = "getProfile(id) : User")
    User getProfile(@PathVariable String id) {
        return users.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    @GetMapping("/by-username/{username}") @Operation(summary = "getByUsername(username) : User")
    User getByUsername(@PathVariable String username) {
        return users.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
    }
}

// ─── CustomerController (Core/UC17 — khách hàng) ──────────────────────────────
@RestController
@RequestMapping("/api/design/customer")
@Tag(name = "Design - CustomerController", description = "Tra cứu khách hàng theo lớp Control thiết kế")
class DesignCustomerController {
    private final ClientRepository clients;

    DesignCustomerController(ClientRepository clients) { this.clients = clients; }

    @GetMapping @Operation(summary = "searchCustomers(keyword) : List<Customer>")
    List<Customer> searchCustomers(@RequestParam(required = false) String keyword) {
        List<Client> found = (keyword == null || keyword.isBlank())
                ? clients.findAll() : clients.searchByKeyword(keyword);
        return found.stream().map(Customer::from).toList();
    }

    @GetMapping("/{id}") @Operation(summary = "getCustomerById(id) : Customer")
    Customer getCustomerById(@PathVariable String id) {
        Client client = clients.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
        return Customer.from(client);
    }
}

// ─── MembershipTierController (Booking — hạng hội viên) ───────────────────────
@RestController
@RequestMapping("/api/design/membership-tier")
@Tag(name = "Design - MembershipTierController", description = "Danh sách hạng hội viên theo lớp Control thiết kế")
class DesignMembershipTierController {
    private final MembershipTierRepository tiers;

    DesignMembershipTierController(MembershipTierRepository tiers) { this.tiers = tiers; }

    @GetMapping @Operation(summary = "getAllTiers() : List<MembershipTier>")
    List<MembershipTier> getAllTiers() {
        return tiers.findAllByOrderByMinPointsAsc();
    }
}
