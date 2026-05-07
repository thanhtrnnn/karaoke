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

## 4. Luồng dữ liệu xuyên module

### Luồng đầy đủ: Khách hàng đến quán karaoke

```
1. ĐĂNG NHẬP
   LoginPage.tsx → POST /api/auth/login
   → AuthController → UserAccountRepository → DB (tblUser)
   ← trả dev-token, lưu localStorage

2. ĐẶT PHÒNG
   BookingPage.tsx → POST /api/bookings {customerId, roomId, startTime, endTime}
   → BookingController → RoomRepository.save(room.status = RESERVED) → DB (tblBooking, tblRoom)
   ← trả BookingResponse

3. CHECK-IN
   BookingManagement.tsx → PUT /api/bookings/{id}/status {status: "CHECKED_IN"}
   → BookingController → RoomRepository.save(room.status = OCCUPIED) → DB
   ← trả BookingResponse (room status = OCCUPIED)

4. GỌI MÓN
   OrderPage.tsx → POST /api/orders {roomId, items[{menuItemId, quantity}]}
   → OrderController → MenuItemRepository (trừ tồn kho) → ServiceOrderRepository.save() → DB
   ← trả OrderResponse

5. THANH TOÁN
   CheckoutPage.tsx → POST /api/invoices {bookingId, ...}
   → InvoiceController → InvoiceRepository.save() → DB
   → PUT /api/bookings/{id}/status {status: "COMPLETED"}
   → RoomRepository.save(room.status = AVAILABLE) → DB
   ← trả InvoiceResponse (status = PAID, paidAt = now)
```

---

## 5. Các file quan trọng cần nắm rõ

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
| `backend/src/main/java/com/karaoke/backend/common/ApiExceptionHandler.java` | Xử lý lỗi toàn cục (404, 400, validation) |

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
| `frontend/src/App.tsx` | Router + tất cả routes |

### Infrastructure

| File | Vai trò |
|------|----------|
| `docker-compose.yml` | Định nghĩa 5 service containers |
| `backend/Dockerfile` | Build image backend Spring Boot |
| `frontend/Dockerfile` | Build image frontend Vite |
| `frontend/vite.config.ts` | Cấu hình proxy `/api` → `http://backend:8080` |
| `frontend/nginx.conf` | Nginx phục vụ SPA + proxy API |

---

## 6. Patterns quan trọng cần hiểu

### a) Xác thực (Auth)

- Token format: `dev-token-{userId}` (ví dụ: `dev-token-USR001`)
- Frontend gửi header: `Authorization: Bearer dev-token-USR001`
- `TokenAuthenticationFilter` parse token, tìm UserAccount, set SecurityContext
- Không có login thực — dùng token giả lập cho dev

### b) Gọi API từ Frontend

```tsx
const token = localStorage.getItem('token');
const res = await fetch('/api/rooms', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
```

- Vite dev server proxy `/api` → backend:8080
- Trong Docker, nginx proxy `/api` → backend:8080

### c) JPA Relationships

- `Room` có `@ManyToOne Branch branch` — tự serialize thành `{"id":"CN001","name":"..."}`
- `Booking` có `@ManyToOne Customer customer` + `@ManyToOne Room room`
- `Invoice` có `@OneToOne Booking booking`
- `ServiceOrder` có `@OneToMany ServiceOrderItem items` với `cascade = CascadeType.ALL, orphanRemoval = true`
- `ServiceOrderItem` có `@JsonIgnore @ManyToOne ServiceOrder order` — tránh vòng lặp vô hạn

### d) Docker Compose networking

- Các service gọi nhau qua tên service: `postgres`, `backend`, `frontend`
- Backend kết nối DB: `jdbc:postgresql://postgres:5432/karaoke`
- `depends_on` + `condition: service_healthy` → backend chỉ khởi động khi postgres sẵn sàng

### e) Exception Handling

- `ApiExceptionHandler.java` bắt exception toàn cục
- `EntityNotFoundException` → HTTP 404
- `IllegalArgumentException` → HTTP 400
- Response body: `{timestamp, status, error, message}`

---

## 7. Công cụ hỗ trợ

### Swagger UI — Test API
- Mở: http://localhost:8080/swagger-ui.html
- API auth (`/api/auth/**`) không cần token
- API khác cần header: `Authorization: Bearer dev-token-USR001`
- Dùng nút "Authorize" ở góc phải trên cùng để nhập token 1 lần
- Test được: GET, POST, PUT, DELETE cho tất cả endpoints

### pgAdmin — Xem database
- Mở: http://localhost:5050
- Email: `admin@karaoke.local`, Password: `admin123`
- Kết nối: Host = `postgres`, Port = `5432`, Database = `karaoke`, User = `karaoke_admin`, Password = `Secur3Passw0rd!`
- Xem bảng: Servers → Karaoke DB → Databases → karaoke → Schemas → public → Tables
- Dùng Query Tool để chạy SQL trực tiếp

### DevTools — Debug frontend
- Chrome: **F12**
- **tab Network:** Xem request/response API (endpoint, status, headers, body, timing)
- **tab Console:** Xem lỗi JavaScript, thử `localStorage.removeItem('token')` rồi reload
- **tab Application:** Xem localStorage (token, user), cookies

---

## 8. Các câu hỏi vấn đáp có thể gặp

### Module riêng (5 câu/module — xem file bài tập từng learner)

### Liên module (10 câu — TẤT CẢ learner phải trả lời)

1. **Mô tả kiến trúc hệ thống?** — React SPA + Spring Boot REST API + PostgreSQL, containerized bằng Docker Compose
2. **Tại sao không có Service layer?** — Controller gọi trực tiếp Repository, đơn giản nhưng khó test unit
3. **Spring Security hoạt động thế nào?** — TokenAuthenticationFilter intercept request, parse `dev-token-{userId}`, lookup UserAccount, set SecurityContext
4. **Các entity có quan hệ gì?** — Branch→Room→Booking→Invoice, Room→ServiceOrder→ServiceOrderItem→MenuItem, Customer→Booking
5. **Frontend gọi API bằng cách nào?** — fetch() với Bearer token, Vite proxy `/api` đến backend
6. **Docker Compose gồm những gì?** — 5 services: frontend, backend, postgres, redis, pgAdmin
7. **DataSeeder hoạt động thế nào?** — implements CommandLineRunner, guard `if (count > 0) return`
8. **Zustand được dùng thế nào?** — uiStore quản lý sidebar state, global state không cần Context Provider
9. **Route guard hoạt động thế nào?** — ProtectedRoute kiểm tra localStorage có token không
10. **Còn trang nào chưa kết nối API?** — CheckoutPage, MembershipPage (hardcode), ReportsPage (biểu đồ hardcode)

---

## 9. Thứ tự ôn tập đề xuất

1. Đọc `docker-compose.yml` — hiểu infra
2. Đọc 2-3 entity trong `domain/` — hiểu data model
3. Đọc `CrudControllers.java` — hiểu API pattern
4. Đọc `AuthController.java` + `TokenAuthenticationFilter.java` — hiểu auth
5. Đọc `LoginPage.tsx` + `ProtectedRoute.tsx` — hiểu login flow
6. Đọc `ReceptionDashboard.tsx` — hiểu FE-BE connection
7. Dùng Swagger test 1 flow đầy đủ (đặt phòng → gọi món → thanh toán)
8. Dùng DevTools trace 1 request từ frontend đến backend
