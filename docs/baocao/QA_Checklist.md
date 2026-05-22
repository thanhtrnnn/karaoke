# CHECKLIST CHO QA
## Hệ thống Quản lý Quán Karaoke - 8 ngày học

---

## Trước khi bắt đầu (Ngày 0)

- [ ] Clone repo và chạy thành công: `./start.sh` hoặc `docker compose up`
- [ ] Kiểm tra Frontend mở được tại `http://localhost:6969`
- [ ] Kiểm tra Backend Swagger UI tại `http://localhost:8080/swagger-ui.html`
- [ ] Đăng nhập thành công với `admin` / `admin123`
- [ ] Chuẩn bị tài liệu in cho từng Learner (file `docs/baocao/[Ten]_*.md`)
- [ ] Đảm bảo mỗi Learner có máy tính, IDE (VS Code + IntelliJ hoặc tương đương)

---

## Checklist tạo lỗi có chủ đích (Ngày 4)

### Lỗi của Trung (Xác thực)

**File:** `backend/src/main/java/com/karaoke/backend/web/AuthController.java`

- [ ] **Dòng 106:** Đảo tham số `passwordEncoder.matches()`
  ```java
  // Từ: passwordEncoder.matches(request.password(), user.getPasswordHash())
  // Thành: passwordEncoder.matches(user.getPasswordHash(), request.password())
  ```
- [ ] **Verify:** Đăng nhập với `admin` / `admin123` → phải nhận lỗi "Invalid username or password"
- [ ] **Ghi chú:** Lỗi này KHÔNG crash app, chỉ login fail → khó debug hơn

### Lỗi của Tuấn (Quản lý phòng)

**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java`

- [ ] **Dòng 231:** Xóa annotation `@RequestBody`
  ```java
  // Từ: Room create(@RequestBody Room room) {
  // Thành: Room create(Room room) {
  ```
- [ ] **Verify:** POST `/api/rooms` qua Swagger với body JSON → phải nhận lỗi 400/500
- [ ] **Ghi chú:** Lỗi này crash rõ ràng, dễ tìm hơn

### Lỗi của Khánh (Gọi món)

**File:** `backend/src/main/java/com/karaoke/backend/web/OrderController.java`

- [ ] **Dòng 116:** Đổi `<` thành `>`
  ```java
  // Từ: if (menuItem.getStock() < itemRequest.quantity())
  // Thành: if (menuItem.getStock() > itemRequest.quantity())
  ```
- [ ] **Verify:** Order 3 chai Bia Tiger (stock=45) → phải nhận lỗi "Not enough stock"
- [ ] **Ghi chú:** Logic bug, không crash, nhưng kết quả sai hoàn toàn

### Lỗi của Hành (Thanh toán & Báo cáo)

**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`

- [ ] **Dòng 67:** Đổi `PAID` thành `UNPAID`
  ```java
  // Từ: .filter(invoice -> invoice.getStatus() == InvoiceStatus.PAID)
  // Thành: .filter(invoice -> invoice.getStatus() == InvoiceStatus.UNPAID)
  ```
- [ ] **Verify:** GET `/api/reports/summary` → `revenue` phải = 0 dù có hóa đơn PAID
- [ ] **Ghi chú:** Silent bug, không exception, kết quả sai ngầm

---

## Checklist tạo lỗi HỆ THỐNG (Ngày 5)

> Lỗi hệ thống là lỗi CROSS-MODULE, không thuộc module riêng của learner nào. Tất cả 4 learner cùng tìm và sửa.

### Lựa chọn 1: Xóa trừ tồn kho trong OrderController

**File:** `backend/src/main/java/com/karaoke/backend/web/OrderController.java`

- [ ] Xóa 2 dòng sau (khoảng dòng 119-120):
  ```java
  menuItem.setStock(menuItem.getStock() - itemRequest.quantity());
  menuItems.save(menuItem);
  ```
- [ ] **Verify:** Tạo order với Bia Tiger (stock=45), quantity=3 → order thành công nhưng stock trong DB vẫn = 45
- [ ] **Ảnh hưởng:** Tồn kho không giảm khi order, cho phép order vô hạn

### Lựa chọn 2: Sửa trạng thái phòng sau check-in

**File:** `backend/src/main/java/com/karaoke/backend/web/BookingController.java`

- [ ] Sửa dòng khoảng 138-139:
  ```java
  // Từ: booking.getRoom().setStatus(RoomStatus.OCCUPIED);
  // Thành: booking.getRoom().setStatus(RoomStatus.AVAILABLE);
  ```
- [ ] **Verify:** Check-in booking → room status vẫn "AVAILABLE" thay vì "OCCUPIED"
- [ ] **Ảnh hưởng:** Phòng vẫn hiển thị "Trống" dù khách đang hát

### Lựa chọn 3: Xóa thời gian thanh toán

**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` (InvoiceController.pay())

- [ ] Xóa dòng:
  ```java
  invoice.setPaidAt(java.time.LocalDateTime.now());
  ```
- [ ] **Verify:** Pay invoice → status = PAID nhưng paidAt = null
- [ ] **Ảnh hưởng:** Hóa đơn đã thanh toán nhưng không có thời gian thanh toán

**Lưu ý:** Chọn 1 trong 3 lựa chọn. Tạo lỗi SAU khi learner đã trace luồng xuyên module xong.

---

## Checklist theo dõi từng ngày

### Ngày 0: Cài đặt & Kiến trúc

- [ ] Mỗi Learner chạy được dự án, chụp 4 screenshot
- [ ] Learner vẽ được sơ đồ kiến trúc (5 services + ports)
- [ ] Learner dùng DevTools Network xem được API calls
- [ ] **Checkpoint:** Learner mô tả được kiến trúc hệ thống bằng lời

### Ngày 1: Entity, Controller, API

- [ ] Learner vẽ được ERD (12 entities + quan hệ)
- [ ] Learner dùng Swagger test được 7 thao tác
- [ ] Learner đọc được controller riêng module
- [ ] **Checkpoint:** Learner tạo được order qua Swagger, biết endpoint nào cần token

### Ngày 2: Security, Auth & Frontend

- [ ] Learner test Security qua Swagger (403, 200, permitAll)
- [ ] Learner trace được luồng auth (login → token → header → filter)
- [ ] Learner đọc được App.tsx, ProtectedRoute, Sidebar
- [ ] **Checkpoint:** Learner giải thích được request đi qua những bước nào trước khi đến Controller

### Ngày 3: Công cụ Chuyên sâu

- [ ] Learner test CRUD đầy đủ qua Swagger (Rooms, Customers, Bookings, Orders, Invoices)
- [ ] Learner dùng DevTools xem được request/response/headers
- [ ] Learner dùng pgAdmin xem được dữ liệu bảng
- [ ] Learner test Docker networking (ping giữa các service)
- [ ] **Checkpoint:** Tạo được booking hoàn chỉnh qua Swagger + kiểm tra trong pgAdmin

### Ngày 4: Sửa lỗi Module riêng

- [ ] QA tạo lỗi trước khi Learner bắt đầu (xem phần trên)
- [ ] Mỗi Learner tìm và sửa được lỗi trong thời gian < 45 phút
- [ ] Learner giải thích được TẠI SAO lỗi đó xảy ra (nguyên nhân gốc)
- [ ] Learner trace được cross-module impact (lỗi ảnh hưởng những trang nào)
- [ ] **Checkpoint:** Learner demo chạy lại chức năng sau khi sửa

### Ngày 5: Trace xuyên module + Sửa lỗi hệ thống

- [ ] Mỗi Learner vẽ được luồng "Đăng nhập → Đặt phòng → Check-in → Gọi món → Thanh toán"
- [ ] QA tạo lỗi hệ thống (xem phần trên)
- [ ] TẤT CẢ 4 learner cùng tìm và sửa lỗi hệ thống
- [ ] Learner hiểu Docker networking (depends_on, healthcheck)
- [ ] **Checkpoint:** Learner trace được toàn bộ luồng, biết mỗi bước đi qua file nào

### Ngày 6: UI & Frontend + Vấn đáp module

- [ ] Mỗi Learner hoàn thành task chỉnh sửa UI (đổi text/màu)
- [ ] Learner giải thích được Tailwind CSS, Recharts, Zustand
- [ ] Chạy 5 câu vấn đáp module riêng + 2 câu ngoài đề
- [ ] **Checkpoint:** Screenshot trước/sau khi sửa UI, trả lời đúng >= 4/5 câu

### Ngày 7: Vấn đáp Tổng hợp + Tổng duyệt

- [ ] Chạy 10 câu vấn đáp liên module cho TẤT CẢ learner
- [ ] Chạy 2 bài thực hành công cụ (Swagger tạo booking + DevTools xem headers)
- [ ] Chạy 3 câu ngẫu nhiên liên module cho mỗi learner
- [ ] Mỗi Learner thuyết trình 15 phút (3p giới thiệu + 5p trace + 3p demo + 2p bài học + 2p Q&A)
- [ ] **Checkpoint:** Mỗi Learner trả lời đúng >= 7/10 câu liên module

---

## Tiêu chí đánh giá

| Tiêu chí | Trọng số | Nội dung | Điểm |
|----------|----------|----------|------|
| Module riêng | 40% | 5 câu vấn đáp module (8 điểm/câu) | 40 |
| Toàn hệ thống | 30% | 10 câu liên module (3 điểm/câu) | 30 |
| Công cụ | 15% | 2 bài thực hành Swagger + DevTools | 15 |
| Debug | 15% | Sửa lỗi riêng (5đ) + sửa lỗi hệ thống (5đ) + giải thích (5đ) | 15 |

**Tổng: 100 điểm. Đậu: >= 60 điểm. Giỏi: >= 80 điểm.**

---

## Checklist environment reset (nếu cần)

- [ ] Xem database: pgAdmin tại http://localhost:5050 (host=`postgres`, user=`karaoke_admin`, db=`karaoke`)
- [ ] Reset database: `docker compose down -v && docker compose up -d --build`

---

## Script tạo lỗi nhanh (cho QA copy-paste)

### Lỗi module riêng (Ngày 4)

```bash
# Tạo lỗi cho Trung - đảo tham số BCrypt
sed -i '' 's/passwordEncoder.matches(request.password(), user.getPasswordHash())/passwordEncoder.matches(user.getPasswordHash(), request.password())/' backend/src/main/java/com/karaoke/backend/web/AuthController.java

# Tạo lỗi cho Tuấn - xóa @RequestBody
sed -i '' 's/Room create(@RequestBody Room room)/Room create(Room room)/' backend/src/main/java/com/karaoke/backend/web/CrudControllers.java

# Tạo lỗi cho Khánh - đảo phép so sánh tồn kho
sed -i '' 's/menuItem.getStock() < itemRequest.quantity()/menuItem.getStock() > itemRequest.quantity()/' backend/src/main/java/com/karaoke/backend/web/OrderController.java

# Tạo lỗi cho Hành - đổi PAID thành UNPAID
sed -i '' 's/InvoiceStatus.PAID/InvoiceStatus.UNPAID/' backend/src/main/java/com/karaoke/backend/web/ReportController.java
```

**LƯU Ý:** Chạy script SAU khi Learner đã đọc hiểu code (Ngày 3). Chạy TRƯỚC khi bắt đầu Ngày 4.

### Lỗi hệ thống (Ngày 5)

```bash
# Lựa chọn 1: Xóa trừ tồn kho
sed -i '' '/menuItem.setStock(menuItem.getStock() - itemRequest.quantity());/d' backend/src/main/java/com/karaoke/backend/web/OrderController.java
sed -i '' '/menuItems.save(menuItem);/d' backend/src/main/java/com/karaoke/backend/web/OrderController.java

# Lựa chọn 2: Sửa trạng thái phòng sau check-in
sed -i '' 's/booking.getRoom().setStatus(RoomStatus.OCCUPIED)/booking.getRoom().setStatus(RoomStatus.AVAILABLE)/' backend/src/main/java/com/karaoke/backend/web/BookingController.java

# Lựa chọn 3: Xóa thời gian thanh toán
sed -i '' '/invoice.setPaidAt(java.time.LocalDateTime.now());/d' backend/src/main/java/com/karaoke/backend/web/CrudControllers.java
```

---

## Script revert lỗi (sau khi Learner sửa xong hoặc cần reset)

```bash
# Revert tất cả lỗi module riêng
git checkout -- backend/src/main/java/com/karaoke/backend/web/AuthController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/CrudControllers.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/OrderController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/ReportController.java

# Revert lỗi hệ thống (tùy lựa chọn)
git checkout -- backend/src/main/java/com/karaoke/backend/web/OrderController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/BookingController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/CrudControllers.java
```
