# Hệ thống Quản lý Quán Karaoke - Famtaoke

Quản lý chuỗi nhà hàng karaoke: đặt phòng, gọi món, thanh toán, báo cáo doanh thu.

---

## Bắt đầu nhanh

```bash
git clone https://github.com/thanhtrnnn/karaoke.git
cd karaoke
docker compose up -d --build
```

- Frontend: http://localhost:6969
- Backend: http://localhost:8080
- Đăng nhập: `admin` / `admin123`

Xem hướng dẫn chi tiết: **[DEPLOYMENT.md](DEPLOYMENT.md)**

---

## Công nghệ

| Tầng | Công nghệ | Port |
|------|-----------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS + Nginx | 6969 |
| Backend | Spring Boot + Spring Data JPA + Spring Security | 8080 |
| Database | PostgreSQL 16 | 5432 |
| Cache | Redis 7 | 6379 |

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
├── docs/                       # Tài liệu
│   └── baocao/                 # Bài tập thực hành
│
├── docker-compose.yml          # Cấu hình Docker
├── DEPLOYMENT.md               # Hướng dẫn cài đặt chi tiết
├── start.sh                    # Script chạy nhanh
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
- [Hướng dẫn cài đặt (DEPLOYMENT.md)](DEPLOYMENT.md)
- [Cấu trúc thư mục](docs/FOLDER_STRUCTURE.md)
- [Bài tập thực hành](docs/baocao/BaiTap_4Learners.md)
- [Hướng dẫn cho Learner](docs/baocao/HuongDanLearner.md)
