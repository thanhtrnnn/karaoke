# CHEATSHEET VẤN ĐÁP: Famtaoke Karaoke Management System

---

## 1. KIẾN TRÚC TỔNG QUAN

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────>│    Nginx     │────>│   Backend    │
│  React+Vite  │     │  Reverse     │     │ Spring Boot  │
│  Port 6969   │     │  Proxy       │     │  Port 8080   │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                              ┌─────┴─────┐          ┌─────┴─────┐
                              │ PostgreSQL │          │   Redis   │
                              │  Port 5432 │          │  Port 6379│
                              └───────────┘          └───────────┘
```

**5 services**: frontend (Nginx), backend (Spring Boot), postgres, redis, pgadmin

### Tại sao chọn công nghệ này?

| Công nghệ | Lý do |
|-----------|-------|
| **Spring Boot 4.0** | Auto-configuration, embedded Tomcat, ecosystem rộng (Security, JPA, Validation) |
| **React 19 + TypeScript** | Type safety, component-based UI, Vite HMR nhanh |
| **PostgreSQL 16** | ACID transactions, phức tạp query, production-ready |
| **Redis 7** | Caching real-time (trạng thái phòng, session) |
| **Docker Compose** | Môi trường nhất quán, multi-stage build, health checks |
| **H2 (dev)** | Không cần cài DB khi develop, PostgreSQL compatibility mode |

---

## 2. DESIGN PATTERNS SỬ DỤNG

### MVC (Model-View-Controller)
- **Model**: `domain/` package -- 11 JPA entities (`@Entity`, `@Table`)
- **View**: React SPA (không có server-side template)
- **Controller**: `web/` package -- `@RestController` classes

### Repository Pattern
Mỗi entity có 1 repository extends `JpaRepository<Entity, Id>`:
- Custom queries: `findByStatus()`, `findByUsername()`, `existsByUsername()`, `countByTier()`
- `@EntityGraph` trên `ServiceOrderRepository` để tránh N+1 query

### DTO Pattern (Java Records)
Request/response objects là **Java records** (immutable):
- `RegisterRequest`, `LoginRequest`, `AuthResponse` trong `AuthController`
- `CreateBookingRequest`, `UpdateStatusRequest` trong `BookingController`
- `OrderResponse.from()` -- static factory method chuyển entity -> DTO

### Filter Chain
- `TokenAuthenticationFilter` extends `OncePerRequestFilter`
- Chạy trước `UsernamePasswordAuthenticationFilter` trong Spring Security chain

### Factory Method Pattern
- `AuthResponse.from(UserAccount)` -- chuyển entity sang response DTO
- `OrderResponse.from(ServiceOrder)` -- tương tự

### Singleton Pattern
- Spring beans mặc định là singleton (controllers, repositories, configs)

---

## 3. BẢO MẬT (SECURITY)

### Luồng xác thực Dev-Token

```
Client                    Backend
  │                         │
  │── POST /api/auth/login ─>│
  │<─ { token: "dev-token-USR001" } ─│
  │                         │
  │── GET /api/rooms ───────>│
  │   Authorization: Bearer  │
  │   dev-token-USR001       │
  │                         │── TokenAuthenticationFilter
  │                         │   ├─ Extract token from header
  │                         │   ├─ Strip "dev-token-" prefix
  │                         │   ├─ findById("USR001")
  │                         │   └─ Set SecurityContext
  │<─ [{ room data }] ─────│
```

### Các thành phần bảo mật

| Component | File | Vai trò |
|-----------|------|---------|
| `SecurityConfig` | `config/SecurityConfig.java` | Filter chain, CORS, BCrypt, public endpoints |
| `TokenAuthenticationFilter` | `config/TokenAuthenticationFilter.java` | Validate token, set authentication context |
| `CorsProperties` | `config/CorsProperties.java` | Type-safe CORS config từ properties |
| `ApiExceptionHandler` | `common/ApiExceptionHandler.java` | Global error handling (400, 404) |

### Security Config chi tiết
- **CSRF**: disabled (phù hợp REST API stateless)
- **Session**: STATELESS (không dùng HTTP session)
- **Password**: BCrypt encoding
- **CORS**: Cho phép `localhost:6969`, methods GET/POST/PUT/DELETE/OPTIONS
- **Public endpoints**: `/api/auth/**`, `/api/health`, `/swagger-ui/**`, `/api-docs/**`
- **Tất cả endpoint khác**: yêu cầu authentication

### User Roles
```java
enum UserRole { CLIENT, RECEPTIONIST, SERVICE_STAFF, BRANCH_MANAGER, ADMIN }
```

### Tại sao Dev-Token thay vì JWT?
- Đơn giản hóa demo và development
- Không cần JWT library, signing keys, expiration handling
- Thầy có thể test Swagger bằng cách gõ `dev-token-USR001` trực tiếp
- Production sẽ thay bằng JWT (signed, expiration, refresh tokens)

---

## 4. DATABASE SCHEMA

### Entities & Tables

| Entity | Table | PK | Relationships |
|--------|-------|-----|---------------|
| `UserAccount` | `tblUser` | String (manual) | -- |
| `Customer` | `tblMember` | String (manual) | -- |
| `Branch` | `tblBranch` | String (manual) | -- |
| `Room` | `tblRoom` | String (manual) | `@ManyToOne` Branch |
| `Booking` | `tblBooking` | String (manual) | `@ManyToOne` Customer, Room |
| `MenuItem` | `tblProduct` | String (manual) | -- |
| `ServiceOrder` | `tblOrder` | String (manual) | `@ManyToOne` Room, `@OneToMany` Items (cascade ALL) |
| `ServiceOrderItem` | `tblOrderItem` | Long (auto) | `@ManyToOne` Order (`@JsonIgnore`), MenuItem |
| `Invoice` | `tblInvoice` | String (manual) | `@ManyToOne` Booking |
| `MembershipTierConfig` | `tblMembershipTierConfig` | String (tierName) | -- |
| `SystemConfig` | `tblSystemConfig` | String (configKey) | -- |

### Enums (State Machines)

| Enum | Giá trị | Ý nghĩa |
|------|---------|---------|
| `RoomStatus` | AVAILABLE, OCCUPIED, RESERVED, CLEANING, MAINTENANCE | Trạng thái phòng |
| `BookingStatus` | PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED | Trạng thái đặt phòng |
| `OrderStatus` | PENDING, PREPARING, SERVED, CANCELLED | Trạng thái order |
| `InvoiceStatus` | DRAFT, PAID, CANCELLED | Trạng thái hóa đơn |
| `UserRole` | CLIENT, RECEPTIONIST, SERVICE_STAFF, BRANCH_MANAGER, ADMIN | Vai trò người dùng |

### Relationships Diagram
```
Branch (1) ──< (N) Room
Branch (1) ──< (N) Employee
Customer (1) ──< (N) Booking
Room (1) ──< (N) Booking
Room (1) ──< (N) ServiceOrder
Booking (1) ──< (N) Invoice
ServiceOrder (1) ──< (N) ServiceOrderItem
MenuItem (1) ──< (N) ServiceOrderItem
```

### Naming Convention
- Bảng: `tbl` prefix (`tblUser`, `tblRoom`, `tblOrder`, `tblProduct`)
- ID: String với prefix (`USR-XXX`, `BK-XXX`, `ORD-XXX`, `CN###`, `KH###`, `NV###`, `SP###`, `P##`)
- **Lưu ý**: `MenuItem` map -> `tblProduct` (thể hiện tính dual: menu display vs inventory)

---

## 5. API DESIGN

### Endpoints

| Resource | Path | Controller |
|----------|------|-----------|
| Auth | `/api/auth` | `AuthController` |
| Bookings | `/api/bookings` | `BookingController` |
| Orders | `/api/orders` | `OrderController` |
| Reports | `/api/reports` | `ReportController` |
| Rooms | `/api/rooms` | `CrudControllers.RoomController` |
| Customers | `/api/customers` | `CrudControllers.CustomerController` |
| Menu Items | `/api/menu-items` | `CrudControllers.MenuItemController` |
| Employees | `/api/employees` | `CrudControllers.EmployeeController` |
| Invoices | `/api/invoices` | `CrudControllers.InvoiceController` |
| Branches | `/api/branches` | `CrudControllers.BranchController` |
| Membership | `/api/membership` | `CrudControllers.MembershipController` |
| System Config | `/api/system-config` | `CrudControllers.SystemConfigController` |

### HTTP Methods
- `GET /api/resource` -- List (optional `?status=`, `?category=`)
- `GET /api/resource/{id}` -- Detail
- `POST /api/resource` -- Create
- `PUT /api/resource/{id}` -- Update
- `DELETE /api/resource/{id}` -- Delete
- `PUT /api/resource/{id}/status` -- Update status (Booking, Order)
- `PUT /api/resource/{id}/pay` -- Mark paid (Invoice)

### Request/Response
- Request: Java records + `@Valid` + Bean Validation (`@NotBlank`, `@Email`, `@NotNull`)
- Response: Entity trực tiếp (simple CRUD) hoặc DTO record (complex)
- Error: `{ timestamp, status, error, message }` từ `ApiExceptionHandler`

### Swagger/OpenAPI
- UI: `/swagger-ui.html` (hoặc qua proxy: `localhost:6969/swagger-ui/index.html`)
- Docs: `/api-docs`
- Security scheme: Bearer token (nhập `dev-token-USR001` để test)

---

## 6. FRONTEND ARCHITECTURE

### Routing (App.tsx)

```
/ (AuthLayout)
├── /login          → LoginPage
└── /register       → RegisterPage

/ (MainLayout + ProtectedRoute)
├── /               → ReceptionDashboard (lễ tân)
├── /manager        → ManagerDashboard (quản lý)
├── /booking        → BookingPage
├── /booking-management → BookingManagement
├── /room-session/:roomId → RoomSession
├── /rooms          → RoomManagement
├── /orders         → OrderPage
├── /order-management → OrderManagement
├── /menu           → MenuManagement
├── /inventory      → InventoryPage
├── /checkout       → CheckoutPage
├── /customers      → CustomerPage
├── /membership     → MembershipPage
├── /employees      → EmployeeManagement
├── /reports        → ReportsPage
├── /settings       → SettingsPage
├── /profile        → ProfilePage
└── *               → NotFound (404)
```

### State Management
- **Zustand** (`uiStore.ts`): Chỉ quản lý `isSidebarOpen` (toggle sidebar)
- **Component-local**: Business data dùng `useState` + `useEffect` + `fetch()`
- **localStorage**: `token` và `user` data

### API Communication Pattern
```typescript
const token = localStorage.getItem('token');
const res = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```
- Dev: Vite proxy `/api` -> `localhost:8080`
- Prod: Nginx proxy `/api/` -> `karaoke-backend:8080`

### Theming
- Dark mode default, Tailwind `darkMode: "class"`
- Colors: Gold primary (`#D4AF37`), dark slate backgrounds
- Status: green (available), red (occupied), amber (cleaning)
- Font: Plus Jakarta Sans, Icons: Material Symbols Outlined

---

## 7. SPRING BOOT FEATURES

### Spring Data JPA
- `JpaRepository<Entity, Id>` -- CRUD + paging/sorting
- Custom queries: method naming convention
- `@EntityGraph` -- tránh N+1 query
- `spring.jpa.open-in-view=false` -- best practice
- `ddl-auto=update` -- auto schema migration

### Bean Validation
- `@Valid` trên `@RequestBody`
- `@NotBlank`, `@NotNull`, `@Email`, `@NotEmpty`
- Error 400 với field-level message

### Spring Profiles
- Default: H2 in-memory (dev)
- `postgres`: PostgreSQL (Docker)
- Switch: `SPRING_PROFILES_ACTIVE=postgres`

### Health Checks
- App: `GET /api/health` -> `{"status":"UP"}`
- Docker: `pg_isready` (postgres), `redis-cli ping` (redis)

### OpenAPI (Swagger)
- `springdoc-openapi-starter-webmvc-ui` 3.0.3
- `@Operation`, `@ApiResponse`, `@ExampleObject` trên mỗi endpoint
- Bearer auth scheme trong `OpenApiConfig`

---

## 8. DOCKER SETUP

### docker-compose.yml -- 5 Services

| Service | Image | Port | Health Check |
|---------|-------|------|-------------|
| postgres | `postgres:16` | 5432 | `pg_isready` 5s x5 |
| redis | `redis:7` | 6379 | `redis-cli ping` 5s x5 |
| pgadmin | `dpage/pgadmin4` | 5050 | -- |
| backend | `eclipse-temurin:17` | 8080 | -- (waits for postgres+redis healthy) |
| frontend | `nginx:alpine` | 6969 | -- (waits for backend) |

### Multi-Stage Builds
**Backend** (`backend/Dockerfile`):
1. Build: `eclipse-temurin:17-jdk` + Maven -> JAR
2. Run: `eclipse-temurin:17-jre` + JAR only (small image)

**Frontend** (`frontend/Dockerfile`):
1. Build: `node:20-alpine` + npm -> `dist/`
2. Run: `nginx:alpine` + `dist/` + custom `nginx.conf`

### Nginx Config
- SPA fallback: `try_files $uri $uri/ /index.html`
- Proxy: `/api/`, `/swagger-ui/`, `/api-docs` -> backend

---

## 9. CODE PATTERNS ĐẶC BIỆT

### @JsonIgnore trên reverse relationship
`ServiceOrderItem.java`: `@JsonIgnore` trên field `order` -> tránh infinite recursion khi serialize

### @EntityGraph cho N+1 prevention
`ServiceOrderRepository`: fetch `room`, `room.branch`, `items`, `items.menuItem` trong 1 query

### Stock decrement khi tạo order
`OrderController`: Giảm stock ngay khi tạo order, throw exception nếu hết hàng

### Room status synchronization
`BookingController`: Khi booking `CHECKED_IN` -> room `OCCUPIED`; khi completed/cancelled -> room `AVAILABLE`

### Report notifications
`ReportController`: `/api/reports/notifications` tổng hợp 3 loại cảnh báo:
- Tồn kho thấp (stock <= 10)
- Order chờ xử lý
- Phòng đang có khách

### 8 Controllers trong 1 file
`CrudControllers.java`: 8 `@RestController` classes (Branch, Customer, Room, MenuItem, Employee, Invoice, Membership, SystemConfig)

---

## 10. DATASEEDER

**File**: `config/DataSeeder.java` -- `CommandLineRunner`, chạy 1 lần khi startup

| Entity | Số lượng | IDs |
|--------|---------|-----|
| Branch | 1 | CN001 |
| Customer | 4 | KH001-KH004 (Đồng/Bạc/Vàng/Kim cương) |
| MembershipTierConfig | 4 | Đồng(0), Bạc(300), Vàng(1000), Kim cương(5000) |
| SystemConfig | 3 | app.name, app.hotline, app.email |
| Room | 5 | P01-P05 (VIP/Thường/Deluxe, statuses khác nhau) |
| MenuItem | 10 | SP001-SP010 (đồ uống, đồ ăn, trái cây) |
| Employee | 3 | NV001-NV003 |
| UserAccount | 5 | admin, reception, phucvu, quanly, client |
| ServiceOrder | 3 | ORD001-ORD003 (PENDING, PREPARING, SERVED) |

**Tại sao data này?**
- Nhiều trạng thái phòng -> demo reception dashboard
- Nhiều trạng thái order -> demo order workflow
- Membership tiers -> demo loyalty program
- Stock thấp (Chivas = 5) -> trigger notification system

---

## 11. ERROR HANDLING

**File**: `common/ApiExceptionHandler.java` -- `@RestControllerAdvice`

| Exception | HTTP | Khi nào |
|-----------|------|---------|
| `EntityNotFoundException` | 404 | Không tìm thấy entity |
| `IllegalArgumentException` | 400 | Vi phạm business rule |
| `MethodArgumentNotValidException` | 400 | Bean Validation fail |

Response format:
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "..." }
```

---

## 12. SEED CREDENTIALS

| Username | Password | Role | Token |
|----------|----------|------|-------|
| admin | admin123 | ADMIN | `dev-token-USR001` |
| reception | reception123 | RECEPTIONIST | `dev-token-USR002` |
| phucvu | phucvu123 | SERVICE_STAFF | `dev-token-USR003` |
| quanly | quanly123 | BRANCH_MANAGER | `dev-token-USR004` |
| client | client123 | CLIENT | `dev-token-USR005` |

---

## 13. FILE LOCATIONS NHANH

| Concern | Path |
|---------|------|
| Security Config | `backend/.../config/SecurityConfig.java` |
| Token Filter | `backend/.../config/TokenAuthenticationFilter.java` |
| Data Seeder | `backend/.../config/DataSeeder.java` |
| OpenAPI Config | `backend/.../config/OpenApiConfig.java` |
| Error Handler | `backend/.../common/ApiExceptionHandler.java` |
| Auth Controller | `backend/.../web/AuthController.java` |
| Booking Controller | `backend/.../web/BookingController.java` |
| Order Controller | `backend/.../web/OrderController.java` |
| Report Controller | `backend/.../web/ReportController.java` |
| CRUD Controllers | `backend/.../web/CrudControllers.java` |
| Entities | `backend/.../domain/*.java` (11 files) |
| Repositories | `backend/.../repository/*.java` (11 files) |
| App Properties | `backend/src/main/resources/application.properties` |
| Frontend App | `frontend/src/App.tsx` |
| Sidebar | `frontend/src/components/Sidebar.tsx` |
| Login Page | `frontend/src/pages/LoginPage.tsx` |
| Docker Compose | `docker-compose.yml` |
| Nginx Config | `frontend/nginx.conf` |

---

## 14. CÂU HỎI THƯỜNG GẶP & CÂU TRẢ LỜI

### Q: Tại sao dùng Dev-Token thay vì JWT?
**A**: Đơn giản hóa demo. Dev-token chỉ cần `dev-token-<USER_ID>`, không cần JWT library, signing keys, expiration. Production sẽ thay bằng JWT.

### Q: Tại sao dùng `@JsonIgnore` trên `ServiceOrderItem.order`?
**A**: Tránh infinite recursion khi serialize. `ServiceOrder` -> `items` -> mỗi item -> `order` -> `items` -> ...

### Q: Tại sao `spring.jpa.open-in-view=false`?
**A**: Best practice. Ngăn lazy-loading ngoài transaction, tránh unexpected queries và performance issues.

### Q: Tại sao dùng Java Records cho DTO?
**A**: Immutable, concise, tự动生成 equals/hashCode/toString. Phù hợp cho request/response objects không cần thay đổi.

### Q: Tại sao `ddl-auto=update`?
**A**: Auto-create/update schema từ entities. Tiện cho dev/demo. Production sẽ dùng Flyway/Liquibase.

### Q: Tại sao 8 controllers trong 1 file?
**A**: Group các CRUD endpoints đơn giản lại. Controllers phức tạp (Auth, Booking, Order, Report) có file riêng.

### Q: Tại sao dùng `Integer` thay vì `int` cho entity fields?
**A**: Wrapper types cho phép null. Khi Jackson deserialize partial objects (chỉ có id), primitive `int` sẽ fail với null.

### Q: Docker health check để làm gì?
**A**: `depends_on: condition: service_healthy` đảm bảo backend chỉ start khi postgres và redis sẵn sàng, tránh connection errors.

---

## 15. KỊCH BẢN DEMO UI

**Truy cập**: http://localhost:6969
**Login**: `admin` / `admin123`

### Flow 1: Đăng nhập & Dashboard Lễ tân

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Mở `localhost:6969` | Redirect sang `/login` (ProtectedRoute) |
| 2 | Nhập `admin` / `admin123` -> Đăng nhập | Vào trang `/` - Dashboard Lễ tân |
| 3 | Quan sát lưới phòng | Thấy 5 phòng (P01-P05), mỗi phòng có màu theo trạng thái |
| 4 | Chú ý phòng **VIP 01** (OCCUPIED - đỏ) | Đang có khách, có nút "Order dịch vụ" và "Thanh toán" |
| 5 | Chú ý phòng **P.02** (RESERVED - vàng) | Đã đặt trước |
| 6 | Chú ý phòng **P.04, P.05** (AVAILABLE - xanh) | Phòng trống, có nút "Đặt phòng" |

**Nói**: "Đây là giao diện lễ tân, hiển thị tất cả phòng theo thời gian thực. Màu xanh = trống, đỏ = đang có khách, vàng = đã đặt. Lễ tân có thể thao tác nhanh từ đây."

### Flow 2: Đặt phòng

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Đặt phòng** | Vào `/booking` |
| 2 | Chọn khách hàng (dropdown) | Hiển thị danh sách khách từ API `/api/customers` |
| 3 | Chọn phòng trống (P04 hoặc P05) | Hiển thị giá/giờ |
| 4 | Chọn giờ bắt đầu / kết thúc | DateTime picker |
| 5 | Nhập số khách -> **Đặt phòng** | Alert thành công, phòng chuyển sang RESERVED |

**Nói**: "Lễ tân chọn khách, chọn phòng, chọn giờ. Hệ thống tự động kiểm tra phòng trống và tạo booking. Phòng chuyển trạng thái RESERVED."

### Flow 3: Quản lý đặt phòng

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **QL Đặt phòng** | Vào `/booking-management` |
| 2 | Xem danh sách booking | Hiển thị tất cả booking với trạng thái |
| 3 | Click **Check-in** trên booking CONFIRMED | Trạng thái chuyển CHECKED_IN, phòng chuyển OCCUPIED |
| 4 | Click **Hoàn tất** trên booking CHECKED_IN | Trạng thái chuyển COMPLETED, phòng chuyển AVAILABLE |

**Nói**: "Quản lý đặt phòng: từ CONFIRMED -> CHECKED_IN -> COMPLETED. Mỗi lần thay đổi trạng thái booking, trạng thái phòng tự động đồng bộ."

### Flow 4: Gọi món (Order dịch vụ)

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Gọi món** | Vào `/orders` |
| 2 | Chọn phòng (dropdown: VIP 01) | Chọn phòng đang có khách |
| 3 | Tìm kiếm "bia" | Filter realtime |
| 4 | Chọn category "Đồ uống" | Filter theo category |
| 5 | Click **Thêm** trên Bia Tiger (x2) | Thêm vào giỏ hàng |
| 6 | Click **Thêm** trên Khoai tây chiên (x1) | Thêm vào giỏ hàng |
| 7 | Tăng/giảm số lượng trong giỏ | Nút +/- hoạt động |
| 8 | Click **Gửi order** | Alert thành công, gửi xuống bếp/bar |

**Nói**: "Giao diện gọi món: chọn phòng, tìm kiếm, filter category, thêm vào giỏ. Khi gửi order, bếp/bar nhận được qua trang QL Order. Stock tự động giảm."

### Flow 5: Quản lý Order (Bếp/Bar)

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **QL Order** | Vào `/order-management` |
| 2 | Xem danh sách order | Hiển thị với trạng thái PENDING, PREPARING, SERVED |
| 3 | Click **Chế biến** trên order PENDING | Chuyển sang PREPARING |
| 4 | Click **Đã phục vụ** trên order PREPARING | Chuyển sang SERVED |

**Nói**: "Bếp/bar quản lý order theo workflow: PENDING -> PREPARING -> SERVED. Mỗi order hiển thị chi tiết món, số lượng, phòng."

### Flow 6: Thanh toán

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> trang **Lễ tân** -> phòng VIP 01 -> **Thanh toán** | Vào `/checkout` |
| 2 | Xem chi tiết hóa đơn | Hiển thị tiền phòng + tiền dịch vụ |
| 3 | Click **Thanh toán** | Hóa đơn chuyển PAID, phòng chuyển AVAILABLE |

**Nói**: "Thanh toán tự động tính tổng: tiền phòng (giá/giờ x số giờ) + tiền dịch vụ (từ order). Khi thanh toán, phòng giải phóng."

### Flow 7: Quản lý phòng

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Quản lý phòng** | Vào `/rooms` |
| 2 | Xem danh sách phòng | Hiển thị 5 phòng với thông tin chi tiết |
| 3 | Click **Thêm phòng mới** | Form thêm phòng |
| 4 | Nhập thông tin -> Lưu | Phòng mới xuất hiện trong danh sách |
| 5 | Click **Sửa** trên phòng -> sửa giá -> Lưu | Cập nhật thành công |

**Nói**: "CRUD phòng: thêm, sửa, xóa. Mỗi phòng gán cho chi nhánh, có loại (VIP/Thường/Deluxe), giá/giờ, sức chứa."

### Flow 8: Quản lý Menu

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **QL Menu** | Vào `/menu` |
| 2 | Xem danh sách món | 10 món: đồ uống, đồ ăn, trái cây |
| 3 | Click **Thêm món** -> nhập thông tin -> Lưu | Món mới xuất hiện |
| 4 | Sửa stock của Chivas 18 (5 -> 10) | Cập nhật thành công |

**Nói**: "Quản lý menu: thêm/sửa/xóa món. Mỗi món có category, giá, tồn kho. Stock tự động giảm khi có order."

### Flow 9: Khách hàng & Hội viên

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Khách hàng** | Vào `/customers` |
| 2 | Xem danh sách | 5 khách với hạng hội viên |
| 3 | Thêm khách mới -> Lưu | Khách mới xuất hiện |
| 4 | Sidebar -> **Hội viên** | Vào `/membership` |
| 5 | Xem 4 hạng: Đồng, Bạc, Vàng, Kim cương | Hiển thị điểm tối thiểu và ưu đãi |
| 6 | Xem thống kê | Biểu đồ phân bố hội viên |

**Nói**: "Khách hàng tích điểm theo hạng. Kim cương (5000+ điểm) giảm 15%. Hệ thống tự động phân hạng dựa trên điểm tích lũy."

### Flow 10: Dashboard Quản lý

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> `/manager` hoặc đổi URL | Vào Manager Dashboard |
| 2 | Xem thống kê tổng quan | Số phòng, khách, doanh thu |
| 3 | Xem biểu đồ doanh thu | Recharts line/bar chart |
| 4 | Xem thông báo | Cảnh báo tồn kho thấp, order chờ xử lý |

**Nói**: "Dashboard quản lý: tổng quan số liệu, biểu đồ doanh thu theo tuần/tháng, cảnh báo tự động (hết hàng, order chờ)."

### Flow 11: Báo cáo

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Báo cáo** | Vào `/reports` |
| 2 | Xem doanh thu theo thời gian | Biểu đồ |
| 3 | Filter theo tuần/tháng | Dữ liệu thay đổi |

**Nói**: "Báo cáo doanh thu theo thời gian thực. Filter theo ngày/tuần/tháng để phân tích xu hướng."

### Flow 12: Nhân viên

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Nhân viên** | Vào `/employees` |
| 2 | Xem 3 nhân viên | Lễ tân, Phục vụ, Quản lý |
| 3 | Thêm/sửa nhân viên | CRUD hoạt động |

**Nói**: "Quản lý nhân viên theo chi nhánh. Mỗi nhân viên có vai trò: Lễ tân, Phục vụ, Quản lý chi nhánh."

### Flow 13: Cài đặt & Swagger

| Bước | Thao tác | Kỳ vọng |
|------|----------|---------|
| 1 | Sidebar -> **Cài đặt** | Vào `/settings` |
| 2 | Xem/sửa cấu hình hệ thống | Tên app, hotline, email |
| 3 | Mở `localhost:6969/swagger-ui/index.html` | Swagger UI |
| 4 | Click **Authorize** -> nhập `dev-token-USR001` | Xác thực thành công |
| 5 | Test `GET /api/rooms` -> Try it out | Trả về JSON 5 phòng |
| 6 | Test `POST /api/bookings` -> tạo booking | Booking mới tạo |

**Nói**: "Swagger UI để test API trực tiếp. Nhập token từ login để xác thực. Tất cả endpoint đều có documentation với example."

---

### Thứ tự demo gợi ý (10-15 phút)

```
1. Đăng nhập (30s)
2. Dashboard Lễ tân - xem lưới phòng (1p)
3. Đặt phòng (2p)
4. Gọi món cho phòng đang có khách (2p)
5. QL Order - bếp/bar xử lý (1p)
6. Thanh toán (1p)
7. Dashboard Quản lý - xem thống kê (1p)
8. Khách hàng & Hội viên (1p)
9. Swagger UI - test API (2p)
```

### Lưu ý khi demo

- **Mở F12 Network tab** để show API calls thực tế
- **Giải thích màu sắc** phòng: xanh=trống, đỏ=có khách, vàng=đã đặt
- **Show Swagger** để chứng minh API documentation đầy đủ
- **Nói rõ luồng**: Đặt phòng -> Check-in -> Gọi món -> Thanh toán -> Check-out
- **Nếu thầy hỏi về security**: Chỉ `Authorization: Bearer dev-token-USR001` trong Network tab
