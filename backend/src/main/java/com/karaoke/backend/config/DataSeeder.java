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
    private final CaLamViecRepository caLamViecs;
    private final ChamCongRepository chamCongs;
    private final DanhGiaRepository danhGias;
    private final QuyetDinhRepository quyetDinhs;
    private final RoomReceiptRepository roomReceipts;
    private final DamageReportRepository damageReports;
    private final ImportReceiptRepository importReceipts;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository users, ClientRepository clients, EmployeeRepository employees,
                      BranchRepository branches, RoomTypeRepository roomTypes, RoomRepository rooms,
                      ProductRepository products, OrderRepository orders, BookingRepository bookings,
                      MembershipTierRepository tiers, ProviderRepository providers,
                      FacilityRepository facilities, PromotionRepository promotions,
                      SystemConfigRepository systemConfigs,
                      CaLamViecRepository caLamViecs, ChamCongRepository chamCongs,
                      DanhGiaRepository danhGias, QuyetDinhRepository quyetDinhs,
                      RoomReceiptRepository roomReceipts, DamageReportRepository damageReports,
                      ImportReceiptRepository importReceipts, PasswordEncoder passwordEncoder) {
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
        this.caLamViecs = caLamViecs;
        this.chamCongs = chamCongs;
        this.danhGias = danhGias;
        this.quyetDinhs = quyetDinhs;
        this.roomReceipts = roomReceipts;
        this.damageReports = damageReports;
        this.importReceipts = importReceipts;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (users.existsById("USR001")) return;

        Branch mainBranch = branches.save(new Branch("CN001", "Famtaoke Quận 1", "12 Nguyễn Huệ, Quận 1, TP.HCM", "02812345678", true));
        Branch branch2 = branches.save(new Branch("CN002", "Famtaoke Quận 3", "88 Võ Văn Tần, Quận 3, TP.HCM", "02823456789", true));

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

        // Room seed for CN002 (Quận 3)
        rooms.saveAll(List.of(
                new Room("P21", "VIP 21", rtVip, 15, new BigDecimal("150000"), RoomStatus.AVAILABLE, branch2, true),
                new Room("P22", "P.22", rtThuong, 10, new BigDecimal("100000"), RoomStatus.OCCUPIED, branch2, true),
                new Room("P23", "Deluxe 21", rtDeluxe, 20, new BigDecimal("200000"), RoomStatus.AVAILABLE, branch2, true)
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

        // Employee seed for CN002 (Quận 3)
        employees.saveAll(List.of(
                new Employee("NV004", "Phạm Thị Lễ Tân Q3", null, "0981000004", null, UserRole.RECEPTIONIST, "Working", true, "reception_q3", "password123", branch2),
                new Employee("NV005", "Đỗ Văn Quản Lý Q3", null, "0981000005", null, UserRole.BRANCH_MANAGER, "Working", true, "quanly_q3", "password123", branch2)
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

        // ---- HR sample data (UC11) for existing employees NV001..NV003 ----
        Employee nv1 = employees.findById("NV001").orElseThrow();
        Employee nv2 = employees.findById("NV002").orElseThrow();
        Employee nv3 = employees.findById("NV003").orElseThrow();

        // CaLamViec (work shifts) + ChamCong (timekeeping)
        CaLamViec ca1 = new CaLamViec();
        ca1.setEmployee(nv1);
        ca1.setNgayLam(LocalDate.now());
        ca1.setGioBatDau(java.time.LocalTime.of(8, 0));
        ca1.setGioKetThuc(java.time.LocalTime.of(16, 0));
        ca1.setLoaiCa("Ca sáng");
        ca1 = caLamViecs.save(ca1);

        CaLamViec ca2 = new CaLamViec();
        ca2.setEmployee(nv2);
        ca2.setNgayLam(LocalDate.now());
        ca2.setGioBatDau(java.time.LocalTime.of(16, 0));
        ca2.setGioKetThuc(java.time.LocalTime.of(23, 59));
        ca2.setLoaiCa("Ca tối");
        ca2 = caLamViecs.save(ca2);

        CaLamViec ca3 = new CaLamViec();
        ca3.setEmployee(nv3);
        ca3.setNgayLam(LocalDate.now().minusDays(1));
        ca3.setGioBatDau(java.time.LocalTime.of(8, 0));
        ca3.setGioKetThuc(java.time.LocalTime.of(16, 0));
        ca3.setLoaiCa("Ca sáng");
        ca3 = caLamViecs.save(ca3);

        ChamCong cc1 = new ChamCong();
        cc1.setCaLamViec(ca1);
        cc1.setGioVaoThuc(LocalDateTime.now().withHour(8).withMinute(2));
        cc1.setGioRaThuc(LocalDateTime.now().withHour(16).withMinute(5));
        cc1.setTrangThai("Đúng giờ");
        chamCongs.save(cc1);

        ChamCong cc2 = new ChamCong();
        cc2.setCaLamViec(ca2);
        cc2.setGioVaoThuc(LocalDateTime.now().withHour(16).withMinute(15));
        cc2.setGioRaThuc(null);
        cc2.setTrangThai("Đi muộn");
        chamCongs.save(cc2);

        ChamCong cc3 = new ChamCong();
        cc3.setCaLamViec(ca3);
        cc3.setGioVaoThuc(LocalDateTime.now().minusDays(1).withHour(8).withMinute(0));
        cc3.setGioRaThuc(LocalDateTime.now().minusDays(1).withHour(16).withMinute(0));
        cc3.setTrangThai("Đúng giờ");
        chamCongs.save(cc3);

        // DanhGia (evaluations)
        DanhGia dg1 = new DanhGia();
        dg1.setEmployee(nv1);
        dg1.setKyDanhGia("2026-Q1");
        dg1.setDiem(85);
        dg1.setNhanXet("Hoàn thành tốt công việc, thái độ tích cực.");
        dg1.setNgayDanhGia(LocalDate.now().minusDays(10));
        danhGias.save(dg1);

        DanhGia dg2 = new DanhGia();
        dg2.setEmployee(nv2);
        dg2.setKyDanhGia("2026-Q1");
        dg2.setDiem(72);
        dg2.setNhanXet("Cần cải thiện giờ giấc.");
        dg2.setNgayDanhGia(LocalDate.now().minusDays(10));
        danhGias.save(dg2);

        // QuyetDinh (decisions)
        QuyetDinh qd1 = new QuyetDinh();
        qd1.setEmployee(nv1);
        qd1.setLoai("Khen thưởng");
        qd1.setNoiDung("Thưởng nhân viên xuất sắc Quý 1/2026.");
        qd1.setNgayQuyetDinh(LocalDate.now().minusDays(5));
        quyetDinhs.save(qd1);

        // ---- RoomReceipt sample (UC14): paid invoices so reports show revenue > 0 ----
        Booking bk004 = bookings.findById("BK004").orElseThrow(); // COMPLETED
        Booking bk003 = bookings.findById("BK003").orElseThrow(); // CHECKED_IN

        RoomReceipt rc1 = new RoomReceipt();
        rc1.setId("HD001");
        rc1.setBooking(bk004);
        rc1.setEmployee(nv1);
        rc1.setCheckinTime(now.minusDays(1));
        rc1.setCheckoutTime(now.minusDays(1).plusHours(3));
        rc1.setRoomFee(new BigDecimal("600000"));
        rc1.setServiceFee(new BigDecimal("190000"));
        rc1.setDamageFee(BigDecimal.ZERO);
        rc1.setDiscount(BigDecimal.ZERO);
        rc1.recalculateTotal();
        rc1.setPaidAt(now.minusDays(1).plusHours(3));
        rc1.setPaymentMethod(PaymentMethod.CASH);
        rc1.setStatus(InvoiceStatus.PAID);
        roomReceipts.save(rc1);

        RoomReceipt rc2 = new RoomReceipt();
        rc2.setId("HD002");
        rc2.setBooking(bk003);
        rc2.setEmployee(nv1);
        rc2.setCheckinTime(now.minusHours(1));
        rc2.setCheckoutTime(now.plusHours(1));
        rc2.setRoomFee(new BigDecimal("200000"));
        rc2.setServiceFee(new BigDecimal("65000"));
        rc2.setDamageFee(BigDecimal.ZERO);
        rc2.setDiscount(new BigDecimal("25000"));
        rc2.recalculateTotal();
        rc2.setPaidAt(now.plusHours(1));
        rc2.setPaymentMethod(PaymentMethod.TRANSFER);
        rc2.setStatus(InvoiceStatus.PAID);
        roomReceipts.save(rc2);

        // ============================================================
        // MOCK DATA PHA KIỂM THỬ (test-phase) — bổ sung cho cả 5 module
        // ============================================================

        // CORE (UC16/UC21): chi nhánh thứ 3 để so sánh ≥3 chi nhánh
        Branch branch3 = branches.save(new Branch("CN003", "Famtaoke Đà Nẵng", "9 Bạch Đằng, Đà Nẵng", "02363789456", true));
        rooms.saveAll(List.of(
                new Room("P31", "VIP 31", rtVip, 15, new BigDecimal("150000"), RoomStatus.AVAILABLE, branch3, true),
                new Room("P32", "P.32", rtThuong, 10, new BigDecimal("100000"), RoomStatus.AVAILABLE, branch3, true)
        ));
        employees.save(new Employee("NV006", "Vũ Thị Quản Lý ĐN", null, "0981000006", null, UserRole.BRANCH_MANAGER, "Working", true, "quanly_dn", "password123", branch3));

        // SERVICES (UC10): sản phẩm sắp hết (currentStock <= safetyStock) → cảnh báo tồn kho
        products.save(new Product("SP011", "Nước suối", "Đồ uống", new BigDecimal("15000"), 8, 30, "Chai", "/images/fruit.png", true));

        // SERVICES (UC06): Order + OrderDetail gọi món cho CN001 & CN002 → doanh thu F&B theo chi nhánh
        Product spTiger = products.findById("SP001").orElseThrow();
        Product spHeineken = products.findById("SP002").orElseThrow();
        Product spMuc = products.findById("SP006").orElseThrow();
        Product spBo = products.findById("SP009").orElseThrow();
        Room roomP22 = rooms.findById("P22").orElseThrow();
        seedOrder("ORD001", room02, rc2, nv2, now.minusHours(2), OrderStatus.SERVED, spTiger, 5);
        seedOrder("ORD002", room02, rc2, nv2, now.minusHours(1), OrderStatus.SERVED, spMuc, 2);
        seedOrder("ORD003", roomP22, null, nv2, now.minusHours(2), OrderStatus.SERVED, spHeineken, 10);
        seedOrder("ORD004", roomP22, null, nv2, now.minusMinutes(30), OrderStatus.PREPARING, spBo, 1);

        // SERVICES (UC12): Phiếu nhập kho + chi tiết — lịch sử nhập
        Provider ncc001 = providers.findById("NCC001").orElseThrow();
        ImportReceipt ir1 = new ImportReceipt();
        ir1.setId("PN001");
        ir1.setMaPhieu("PN-001");
        ir1.setImportDate(LocalDate.now().minusDays(3));
        ir1.setTrangThai("Đã nhập");
        ir1.setProvider(ncc001);
        ir1.setEmployee(nv3);
        ImportDetail importDetail = new ImportDetail(null, ir1, spHeineken, 50, new BigDecimal("28000"), new BigDecimal("1400000"));
        ir1.getDetails().add(importDetail);
        ir1.setTotalCost(new BigDecimal("1400000"));
        importReceipts.save(ir1);

        // SERVICES (UC09): Báo cáo hư hỏng + chi tiết — lịch sử hư hỏng
        Facility ts001 = facilities.findById("TS001").orElseThrow();
        DamageReport dr1 = new DamageReport();
        dr1.setId("BC001");
        dr1.setMaBaoCao("BC-001");
        dr1.setReportTime(now.minusDays(1));
        dr1.setTrangThai("Đã xử lý");
        dr1.setEmployee(nv2);
        dr1.setRoomReceipt(rc1);
        DamageDetail damageDetail = new DamageDetail(null, dr1, ts001, 1, new BigDecimal("500000"), new BigDecimal("500000"));
        dr1.getDetails().add(damageDetail);
        dr1.setTotalFine(new BigDecimal("500000"));
        damageReports.save(dr1);

        // HR (UC11): thêm đánh giá để lịch sử phong phú
        DanhGia dg3 = new DanhGia();
        dg3.setEmployee(nv3);
        dg3.setKyDanhGia("2026-Q1");
        dg3.setDiem(90);
        dg3.setNhanXet("Quản lý chi nhánh xuất sắc.");
        dg3.setNgayDanhGia(LocalDate.now().minusDays(8));
        danhGias.save(dg3);
    }

    /** Seed nhanh 1 Order + 1 OrderDetail (cascade ALL tự lưu detail theo order). */
    private void seedOrder(String id, Room room, RoomReceipt receipt, Employee emp,
                           LocalDateTime time, OrderStatus status, Product product, int qty) {
        Order o = new Order();
        o.setId(id);
        o.setRoom(room);
        o.setRoomReceipt(receipt);
        o.setEmployee(emp);
        o.setOrderTime(time);
        o.setStatus(status);
        BigDecimal line = product.getPrice().multiply(BigDecimal.valueOf(qty));
        OrderDetail detail = new OrderDetail(null, o, product, qty, product.getPrice(), line);
        o.getItems().add(detail);
        o.setTotalAmount(line);
        orders.save(o);
    }
}
