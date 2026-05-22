package com.karaoke.backend.config;

import com.karaoke.backend.domain.Booking;
import com.karaoke.backend.domain.BookingStatus;
import com.karaoke.backend.domain.Branch;
import com.karaoke.backend.domain.Customer;
import com.karaoke.backend.domain.MembershipTierConfig;
import com.karaoke.backend.domain.SystemConfig;
import com.karaoke.backend.domain.Employee;
import com.karaoke.backend.domain.MenuItem;
import com.karaoke.backend.domain.OrderStatus;
import com.karaoke.backend.domain.Room;
import com.karaoke.backend.domain.RoomStatus;
import com.karaoke.backend.domain.ServiceOrder;
import com.karaoke.backend.domain.ServiceOrderItem;
import com.karaoke.backend.domain.UserAccount;
import com.karaoke.backend.domain.UserRole;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.BranchRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.MembershipTierConfigRepository;
import com.karaoke.backend.repository.SystemConfigRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.MenuItemRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.repository.ServiceOrderRepository;
import com.karaoke.backend.repository.UserAccountRepository;
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
            CustomerRepository customers,
            RoomRepository rooms,
            MenuItemRepository menuItems,
            ServiceOrderRepository orders,
            EmployeeRepository employees,
            UserAccountRepository users,
            MembershipTierConfigRepository tierConfigs,
            SystemConfigRepository systemConfigs,
            BookingRepository bookings,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (branches.count() > 0) {
                return;
            }

            Branch mainBranch = branches.save(new Branch("CN001", "Famtaoke Quận 1", "12 Nguyễn Huệ, Quận 1, TP.HCM", "02812345678", true, null));

            customers.saveAll(List.of(
                    new Customer("KH001", "Anh", "Tuấn", "Nguyễn Văn", "Nguyễn Văn Tuấn", "0901234567", "Vàng", 1250),
                    new Customer("KH002", "Chị", "Lan", "Trần Thị", "Trần Thị Lan", "0912345678", "Bạc", 450),
                    new Customer("KH003", "Anh", "Hoàng", "Lê", "Lê Hoàng", "0923456789", "Đồng", 120),
                    new Customer("KH004", "Chị", "Minh", "Phạm", "Phạm Minh", "0934567890", "Kim cương", 5200)
            ));

            tierConfigs.saveAll(List.of(
                    new MembershipTierConfig("Đồng", 0, "Giảm 0%"),
                    new MembershipTierConfig("Bạc", 300, "Giảm 5%"),
                    new MembershipTierConfig("Vàng", 1000, "Giảm 10%"),
                    new MembershipTierConfig("Kim cương", 5000, "Giảm 15% + Ưu tiên")
            ));

            systemConfigs.saveAll(List.of(
                    new SystemConfig("app.name", "Karaoke Famtaoke"),
                    new SystemConfig("app.hotline", "1900 1234"),
                    new SystemConfig("app.email", "admin@karaoke.com")
            ));

            rooms.saveAll(List.of(
                    new Room("P01", "VIP 01", "VIP", 15, new BigDecimal("150000"), RoomStatus.AVAILABLE, mainBranch, true),
                    new Room("P02", "P.02", "Thường", 10, new BigDecimal("100000"), RoomStatus.OCCUPIED, mainBranch, true),
                    new Room("P03", "VIP 02", "VIP", 15, new BigDecimal("150000"), RoomStatus.RESERVED, mainBranch, true),
                    new Room("P04", "Deluxe 01", "Deluxe", 20, new BigDecimal("200000"), RoomStatus.AVAILABLE, mainBranch, true),
                    new Room("P05", "P.05", "Thường", 8, new BigDecimal("80000"), RoomStatus.AVAILABLE, mainBranch, true)
            ));

            menuItems.saveAll(List.of(
                    new MenuItem("SP001", "Bia Tiger", "Đồ uống", new BigDecimal("30000"), 45, "/images/beer.png", true),
                    new MenuItem("SP002", "Bia Heineken", "Đồ uống", new BigDecimal("35000"), 32, "/images/beer.png", true),
                    new MenuItem("SP003", "Nước cam", "Đồ uống", new BigDecimal("25000"), 20, "/images/fruit.png", true),
                    new MenuItem("SP004", "Sinh tố bơ", "Đồ uống", new BigDecimal("40000"), 15, "/images/fruit.png", true),
                    new MenuItem("SP005", "Chivas 18", "Đồ uống", new BigDecimal("2500000"), 5, "/images/beer.png", true),
                    new MenuItem("SP006", "Khô mực nướng", "Đồ ăn", new BigDecimal("120000"), 15, "/images/snack.png", true),
                    new MenuItem("SP007", "Mì xào hải sản", "Đồ ăn", new BigDecimal("85000"), 20, "/images/snack.png", true),
                    new MenuItem("SP008", "Khoai tây chiên", "Đồ ăn", new BigDecimal("50000"), 30, "/images/snack.png", true),
                    new MenuItem("SP009", "Bò lúc lắc", "Đồ ăn", new BigDecimal("150000"), 10, "/images/snack.png", true),
                    new MenuItem("SP010", "Trái cây dĩa", "Trái cây", new BigDecimal("120000"), 12, "/images/fruit.png", true)
            ));

            employees.saveAll(List.of(
                    new Employee("NV001", "Nguyễn Thị Lễ Tân", "0981000001", UserRole.RECEPTIONIST, mainBranch, true),
                    new Employee("NV002", "Trần Văn Phục Vụ", "0981000002", UserRole.SERVICE_STAFF, mainBranch, true),
                    new Employee("NV003", "Lê Minh Quản Lý", "0981000003", UserRole.BRANCH_MANAGER, mainBranch, true)
            ));

            Customer cust1 = customers.findById("KH001").orElseThrow();
            Customer cust2 = customers.findById("KH002").orElseThrow();
            Customer cust3 = customers.findById("KH003").orElseThrow();
            Customer cust4 = customers.findById("KH004").orElseThrow();
            Room r01 = rooms.findById("P01").orElseThrow();
            Room r02 = rooms.findById("P02").orElseThrow();
            Room r03 = rooms.findById("P03").orElseThrow();
            Room r04 = rooms.findById("P04").orElseThrow();

            LocalDateTime now = LocalDateTime.now();
            bookings.saveAll(List.of(
                    new Booking("BK001", cust1, r01, now.plusHours(2), now.plusHours(4), 8, BookingStatus.PENDING),
                    new Booking("BK002", cust2, r03, now.plusHours(1), now.plusHours(3), 6, BookingStatus.CONFIRMED),
                    new Booking("BK003", cust3, r02, now.minusHours(1), now.plusHours(1), 4, BookingStatus.CHECKED_IN),
                    new Booking("BK004", cust4, r04, now.minusDays(1), now.minusDays(1).plusHours(3), 10, BookingStatus.COMPLETED)
            ));

            users.saveAll(List.of(
                    new UserAccount("USR001", "admin", "admin@karaoke.local", passwordEncoder.encode("admin123"), UserRole.ADMIN, true),
                    new UserAccount("USR002", "reception", "reception@karaoke.local", passwordEncoder.encode("reception123"), UserRole.RECEPTIONIST, true),
                    new UserAccount("USR003", "phucvu", "phucvu@karaoke.local", passwordEncoder.encode("phucvu123"), UserRole.SERVICE_STAFF, true),
                    new UserAccount("USR004", "quanly", "quanly@karaoke.local", passwordEncoder.encode("quanly123"), UserRole.BRANCH_MANAGER, true),
                    new UserAccount("USR005", "client", "client@karaoke.local", passwordEncoder.encode("client123"), UserRole.CLIENT, true)
            ));

            createSeedOrder(orders, rooms.findById("P01").orElseThrow(), menuItems.findById("SP001").orElseThrow(), menuItems.findById("SP010").orElseThrow(), "ORD001", OrderStatus.PENDING);
            createSeedOrder(orders, rooms.findById("P05").orElseThrow(), menuItems.findById("SP007").orElseThrow(), null, "ORD002", OrderStatus.PREPARING);
            createSeedOrder(orders, rooms.findById("P03").orElseThrow(), menuItems.findById("SP003").orElseThrow(), null, "ORD003", OrderStatus.SERVED);
        };
    }

    private void createSeedOrder(
            ServiceOrderRepository orders,
            Room room,
            MenuItem firstItem,
            MenuItem secondItem,
            String orderId,
            OrderStatus status
    ) {
        ServiceOrder order = new ServiceOrder(orderId, room, new ArrayList<>(), LocalDateTime.now().minusMinutes(30), status);
        order.getItems().add(new ServiceOrderItem(null, order, firstItem, 2, firstItem.getPrice()));
        if (secondItem != null) {
            order.getItems().add(new ServiceOrderItem(null, order, secondItem, 1, secondItem.getPrice()));
        }
        orders.save(order);
    }
}
