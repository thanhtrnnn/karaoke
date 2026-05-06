# HƯỚNG DẪN TRUY CẬP REPO CHO LEARNER
## Hệ thống Quản lý Quán Karaoke - Midnight Elegance

---

## 1. Clone dự án

```bash
git clone https://github.com/thanhtrnnn/karaoke.git
cd karaoke
```

---

## 2. Cấu hình máy tính

### Yêu cầu cài đặt

| Phần mềm | Phiên bản | Kiểm tra |
|----------|-----------|----------|
| Node.js | 18+ | `node --version` |
| Java (JDK) | 17+ | `java --version` |
| Maven | 3.9+ | `mvn --version` |
| Docker (tùy chọn) | 24+ | `docker --version` |
| IDE | VS Code + IntelliJ hoặc VS Code + Java Extension | - |

### Nếu chưa có Java/Maven

```bash
# macOS (Homebrew)
brew install openjdk@17
brew install maven

# Hoặc dùng Maven wrapper có sẵn trong dự án
./backend/mvnw --version
```

---

## 3. Chạy dự án

### Cách 1: Docker (đơn giản nhất)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:6969`
- Backend: `http://localhost:8080`

### Cách 2: Chạy tách riêng (để debug)

**Terminal 1 - Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Hoặc: mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Cách 3: Script tự động

```bash
./start.sh
```

---

## 4. Kiểm tra hoạt động

| Service | URL | Mong đợi |
|---------|-----|----------|
| Frontend | http://localhost:6969 | Hiển thị trang đăng nhập |
| Backend API | http://localhost:8080/api/health | `{"status":"UP"}` |
| Swagger UI | http://localhost:8080/swagger-ui.html | Trang docs API |
| H2 Console | http://localhost:8080/h2-console | Đăng nhập DB (JDBC: `jdbc:h2:mem:karaoke`, User: `sa`, Pass: trống) |

### Đăng nhập thử

- Username: `admin`
- Password: `admin123`

---

## 5. Cấu trúc thư mục quan trọng

```
karaoke/
├── frontend/                    # React + TypeScript
│   └── src/
│       ├── pages/               # ← CÁC TRANG CHÍNH
│       │   ├── LoginPage.tsx         # Trang đăng nhập
│       │   ├── ReceptionDashboard.tsx # Dashboard chính
│       │   ├── BookingPage.tsx       # Đặt phòng
│       │   ├── OrderPage.tsx         # Gọi món
│       │   ├── CheckoutPage.tsx      # Thanh toán
│       │   ├── ReportsPage.tsx       # Báo cáo
│       │   └── ...
│       ├── components/          # Component tái sử dụng
│       ├── layouts/             # Layout (AuthLayout, MainLayout)
│       ├── data/mockData.ts     # Dữ liệu giả
│       └── store/uiStore.ts     # Zustand state
│
├── backend/                     # Spring Boot
│   └── src/main/java/com/karaoke/backend/
│       ├── web/                 # ← CONTROLLER (nhận request)
│       │   ├── AuthController.java
│       │   ├── BookingController.java
│       │   ├── OrderController.java
│       │   ├── ReportController.java
│       │   └── CrudControllers.java
│       ├── domain/              # ← ENTITY (ánh xạ bảng DB)
│       │   ├── UserAccount.java     → tblUser
│       │   ├── Room.java            → tblRoom
│       │   ├── Booking.java         → tblBooking
│       │   ├── ServiceOrder.java    → tblOrder
│       │   ├── MenuItem.java        → tblProduct
│       │   ├── Invoice.java         → tblInvoice
│       │   └── ...
│       ├── repository/          # ← REPOSITORY (truy vấn DB)
│       └── config/              # Cấu hình Security, CORS, DataSeeder
│
└── docs/                        # Tài liệu
    └── baocao/                  # ← BÀI TẬP CỦA BẠN
        ├── Trung_XacThuc.md
        ├── Tuan_QuanLyPhong.md
        ├── Khanh_GoiMon.md
        ├── Hanh_ThanhToanBaoCao.md
        └── BaiTap_4Learners.md
```

---

## 6. Tìm file bài tập của bạn

| Bạn tên | File bài tập | Module |
|---------|-------------|--------|
| **Trung** | `docs/baocao/Trung_XacThuc.md` | Xác thực (Login, Register) |
| **Tuấn** | `docs/baocao/Tuan_QuanLyPhong.md` | Quản lý phòng & Đặt phòng |
| **Khánh** | `docs/baocao/Khanh_GoiMon.md` | Gọi món (Order) |
| **Hành** | `docs/baocao/Hanh_ThanhToanBaoCao.md` | Thanh toán & Báo cáo |

Đọc file `BaiTap_4Learners.md` để xem tổng quan phân chia.

---

## 7. Workflow học mỗi ngày

```
Sáng:    QA giảng bài + hướng dẫn đọc code
Trưa:    Learner tự đọc hiểu file trong bài tập
Chiều:   Learner thực hành bài tập (trace / sửa lỗi / sửa UI)
Cuối:    QA vấn đáp + feedback
```

---

## 8. Công cụ hỗ trợ

### Swagger UI (test API trực tiếp)
- Mở: `http://localhost:8080/swagger-ui.html`
- Chọn endpoint → "Try it out" → nhập body → "Execute"
- Không cần token cho `/api/auth/**`
- Cần token cho các endpoint khác: thêm header `Authorization: Bearer dev-token-USR001`

### H2 Console (xem database trực tiếp)
- Mở: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:karaoke`
- User Name: `sa`
- Password: (để trống)
- Nhấn "Connect" → xem tất cả bảng

### DevTools (debug frontend)
- Chrome: F12 → tab Network (xem API call), tab Console (xem lỗi)
- Đặt breakpoint trong Sources → tìm file `.tsx` → click dòng số

### IntelliJ / VS Code (debug backend)
- Đặt breakpoint trong file `.java` (click dòng số bên trái)
- Run → Debug (Shift+F9 trong IntelliJ)
- Khi breakpoint dừng: xem giá trị biến, step qua từng dòng

---

## 9. Lưu ý quan trọng

- **KHÔNG** commit code khi chưa được QA đồng ý
- **KHÔNG** sửa file ngoài module của mình
- **NÊN** đọc kỹ file bài tập trước khi hỏi
- **NÊN** ghi chú những gì chưa hiểu để hỏi QA
- Khi gặp lỗi → chụp screenshot Console/Network trước khi hỏi
