package com.karaoke.backend.config;

import com.karaoke.backend.domain.*;
import com.karaoke.backend.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final ClientRepository clients;
    private final EmployeeRepository employees;
    private final BranchRepository branches;
    private final RoomTypeRepository roomTypes;
    private final RoomRepository rooms;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final BookingRepository bookings;
    private final MembershipTierRepository tiers;
    private final ProviderRepository providers;
    private final FacilityRepository facilities;
    private final PromotionRepository promotions;
    private final SystemConfigRepository systemConfigs;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository users, ClientRepository clients, EmployeeRepository employees,
                      BranchRepository branches, RoomTypeRepository roomTypes, RoomRepository rooms,
                      ProductRepository products, OrderRepository orders, BookingRepository bookings,
                      MembershipTierRepository tiers, ProviderRepository providers,
                      FacilityRepository facilities, PromotionRepository promotions,
                      SystemConfigRepository systemConfigs, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.clients = clients;
        this.employees = employees;
        this.branches = branches;
        this.roomTypes = roomTypes;
        this.rooms = rooms;
        this.products = products;
        this.orders = orders;
        this.bookings = bookings;
        this.tiers = tiers;
        this.providers = providers;
        this.facilities = facilities;
        this.promotions = promotions;
        this.systemConfigs = systemConfigs;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (users.existsById("USR001")) return;

        Branch mainBranch = branches.save(new Branch("CN001", "Famtaoke Quận 1", "12 Nguyễn Huệ, Quận 1, TP.HCM", "02812345678", true));

        // RoomType seed
        RoomType rtVip = roomTypes.save(new RoomType("LR001", "VIP", 15, new BigDecimal("150000"), true));
        RoomType rtThuong = roomTypes.save(new RoomType("LR002", "Thường", 10, new BigDecimal("100000"), true));
        RoomType rtDeluxe = roomTypes.save(new RoomType("LR003", "Deluxe", 20, new BigDecimal("200000"), true));

        // Client seed
        clients.saveAll(List.of(
                new Client("KH001", "Anh", "Tuấn", "Nguyễn Văn", "Nguyễn Văn Tuấn", "0901234567", "Vàng", 1250, true, LocalDateTime.now().minusDays(90)),
                new Client("KH002", "Chị", "Lan", "Trần Thị", "Trần Thị Lan", "0912345678", "Bạc", 450, true, LocalDateTime.now().minusDays(60)),
                new Client("KH003", "Anh", "Hoàng", "Lê", "Lê Hoàng", "0923456789", "Đồng", 120, true, LocalDateTime.now().minusDays(30)),
                new Client("KH004", "Chị", "Minh", "Phạm", "Phạm Minh", "0934567890", "Kim cương", 5200, true, LocalDateTime.now().minusDays(180))
        ));

        // MembershipTier seed
        tiers.saveAll(List.of(
                new MembershipTier("Đồng", 0, "Không có ưu đãi", "Giảm 0%"),
                new MembershipTier("Bạc", 300, "Giảm 5% hóa đơn", "Giảm 5%"),
                new MembershipTier("Vàng", 1000, "Giảm 10% hóa đơn", "Giảm 10%"),
                new MembershipTier("Kim cương", 5000, "Giảm 15% + Ưu tiên đặt phòng", "Giảm 15% + Ưu tiên")
        ));

        systemConfigs.saveAll(List.of(
                new SystemConfig("app.name", "Karaoke Famtaoke"),
                new SystemConfig("app.hotline", "1900 1234"),
                new SystemConfig("app.email", "admin@karaoke.com")
        ));

        // Room seed
        rooms.saveAll(List.of(
                new Room("P01", "VIP 01", rtVip, 15, new BigDecimal("150000"), RoomStatus.AVAILABLE, mainBranch, true),
                new Room("P02", "P.02", rtThuong, 10, new BigDecimal("100000"), RoomStatus.OCCUPIED, mainBranch, true),
                new Room("P03", "VIP 02", rtVip, 15, new BigDecimal("150000"), RoomStatus.RESERVED, mainBranch, true),
                new Room("P04", "Deluxe 01", rtDeluxe, 20, new BigDecimal("200000"), RoomStatus.AVAILABLE, mainBranch, true),
                new Room("P05", "P.05", rtThuong, 8, new BigDecimal("80000"), RoomStatus.AVAILABLE, mainBranch, true)
        ));

        // Product seed
        Product sp01 = products.save(new Product("SP001", "Bia Tiger", "Đồ uống", new BigDecimal("30000"), 45, 10, "Lon", "/images/beer.png", true));
        products.saveAll(List.of(
                new Product("SP002", "Bia Heineken", "Đồ uống", new BigDecimal("35000"), 32, 8, "Lon", "/images/beer.png", true),
                new Product("SP003", "Nước cam", "Đồ uống", new BigDecimal("25000"), 20, 5, "Ly", "/images/fruit.png", true),
                new Product("SP004", "Sinh tố bơ", "Đồ uống", new BigDecimal("40000"), 15, 5, "Ly", "/images/fruit.png", true),
                new Product("SP005", "Chivas 18", "Đồ uống", new BigDecimal("2500000"), 5, 1, "Chai", "/images/beer.png", true),
                new Product("SP006", "Khô mực nướng", "Đồ ăn", new BigDecimal("120000"), 15, 3, "Đĩa", "/images/snack.png", true),
                new Product("SP007", "Mì xào hải sản", "Đồ ăn", new BigDecimal("85000"), 20, 5, "Đĩa", "/images/snack.png", true),
                new Product("SP008", "Khoai tây chiên", "Đồ ăn", new BigDecimal("50000"), 30, 5, "Đĩa", "/images/snack.png", true),
                new Product("SP009", "Bò lúc lắc", "Đồ ăn", new BigDecimal("150000"), 10, 2, "Đĩa", "/images/snack.png", true),
                new Product("SP010", "Trái cây dĩa", "Trái cây", new BigDecimal("120000"), 12, 3, "Đĩa", "/images/fruit.png", true)
        ));

        // Employee seed
        employees.saveAll(List.of(
                new Employee("NV001", "Nguyễn Thị Lễ Tân", null, "0981000001", null, UserRole.RECEPTIONIST, "Working", true, "reception", "password123", mainBranch),
                new Employee("NV002", "Trần Văn Phục Vụ", null, "0981000002", null, UserRole.SERVICE_STAFF, "Working", true, "phucvu", "password123", mainBranch),
                new Employee("NV003", "Lê Minh Quản Lý", null, "0981000003", null, UserRole.BRANCH_MANAGER, "Working", true, "quanly", "password123", mainBranch)
        ));

        Client cust1 = clients.findById("KH001").orElseThrow();
        Client cust2 = clients.findById("KH002").orElseThrow();
        Client cust3 = clients.findById("KH003").orElseThrow();
        Client cust4 = clients.findById("KH004").orElseThrow();

        Room room01 = rooms.findById("P01").orElseThrow();
        Room room02 = rooms.findById("P02").orElseThrow();
        Room room03 = rooms.findById("P03").orElseThrow();
        Room room04 = rooms.findById("P04").orElseThrow();
        Room room05 = rooms.findById("P05").orElseThrow();

        LocalDateTime now = LocalDateTime.now();
        bookings.saveAll(List.of(
                new Booking("BK001", cust1, room01, now.plusHours(2), now.plusHours(4), 8, BookingStatus.PENDING),
                new Booking("BK002", cust2, room03, now.plusHours(1), now.plusHours(3), 6, BookingStatus.CONFIRMED),
                new Booking("BK003", cust3, room02, now.minusHours(1), now.plusHours(1), 4, BookingStatus.CHECKED_IN),
                new Booking("BK004", cust4, room04, now.minusDays(1), now.minusDays(1).plusHours(3), 10, BookingStatus.COMPLETED)
        ));

        users.saveAll(List.of(
                new User("USR001", "admin", "admin@karaoke.local", passwordEncoder.encode("admin123"), UserRole.ADMIN, true, null, null, LocalDateTime.now()),
                new User("USR002", "reception", "reception@karaoke.local", passwordEncoder.encode("reception123"), UserRole.RECEPTIONIST, true, null, null, LocalDateTime.now()),
                new User("USR003", "phucvu", "phucvu@karaoke.local", passwordEncoder.encode("phucvu123"), UserRole.SERVICE_STAFF, true, null, null, LocalDateTime.now()),
                new User("USR004", "quanly", "quanly@karaoke.local", passwordEncoder.encode("quanly123"), UserRole.BRANCH_MANAGER, true, null, null, LocalDateTime.now()),
                new User("USR005", "client", "client@karaoke.local", passwordEncoder.encode("client123"), UserRole.CLIENT, true, null, null, LocalDateTime.now())
        ));

        // Provider seed
        providers.save(new Provider("NCC001", "Công ty Bia Sài Gòn", "02812345678", "123 Lý Thường Kiệt, TP.HCM"));

        // Facility seed
        facilities.saveAll(List.of(
                new Facility("TS001", "Micro karaoke", new BigDecimal("500000"), "Cái", 5, room01),
                new Facility("TS002", "Loa JBL", new BigDecimal("2000000"), "Cái", 2, room01),
                new Facility("TS003", "Micro karaoke", new BigDecimal("500000"), "Cái", 5, room02)
        ));

        // Promotion seed
        promotions.save(new Promotion("KM001", "Khai trương", "PhanTram", new BigDecimal("20"), LocalDate.now().minusDays(30), LocalDate.now().plusDays(30), true));
    }
}
