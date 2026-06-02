package com.karaoke.backend.config;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import com.karaoke.backend.domain.Branch;
import com.karaoke.backend.domain.Client;
import com.karaoke.backend.domain.Facility;
import com.karaoke.backend.domain.MembershipTier;
import com.karaoke.backend.domain.SystemConfig;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.Order;
import com.karaoke.backend.domain.OrderDetail;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.Product;
import com.karaoke.backend.domain.Provider;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.domain.RoomType;
import com.karaoke.backend.domain.User;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.BranchRepository;
import com.karaoke.backend.repository.ClientRepository;
import com.karaoke.backend.repository.FacilityRepository;
import com.karaoke.backend.repository.MembershipTierRepository;
import com.karaoke.backend.repository.SystemConfigRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.OrderRepository;
import com.karaoke.backend.repository.ProductRepository;
import com.karaoke.backend.repository.ProviderRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.RoomTypeRepository;
import com.karaoke.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            BranchRepository branches,
            ClientRepository clients,
            RoomRepository rooms,
            RoomTypeRepository roomTypes,
            ProductRepository products,
            OrderRepository orders,
            EmployeeRepository employees,
            UserRepository users,
            MembershipTierRepository tiers,
            SystemConfigRepository systemConfigs,
            BookingRepository bookings,
            ProviderRepository providers,
            FacilityRepository facilities,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (branches.count() > 0) return;

            Branch mainBranch = branches.save(new Branch("CN001", "Famtaoke Quận 1", "12 Nguyễn Huệ, Quận 1, TP.HCM", "02812345678", true, null));

            // RoomType seed
            RoomType rtVip = roomTypes.save(new RoomType("LR001", "VIP", 15, new BigDecimal("150000"), true));
            RoomType rtThuong = roomTypes.save(new RoomType("LR002", "Thường", 10, new BigDecimal("100000"), true));
            RoomType rtDeluxe = roomTypes.save(new RoomType("LR003", "Deluxe", 20, new BigDecimal("200000"), true));

            clients.saveAll(List.of(
                    new Client("KH001", "Anh", "Tuấn", "Nguyễn Văn", "Nguyễn Văn Tuấn", "0901234567", "Vàng", 1250, true),
                    new Client("KH002", "Chị", "Lan", "Trần Thị", "Trần Thị Lan", "0912345678", "Bạc", 450, true),
                    new Client("KH003", "Anh", "Hoàng", "Lê", "Lê Hoàng", "0923456789", "Đồng", 120, true),
                    new Client("KH004", "Chị", "Minh", "Phạm", "Phạm Minh", "0934567890", "Kim cương", 5200, true)
            ));

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

            Room r01 = rooms.save(new Room("P01", "VIP 01", rtVip, 15, new BigDecimal("150000"), RoomStatus.AVAILABLE, mainBranch, true));
            Room r02 = rooms.save(new Room("P02", "P.02", rtThuong, 10, new BigDecimal("100000"), RoomStatus.OCCUPIED, mainBranch, true));
            Room r03 = rooms.save(new Room("P03", "VIP 02", rtVip, 15, new BigDecimal("150000"), RoomStatus.RESERVED, mainBranch, true));
            Room r04 = rooms.save(new Room("P04", "Deluxe 01", rtDeluxe, 20, new BigDecimal("200000"), RoomStatus.AVAILABLE, mainBranch, true));
            Room r05 = rooms.save(new Room("P05", "P.05", rtThuong, 8, new BigDecimal("80000"), RoomStatus.AVAILABLE, mainBranch, true));

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

            employees.saveAll(List.of(
                    new Employee("NV001", "Nguyễn Thị Lễ Tân", "0981000001", UserRole.RECEPTIONIST, mainBranch, true, "Working"),
                    new Employee("NV002", "Trần Văn Phục Vụ", "0981000002", UserRole.SERVICE_STAFF, mainBranch, true, "Working"),
                    new Employee("NV003", "Lê Minh Quản Lý", "0981000003", UserRole.BRANCH_MANAGER, mainBranch, true, "Working")
            ));

            Client cust1 = clients.findById("KH001").orElseThrow();
            Client cust2 = clients.findById("KH002").orElseThrow();
            Client cust3 = clients.findById("KH003").orElseThrow();
            Client cust4 = clients.findById("KH004").orElseThrow();

            LocalDateTime now = LocalDateTime.now();
            bookings.saveAll(List.of(
                    new Booking("BK001", cust1, r01, now.plusHours(2), now.plusHours(4), 8, BookingStatus.PENDING),
                    new Booking("BK002", cust2, r03, now.plusHours(1), now.plusHours(3), 6, BookingStatus.CONFIRMED),
                    new Booking("BK003", cust3, r02, now.minusHours(1), now.plusHours(1), 4, BookingStatus.CHECKED_IN),
                    new Booking("BK004", cust4, r04, now.minusDays(1), now.minusDays(1).plusHours(3), 10, BookingStatus.COMPLETED)
            ));

            users.saveAll(List.of(
                    new User("USR001", "admin", "admin@karaoke.local", passwordEncoder.encode("admin123"), UserRole.ADMIN, true),
                    new User("USR002", "reception", "reception@karaoke.local", passwordEncoder.encode("reception123"), UserRole.RECEPTIONIST, true),
                    new User("USR003", "phucvu", "phucvu@karaoke.local", passwordEncoder.encode("phucvu123"), UserRole.SERVICE_STAFF, true),
                    new User("USR004", "quanly", "quanly@karaoke.local", passwordEncoder.encode("quanly123"), UserRole.BRANCH_MANAGER, true),
                    new User("USR005", "client", "client@karaoke.local", passwordEncoder.encode("client123"), UserRole.CLIENT, true)
            ));

            // Provider seed
            providers.save(new Provider("NCC001", "Công ty Bia Sài Gòn", "123 Lý Thường Kiệt, TP.HCM", "02812345678"));

            // Facility seed
            facilities.saveAll(List.of(
                    new Facility("TS001", "Micro karaoke", "Thiết bị âm thanh", "Bình thường", 5, new BigDecimal("500000"), "Cái", r01),
                    new Facility("TS002", "Loa JBL", "Thiết bị âm thanh", "Bình thường", 2, new BigDecimal("2000000"), "Cái", r01),
                    new Facility("TS003", "Micro karaoke", "Thiết bị âm thanh", "Bình thường", 5, new BigDecimal("500000"), "Cái", r02)
            ));

            createSeedOrder(orders, r01, sp01, products.findById("SP010").orElseThrow(), "ORD001", OrderStatus.PENDING);
            createSeedOrder(orders, r05, products.findById("SP007").orElseThrow(), null, "ORD002", OrderStatus.PREPARING);
            createSeedOrder(orders, r03, products.findById("SP003").orElseThrow(), null, "ORD003", OrderStatus.SERVED);
        };
    }

    private void createSeedOrder(
            OrderRepository orders,
            Room room,
            Product firstProduct,
            Product secondProduct,
            String orderId,
            OrderStatus status
    ) {
        Order order = new Order(orderId, room, new ArrayList<>(), LocalDateTime.now().minusMinutes(30), status);
        order.getItems().add(new OrderDetail(null, order, firstProduct, 2, firstProduct.getPrice()));
        if (secondProduct != null) {
            order.getItems().add(new OrderDetail(null, order, secondProduct, 1, secondProduct.getPrice()));
        }
        orders.save(order);
    }
}
