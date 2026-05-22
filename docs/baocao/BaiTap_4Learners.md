# TỔNG QUAN BÀI TẬP THỰC HÀNH - 4 LEARNER
## Hệ thống Quản lý Quán Karaoke - Famtaoke

---

## Cấu trúc dự án

| Layer | Công nghệ | Mô tả |
|-------|-----------|-------|
| Frontend | React + TypeScript + Vite + Tailwind CSS + Zustand + Recharts | SPA, port 6969 |
| Backend | Spring Boot + Spring Data JPA + Spring Security | REST API, port 8080 |
| Database | PostgreSQL 16 | JPA auto DDL |
| Auth | Token giả `dev-token-{userId}` qua `TokenAuthenticationFilter` | Không phải JWT |

---

## Phân chia module cho 4 Learner

| Learner | Họ tên | Module | Trang FE | Controller BE | Bảng DB chính |
|---------|--------|--------|----------|---------------|---------------|
| **L1** | Trung | Xác thực | LoginPage, RegisterPage | AuthController | tblUser |
| **L2** | Tuấn | Quản lý phòng & Đặt phòng | ReceptionDashboard, BookingPage, BookingManagement | RoomController, BookingController | tblRoom, tblBooking |
| **L3** | Khánh | Gọi món | OrderPage, OrderManagement | OrderController | tblOrder, tblOrderItem, tblProduct |
| **L4** | Hành | Thanh toán & Báo cáo | CheckoutPage, ReportsPage | InvoiceController, ReportController | tblInvoice |

**File chi tiết từng Learner:**
- Trung → `docs/baocao/Trung_XacThuc.md`
- Tuấn → `docs/baocao/Tuan_QuanLyPhong.md`
- Khánh → `docs/baocao/Khanh_GoiMon.md`
- Hành → `docs/baocao/Hanh_ThanhToanBaoCao.md`

---

## Bảng tổng hợp file cần đọc theo Learner

| Learner | File FE | File BE (Controller) | File BE (Domain) | File BE (Repository) | File BE (Config) |
|---------|---------|---------------------|-------------------|---------------------|-------------------|
| **Trung** | LoginPage.tsx, RegisterPage.tsx | AuthController.java | UserAccount.java, UserRole.java | UserAccountRepository.java | SecurityConfig.java, TokenAuthenticationFilter.java |
| **Tuấn** | ReceptionDashboard.tsx, BookingPage.tsx, BookingManagement.tsx | CrudControllers.java (RoomController), BookingController.java | Room.java, RoomStatus.java, Booking.java, BookingStatus.java, Branch.java | RoomRepository.java, BookingRepository.java | SecurityConfig.java |
| **Khánh** | OrderPage.tsx, OrderManagement.tsx | OrderController.java | ServiceOrder.java, ServiceOrderItem.java, MenuItem.java, OrderStatus.java | ServiceOrderRepository.java, MenuItemRepository.java | DataSeeder.java |
| **Hành** | CheckoutPage.tsx, ReportsPage.tsx | CrudControllers.java (InvoiceController), ReportController.java | Invoice.java, InvoiceStatus.java | InvoiceRepository.java | DataSeeder.java |

### File TOÀN HỆ THỐNG (TẤT CẢ learner đều phải đọc)

| File | Vai trò |
|------|----------|
| `docker-compose.yml` | Hiểu 5 services, ports, depends_on, healthcheck |
| `backend/src/main/java/com/karaoke/backend/config/SecurityConfig.java` | Cấu hình Spring Security + CORS |
| `backend/src/main/java/com/karaoke/backend/config/TokenAuthenticationFilter.java` | Filter xác thực token |
| `backend/src/main/java/com/karaoke/backend/config/DataSeeder.java` | Khởi tạo dữ liệu mẫu |
| `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` | 8 CRUD controllers (Branch, Customer, Room, Menu, Employee, Invoice, Membership, SystemConfig) |
| `backend/src/main/java/com/karaoke/backend/common/ApiExceptionHandler.java` | Xử lý lỗi toàn cục |
| `frontend/src/App.tsx` | Router + tất cả routes |
| `frontend/src/components/ProtectedRoute.tsx` | Route guard kiểm tra token |
| `frontend/src/components/Sidebar.tsx` | Menu điều hướng 13 trang |
| `frontend/src/store/uiStore.ts` | Zustand global state |
| `frontend/vite.config.ts` | Vite proxy `/api` → backend |
| `frontend/nginx.conf` | Nginx proxy trong Docker |

---

## Tình trạng kết nối API Frontend → Backend

| Trang FE | Có gọi API? | Ghi chú |
|----------|-------------|---------|
| LoginPage | **CÓ** | `POST /api/auth/login` |
| ReceptionDashboard | **CÓ** | `GET /api/rooms` |
| BookingPage | **CÓ** | `GET /api/rooms` |
| BookingManagement | **CÓ** | `GET /api/bookings` |
| OrderPage | **CÓ** | `GET /api/menu-items` |
| OrderManagement | **CÓ** | `GET /api/orders`, `PUT /api/orders/{id}/status` |
| RoomManagement | **CÓ** | `GET/POST/PUT/DELETE /api/rooms` |
| MenuManagement | **CÓ** | `GET/POST/PUT/DELETE /api/menu-items` |
| InventoryPage | **CÓ** | `GET /api/menu-items` |
| CustomerPage | **CÓ** | `GET/POST /api/customers` |
| EmployeeManagement | **CÓ** | `GET/POST/PUT/DELETE /api/employees` |
| ManagerDashboard | **CÓ** | `GET /api/reports/summary` |
| ReportsPage | **CÓ** | `GET /api/reports/summary` (metrics), biểu đồ vẫn hardcode |
| SettingsPage | **CÓ** | `GET/POST/PUT/DELETE /api/branches` |
| CheckoutPage | KHÔNG | Toàn bộ hardcode (chưa có endpoint hóa đơn chi tiết) |
| MembershipPage | KHÔNG | Hardcode hạng hội viên (chưa có endpoint) |

---

## Bài tập TOÀN HỆ THỐNG (TẤT CẢ learner PHẢI làm)

> Những bài tập này áp dụng cho TẤT CẢ learner, không chỉ module riêng. Mục tiêu: hiểu toàn bộ hệ thống, không chỉ phần của mình.

### Bài TH1 - Swagger CRUD đầy đủ (Ngày 3)

**Yêu cầu:** Dùng Swagger UI thực hiện chu kỳ CRUD đầy đủ cho TẤT CẢ resources.

1. **Rooms:** GET list → POST tạo phòng mới (name="P99", type="VIP", capacity=10, hourlyPrice=100000, branchId="CN001") → GET by id → PUT cập nhật → DELETE
2. **Customers:** GET list → POST tạo khách hàng mới → GET by id → PUT → DELETE
3. **Menu Items:** GET list → POST tạo món mới → GET by id → PUT → DELETE
4. **Bookings:** POST tạo booking (customerId + roomId từ trên) → GET list → PUT status CHECKED_IN → GET lại (room status đã đổi?)
5. **Orders:** POST tạo order → GET list → PUT status PREPARING → PUT status SERVED
6. **Invoices:** POST tạo invoice → GET list → PUT pay

**Ghi nhận:** Endpoint nào cần token? Endpoint nào không cần? Tại sao?

### Bài TH2 - DevTools Debug (Ngày 3)

**Yêu cầu:** Dùng Chrome DevTools kiểm tra frontend.

1. **Network tab:**
   - Load ReceptionDashboard → quan sát request GET /api/rooms → Status, Response, Headers
   - Load OrderPage → quan sát request GET /api/menu-items
   - Click vào 1 request → xem tab Headers (Authorization header), Response (JSON data), Timing

2. **Console tab:**
   - `localStorage.removeItem('token')` → reload → có bị redirect về /login không?
   - `localStorage.setItem('token', 'wrong-token')` → reload → API trả 403?

3. **Application tab:**
   - Xem localStorage → có key 'token' và 'user'?
   - Parse JSON của 'user' → thấy gì?

### Bài TH3 - Trace luồng xuyên module (Ngày 5)

**Yêu cầu:** EVERY learner phải trace luồng "Khách hàng đến quán karaoke, gọi món, và thanh toán". Vẽ sơ đồ trên giấy, mỗi bước là 1 hộp, mũi tên chỉ hướng.

```
Đăng nhập                    Đặt phòng                    Check-in
LoginPage.tsx                BookingPage.tsx               BookingManagement.tsx
  ↓ POST /api/auth/login       ↓ POST /api/bookings          ↓ PUT /api/bookings/{id}/status
AuthController.java          BookingController.java        BookingController.java
  ↓ BCrypt verify              ↓ RoomRepository.save()       ↓ RoomRepository.save()
UserAccountRepository        Room status → RESERVED        Room status → OCCUPIED
  ↓ trả dev-token              ↓ trả BookingResponse        ↓ trả BookingResponse

Gọi món                     Thanh toán
OrderPage.tsx                CheckoutPage.tsx
  ↓ POST /api/orders           ↓ POST /api/invoices
OrderController.java         InvoiceController.java
  ↓ MenuItemRepository         ↓ InvoiceRepository.save()
    (trừ tồn kho)             ↓ PUT /api/bookings/{id}/status COMPLETED
  ↓ ServiceOrderRepository     ↓ RoomRepository.save()
    .save()                      Room status → AVAILABLE
```

**Câu hỏi kiểm tra:**
- Khi tạo order, code kiểm tra tồn kho ở đâu? (file nào, dòng nào?)
- Khi check-in, room status thay đổi thế nào? (file nào, dòng nào?)
- Khi thanh toán, room status thay đổi thế nào? (file nào, dòng nào?)

### Bài TH4 - Sửa lỗi hệ thống (Ngày 5)

**Yêu cầu:** QA tạo 1 lỗi CROSS-MODULE (không thuộc module riêng của ai). TẤT CẢ 4 learner cùng tìm và sửa.

**Quy trình:**
1. Phát hiện: Chức năng nào bị ảnh hưởng?
2. Trace: Request đi qua những controller/repository nào?
3. Tìm: Dòng code nào thiếu logic?
4. Sửa: Thêm lại logic bị thiếu
5. Test: Chạy lại toàn bộ luồng

---

## Bảng mã hóa lỗi QA tạo ra (tóm tắt)

| Learner | File | Dòng | Lỗi | Hậu quả |
|---------|------|------|------|---------|
| Trung | AuthController.java | 106 | Đảo tham số `passwordEncoder.matches(hash, pw)` | Login luôn fail dù đúng MK |
| Tuấn | CrudControllers.java | 231 | Xóa `@RequestBody` | Spring không deserialize body |
| Khánh | OrderController.java | 116 | Đổi `<` thành `>` trong kiểm tra tồn kho | Cho phép order quá stock, stock âm |
| Hành | ReportController.java | 67 | Đổi `PAID` thành `UNPAID` | Revenue = 0 hoặc sai |

---

## Câu hỏi vấn đáp liên module (dành cho tất cả)

### Về kiến trúc tổng thể

**Câu 1:** Dự án này có mấy tầng (layer)? Mỗi tầng chịu trách nhiệm gì? Tại sao lại tách riêng như vậy?

**Đáp án:**
- 3 tầng: **Presentation** (React SPA) → **Application** (Spring Boot REST API) → **Data** (PostgreSQL)
- Tách riêng để: FE và BE phát triển độc lập, dễ thay đổi giao diện không ảnh hưởng logic, dễ scale riêng từng tầng
- Giao tiếp qua HTTP REST API với JSON format

**Câu 2:** Tại sao dự án không dùng Service layer? Controller gọi trực tiếp Repository có vấn đề gì?

**Đáp án:**
- Các controller trong dự án (AuthController, OrderController, BookingController, ReportController) đều inject Repository trực tiếp, KHÔNG có Service class
- Ưu điểm: đơn giản, ít code, phù hợp dự án nhỏ
- Nhược điểm: logic nghiệp vụ nằm rải rác trong controller, khó test unit, khó tái sử dụng khi nhiều controller cần cùng logic

**Câu 3:** Giải thích cách Spring Security hoạt động trong dự án này. Request đi qua những bước nào trước khi đến Controller?

**Đáp án:**
1. Request đến → Spring Security filter chain
2. `TokenAuthenticationFilter.java` chạy TRƯỚC `UsernamePasswordAuthenticationFilter`
3. Lấy token từ header `Authorization: Bearer xxx`
4. Nếu token bắt đầu bằng `"dev-token-"` → cắt lấy userId → tìm user trong DB → set Authentication vào SecurityContext
5. `SecurityConfig.java` kiểm tra: nếu endpoint nằm trong `permitAll()` → cho qua; nếu không → cần Authentication
6. Nếu không có Authentication → HTTP 403 Forbidden

**Câu 4:** Các entity trong dự án có quan hệ gì với nhau? Vẽ sơ đồ quan hệ bằng text.

**Đáp án:**
```
Branch (CN001) ──1:N── Room (P01) ──1:N── ServiceOrder (ORD001)
                        Room ──1:N── Booking (BK001) ──1:1── Invoice (INV001)
                        
Customer (KH001) ──1:N── Booking

MenuItem (SP001) ──1:N── ServiceOrderItem ──N:1── ServiceOrder

UserAccount (USR001)  [đứng riêng, không FK với entity khác]

Employee (NV001) ──N:1── Branch
```

**Câu 5:** Trước đây nhiều trang dùng mock data, bây giờ đã kết nối API hết chưa? Còn trang nào chưa kết nối?

**Đáp án:**
- Hầu hết các trang đã kết nối API: LoginPage, ReceptionDashboard, BookingPage, BookingManagement, OrderPage, OrderManagement, RoomManagement, MenuManagement, InventoryPage, CustomerPage, EmployeeManagement, ManagerDashboard, ReportsPage, SettingsPage
- Chỉ còn 2 trang chưa kết nối: **CheckoutPage** (chưa có endpoint hóa đơn chi tiết) và **MembershipPage** (chưa có endpoint hạng hội viên)
- `mockData.ts` đã bị xóa hoàn toàn khỏi dự án
- ReportsPage kết nối `/api/reports/summary` cho metrics, nhưng biểu đồ doanh thu theo thời gian vẫn dùng data hardcode (chưa có endpoint)

### Về database và ORM

**Câu 6:** JPA tự động tạo bảng như thế nào? Giải thích `ddl-auto=update` trong `application.properties`.

**Đáp án:**
- `application.properties`: `spring.jpa.hibernate.ddl-auto=update`
- `update`: Hibernate tự động tạo/cập nhật bảng dựa trên Entity class. Nếu bảng chưa tồn tại → tạo mới. Nếu đã tồn tại → thêm cột mới (KHÔNG xóa cột cũ)
- `@Table(name = "tblRoom")` trong `Room.java` đặt tên bảng
- `@Id` đánh dấu khóa chính, `@ManyToOne` tạo khóa ngoại tự động

**Câu 7:** Sự khác biệt giữa `@ManyToOne` và `@OneToMany` là gì? Cho ví dụ cụ thể trong code.

**Đáp án:**
- `@ManyToOne`: Nhiều đối tượng thuộc về 1 đối tượng. VD: `Room.java`: nhiều Room thuộc 1 Branch
- `@OneToMany`: 1 đối tượng chứa nhiều đối tượng con. VD: `ServiceOrder.java`: 1 Order chứa nhiều OrderItem
- Thường dùng cặp: `@ManyToOne` ở phía con, `@OneToMany(mappedBy=...)` ở phía cha
- `cascade = CascadeType.ALL`: thao tác trên cha sẽ cascade xuống con
- `orphanRemoval = true`: xóa con khỏi list → xóa luôn trong DB

### Về Frontend

**Câu 8:** Zustand được dùng như thế nào trong dự án này? So sánh với useState thông thường.

**Đáp án:**
- `frontend/src/store/uiStore.ts`: Zustand quản lý state sidebar (mở/đóng)
- `useUIStore` có thể dùng ở bất kỳ component nào mà không cần prop drilling
- `useState`: state cục bộ trong 1 component, không chia sẻ được
- Zustand: state global, chia sẻ giữa nhiều component, không cần Context Provider

**Câu 9:** Giải thích cách `Recharts` hoạt động trong `ReportsPage`. Khi user thay đổi dropdown, dữ liệu biểu đồ thay đổi ra sao?

**Đáp án:**
- State `chartType` lưu lựa chọn: 'hourly', 'weekly', 'monthly'
- `const currentData = chartData[chartType]` - lấy mảng dữ liệu tương ứng
- `<AreaChart data={currentData}>` nhận prop data, re-render khi data thay đổi
- Dropdown gọi `setChartType` → state thay đổi → `currentData` thay đổi → AreaChart re-render
- Dữ liệu vẫn hardcode trong `chartData` object

**Câu 10:** Tailwind CSS được dùng như thế nào trong dự án? Giải thích class `bg-primary-container text-on-primary-container`.

**Đáp án:**
- Tailwind dùng utility class trực tiếp trong JSX: `className="px-4 py-2 bg-primary-container..."`
- `bg-primary-container`, `text-on-primary-container` là custom color tokens (Material Design 3 style)
- Được định nghĩa trong `tailwind.config.js` hoặc CSS custom properties
- `primary-container` = màu nền vàng gold (#D4AF37), `on-primary-container` = màu chữ trên nền đó (đen)
- Kích thước responsive: `md:`, `lg:`, `xl:` breakpoint prefixes

---

## Tiêu chí đánh giá

| Tiêu chí | Trọng số | Nội dung |
|----------|----------|----------|
| Module riêng | 40% | 5 câu vấn đáp module (8 điểm/câu) |
| Toàn hệ thống | 30% | 10 câu liên module (3 điểm/câu) |
| Công cụ | 15% | 2 bài thực hành Swagger + DevTools |
| Debug | 15% | Sửa lỗi riêng + sửa lỗi hệ thống + giải thích |

**Tổng: 100 điểm. Đậu: >= 60 điểm. Giỏi: >= 80 điểm.**
