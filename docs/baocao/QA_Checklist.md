# CHECKLIST CHO QA
## Hệ thống Quản lý Quán Karaoke - 8 ngày học

---

## Trước khi bắt đầu (Ngày 0)

- [ ] Clone repo và chạy thành công: `./start.sh` hoặc `docker-compose up`
- [ ] Kiểm tra Frontend mở được tại `http://localhost:6969`
- [ ] Kiểm tra Backend Swagger UI tại `http://localhost:8080/swagger-ui.html`
- [ ] Đăng nhập thành công với `admin` / `admin123`
- [ ] Chuẩn bị tài liệu in cho từng Learner (file `docs/baocao/[Ten]_*.md`)
- [ ] Đảm bảo mỗi Learner có máy tính, IDE (VS Code + IntelliJ hoặc tương đương)

---

## Checklist tạo lỗi có chủ đích

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

## Checklist theo dõi từng ngày

### Ngày 1-2: Đọc hiểu mã nguồn

- [ ] Mỗi Learner đọc file bài tập của mình
- [ ] Trace được flow từ FE → BE → DB cho module phụ trách
- [ ] Hỏi đáp: Learner giải thích được flow bằng lời nói, không cần nhìn code
- [ ] **Checkpoint:** Mỗi Learner vẽ được sơ đồ flow trên giấy/bảng

### Ngày 3-4: Sửa lỗi có chủ đích

- [ ] QA tạo lỗi trước khi Learner bắt đầu (xem phần trên)
- [ ] Mỗi Learner tìm và sửa được lỗi trong thời gian < 45 phút
- [ ] Learner giải thích được TẠI SAO lỗi đó xảy ra
- [ ] Learner commit code sửa lỗi với message mô tả rõ ràng
- [ ] **Checkpoint:** Learner demo chạy lại chức năng sau khi sửa

### Ngày 5-6: Chỉnh sửa UI

- [ ] Mỗi Learner hoàn thành task chỉnh sửa UI (đổi text/màu/như mô tả trong bài tập)
- [ ] Kiểm tra giao diện chạy đúng sau khi sửa
- [ ] Learner giải thích được Tailwind CSS class đang dùng
- [ ] **Checkpoint:** Screenshot trước/sau khi sửa

### Ngày 7: Vấn đáp tổng hợp

- [ ] Chạy 5 câu vấn đáp module riêng cho từng Learner
- [ ] Chạy 5 câu vấn đáp liên module cho tất cả
- [ ] Ghi nhận câu trả lời sai để ôn lại
- [ ] **Checkpoint:** Mỗi Learner trả lời đúng >= 3/5 câu module riêng

### Ngày 8: Tổng duyệt

- [ ] Mỗi Learner thuyết trình 5 phút về module của mình
- [ ] QA đặt câu hỏi chất vấn ngẫu nhiên
- [ ] Ôn lại các câu trả lời sai trong ngày 7
- [ ] **Checkpoint:** Tất cả Learner tự tin trả lời câu hỏi về toàn bộ hệ thống

---

## Checklist environment reset (nếu cần)

- [ ] Xóa database H2: restart backend (data seeder sẽ chạy lại)
- [ ] Hoặc truy cập `http://localhost:8080/h2-console` → xóa manual
- [ ] Docker reset: `docker-compose down -v && docker-compose up --build`

---

## Script tạo lỗi nhanh (cho QA copy-paste)

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

**LƯU Ý:** Chạy script SAU khi Learner đã đọc hiểu code. Chạy TRƯỚC khi bắt đầu Bài 2.

---

## Script revert lỗi (sau khi Learner sửa xong hoặc cần reset)

```bash
# Revert tất cả lỗi
git checkout -- backend/src/main/java/com/karaoke/backend/web/AuthController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/CrudControllers.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/OrderController.java
git checkout -- backend/src/main/java/com/karaoke/backend/web/ReportController.java
```
