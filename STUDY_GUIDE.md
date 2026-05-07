# Hướng dẫn ôn tập kiểm tra vấn đáp — Hệ thống Quản lý Karaoke Famtaoke

## 1. Kiến trúc tổng quan

```
Frontend (React + TypeScript + Vite, port 6969)
    ↕ fetch() với Bearer token
Backend (Spring Boot + Spring Data JPA, port 8080)
    ↕ JPA/Hibernate
PostgreSQL 16 (Docker, port 5432)
    Quản lý bởi pgAdmin (port 5050)
```

**5 service trong Docker Compose:** frontend, backend, postgres, redis, pgadmin

---

## 2. Luồng dữ liệu (Entity → DB → API → UI)

```
@Entity (domain/)  →  @Repository (repository/)  →  @Controller (web/)  →  React fetch()
```

Ví dụ cụ thể:
- `Room.java` → `RoomRepository.java` → `RoomController.java` → `ReceptionDashboard.tsx`

---

## 3. Luồng xác thực (Auth Flow)

### Đăng nhập
```
LoginPage.tsx → POST /api/auth/login {usernameOrEmail, password}
    → AuthController.login() → BCrypt verify → trả AuthResponse {id, username, email, role, token}
    → Frontend lưu token vào localStorage
    → ProtectedRoute cho phép truy cập các trang
```

### Đăng ký
```
RegisterPage.tsx → POST /api/auth/register {username, email, password, role: "CLIENT"}
    → AuthController.register() → tạo UserAccount mới (BCrypt encode password)
    → Redirect về /login để đăng nhập
```

### Đăng xuất
```
TopAppBar nút "Đăng xuất"
    → localStorage.removeItem('token') + removeItem('user')
    → window.location.href = '/login'
```

### Route Guard
```
ProtectedRoute.tsx — component wrapper
    → Kiểm tra localStorage.getItem('token')
    → Nếu không có token → Navigate to /login
    → Nếu có token → render Outlet (các routes con)
```

### Token format
- Format: `dev-token-{userId}` (ví dụ: `dev-token-USR001`)
- `TokenAuthenticationFilter` parse token, lookup UserAccount trong DB, set SecurityContext
- **Không phải JWT thật** — chỉ dùng cho mục đích training

### Tài khoản mẫu
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| reception | reception123 | RECEPTIONIST |

---

## 4. Các file quan trọng cần nắm rõ

### Backend

| File | Vai trò |
|------|----------|
| `backend/src/main/java/com/karaoke/backend/domain/*.java` | JPA entities — ánh xạ bảng DB |
| `backend/src/main/java/com/karaoke/backend/repository/*.java` | Spring Data JPA repositories |
| `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` | CRUD endpoints chính (Branch, Customer, Room, Menu, Employee, Invoice, Membership, SystemConfig) |
| `backend/src/main/java/com/karaoke/backend/web/ReportController.java` | API báo cáo (summary, revenue, notifications) |
| `backend/src/main/java/com/karaoke/backend/web/OrderController.java` | API đặt dịch vụ |
| `backend/src/main/java/com/karaoke/backend/web/BookingController.java` | API đặt phòng |
| `backend/src/main/java/com/karaoke/backend/web/AuthController.java` | API đăng nhập, đăng ký, đổi mật khẩu |
| `backend/src/main/java/com/karaoke/backend/config/SecurityConfig.java` | Cấu hình Spring Security + CORS |
| `backend/src/main/java/com/karaoke/backend/config/TokenAuthenticationFilter.java` | Filter xác thực token (`dev-token-{userId}`) |
| `backend/src/main/java/com/karaoke/backend/config/DataSeeder.java` | Khởi tạo dữ liệu mẫu khi DB trống |

### Frontend

| File | Vai trò |
|------|----------|
| `frontend/src/pages/LoginPage.tsx` | Trang đăng nhập — gọi POST /api/auth/login |
| `frontend/src/pages/RegisterPage.tsx` | Trang đăng ký — gọi POST /api/auth/register |
| `frontend/src/components/ProtectedRoute.tsx` | Route guard — kiểm token, redirect nếu chưa đăng nhập |
| `frontend/src/pages/ReceptionDashboard.tsx` | Dashboard lễ tân — xem phòng, nhận khách, dọn phòng |
| `frontend/src/pages/BookingPage.tsx` | Đặt phòng |
| `frontend/src/pages/OrderPage.tsx` | Gọi dịch vụ (đồ uống, đồ ăn) |
| `frontend/src/pages/CheckoutPage.tsx` | Thanh toán hóa đơn |
| `frontend/src/pages/ReportsPage.tsx` | Báo cáo doanh thu + biểu đồ |
| `frontend/src/pages/CustomerPage.tsx` | Quản lý khách hàng |
| `frontend/src/pages/MembershipPage.tsx` | Quản lý hạng hội viên |
| `frontend/src/pages/InventoryPage.tsx` | Quản lý kho |
| `frontend/src/pages/OrderManagement.tsx` | Quản lý đơn hàng |
| `frontend/src/pages/SettingsPage.tsx` | Cấu hình hệ thống + chi nhánh |
| `frontend/src/components/TopAppBar.tsx` | Header — tìm kiếm, thông báo, profile, logout |
| `frontend/src/components/Sidebar.tsx` | Menu điều hướng bên trái |
| `frontend/src/store/uiStore.ts` | Zustand store quản lý UI state |

### Infrastructure

| File | Vai trò |
|------|----------|
| `docker-compose.yml` | Định nghĩa 5 service containers |
| `backend/Dockerfile` | Build image backend Spring Boot |
| `frontend/Dockerfile` | Build image frontend Vite |
| `frontend/vite.config.ts` | Cấu hình proxy `/api` → `http://backend:8080` |
| `frontend/nginx.conf` | Nginx phục vụ SPA + proxy API |

---

## 5. Patterns quan trọng cần hiểu

### a) Gọi API từ Frontend

```tsx
const token = localStorage.getItem('token');
const res = await fetch('/api/rooms', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
```

- Vite dev server proxy `/api` → backend:8080
- Trong Docker, nginx proxy `/api` → backend:8080

### b) JPA Relationships

- `Room` có `@ManyToOne Branch branch` — tự serialize thành `{"id":"CN001","name":"..."}`
- `Booking` có `@ManyToOne Customer customer` + `@ManyToOne Room room`
- `Invoice` có `@OneToOne Booking booking`

### c) Docker Compose networking

- Các service gọi nhau qua tên service: `postgres`, `backend`, `frontend`
- Backend kết nối DB: `jdbc:postgresql://postgres:5432/karaoke`

---

## 6. Các câu hỏi vấn đáp có thể gặp

1. **Mô tả kiến trúc hệ thống?** — React SPA + Spring Boot REST API + PostgreSQL, containerized bằng Docker Compose
2. **Luồng dữ liệu khi lễ tân nhận khách?** — UI gọi PUT /api/rooms/{id} với status OCCUPIED → Controller → Repository → DB
3. **Auth hoạt động thế nào?** — LoginPage gọi POST /api/auth/login → BCrypt verify → trả dev-token → lưu localStorage → ProtectedRoute kiểm tra token
4. **Frontend gọi API bằng cách nào?** — fetch() với Bearer token, Vite proxy `/api` đến backend
5. **JPA hoạt động thế nào?** — Entity class ánh xạ bảng, Repository extends JpaRepository tự tạo query, Controller gọi repository
6. **Docker Compose gồm những gì?** — 5 services: frontend (Vite/Nginx), backend (Spring Boot), postgres (DB), redis (cache), pgAdmin (DB admin tool)
7. **Cách seed dữ liệu mẫu?** — DataSeeder implements CommandLineRunner, chạy khi app start, guard `if (count > 0) return` để không duplicate
8. **Frontend state management?** — useState cho local state, Zustand (uiStore) cho global UI state (sidebar toggle)
9. **Route guard hoạt động thế nào?** — ProtectedRoute kiểm tra localStorage có token không, nếu không redirect về /login
10. **Đăng ký tài khoản mới?** — RegisterPage gọi POST /api/auth/register → tạo UserAccount với BCrypt password → redirect về /login

---

## 7. Thứ tự ôn tập đề xuất

1. Đọc `docker-compose.yml` — hiểu infra
2. Đọc 2-3 entity trong `domain/` — hiểu data model
3. Đọc `CrudControllers.java` — hiểu API pattern
4. Đọc `AuthController.java` + `TokenAuthenticationFilter.java` — hiểu auth
5. Đọc `LoginPage.tsx` + `ProtectedRoute.tsx` — hiểu login flow
6. Đọc `ReceptionDashboard.tsx` — hiểu FE-BE connection
7. Đọc `vite.config.ts` + `nginx.conf` — hiểu proxy routing
