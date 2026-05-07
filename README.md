# Hệ thống Quản lý Quán Karaoke - Midnight Elegance

Quản lý chuỗi nhà hàng karaoke: đặt phòng, gọi món, thanh toán, báo cáo doanh thu.

---

## Công nghệ

| Tầng | Công nghệ | Port |
|------|-----------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS | 6969 |
| Backend | Spring Boot + Spring Data JPA + Spring Security | 8080 |
| Database | H2 (dev) / PostgreSQL (prod) | - |
| Auth | Token-based (`dev-token-{userId}`) | - |

---

## Cài đặt

### Yêu cầu

| Phần mềm | Phiên bản | Kiểm tra |
|----------|-----------|----------|
| Node.js | 18+ | `node --version` |
| Java (JDK) | 17+ | `java --version` |
| Docker (tùy chọn) | 24+ | `docker --version` |

### Chạy bằng Docker

```bash
git clone https://github.com/thanhtrnnn/karaoke.git
cd karaoke
docker-compose up --build
```

### Chạy tách riêng

**Terminal 1 - Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Script tự động

```bash
./start.sh
```

---

## Kiểm tra

| Service | URL |
|---------|-----|
| Frontend | http://localhost:6969 |
| Backend API | http://localhost:8080/api/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| H2 Console | http://localhost:8080/h2-console |

**Đăng nhập:** `admin` / `admin123`

**H2 Console:** JDBC URL `jdbc:h2:mem:karaoke`, User `sa`, Password trống

---

## Cấu trúc thư mục

```
karaoke/
├── frontend/src/
│   ├── pages/                  # Các trang
│   │   ├── LoginPage.tsx           # Đăng nhập
│   │   ├── ReceptionDashboard.tsx  # Dashboard chính
│   │   ├── BookingPage.tsx         # Đặt phòng
│   │   ├── OrderPage.tsx           # Gọi món
│   │   ├── CheckoutPage.tsx        # Thanh toán
│   │   └── ReportsPage.tsx         # Báo cáo
│   ├── components/             # Component tái sử dụng
│   ├── layouts/                # AuthLayout, MainLayout
│   ├── data/mockData.ts        # Dữ liệu giả
│   └── store/uiStore.ts        # Zustand state
│
├── backend/src/main/java/com/karaoke/backend/
│   ├── web/                    # Controller
│   │   ├── AuthController.java     # Đăng nhập/đăng ký
│   │   ├── BookingController.java  # Đặt phòng
│   │   ├── OrderController.java    # Gọi món
│   │   ├── ReportController.java   # Báo cáo
│   │   └── CrudControllers.java    # Room, Customer, Menu, Employee, Invoice
│   ├── domain/                 # Entity
│   │   ├── UserAccount.java        → tblUser
│   │   ├── Room.java               → tblRoom
│   │   ├── Booking.java            → tblBooking
│   │   ├── ServiceOrder.java       → tblOrder
│   │   ├── MenuItem.java           → tblProduct
│   │   └── Invoice.java            → tblInvoice
│   ├── repository/             # JPA Repository
│   └── config/                 # SecurityConfig, DataSeeder
│
├── docs/                       # Tài liệu dự án
│   └── baocao/                 # Bài tập thực hành
│
├── docker-compose.yml
├── start.sh
└── AGENT.md                    # Tài liệu tổng quan dự án
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/rooms` | Danh sách phòng |
| GET | `/api/menu-items` | Danh sách món |
| POST | `/api/orders` | Tạo order |
| POST | `/api/bookings` | Đặt phòng |
| GET | `/api/reports/summary` | Báo cáo tổng hợp |

Xem đầy đủ tại Swagger UI: http://localhost:8080/swagger-ui.html

---

## Tài liệu

- [Tổng quan dự án (AGENT.md)](AGENT.md)
- [Cấu trúc thư mục](docs/FOLDER_STRUCTURE.md)
- [Bài tập thực hành](docs/baocao/BaiTap_4Learners.md)
