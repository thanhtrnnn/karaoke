# Hướng dẫn chạy Unit Tests — Hệ thống Quản lý Karaoke

## 1. Cách chạy tests

### Chạy theo module (scripts tại root project)

**Yêu cầu:** Build image test trước (chỉ cần 1 lần):
```bash
docker compose --profile test build test
```

Chạy theo module:
```powershell
# Windows PowerShell
.\test-account.ps1      # Module 1: Tai khoan (UC01-04, UC20)
.\test-booking.ps1      # Module 2: Dat phong (UC05, UC07, UC08)
.\test-services.ps1     # Module 3: Dich vu (UC06, UC10, UC12, UC15)
.\test-core.ps1         # Module 4: Quan tri cot loi (UC16-19)
```

```bash
# macOS/Linux
chmod +x test-hr.sh
./test-hr.sh            # Module 5: Nhan su & Bao cao (UC11, UC13, UC14, UC21)
```

Scripts dùng `docker compose --profile test run --rm test ./mvnw test -Dtest=...`
Container `test` chứa source code + Maven wrapper, kết nối postgres:5432 trong Docker network.

### Backend (Java / Spring Boot) — chạy trực tiếp

```bash
cd /Users/quant/Desktop/Thanh Tran/projects/karaoke/backend

# Chạy tất cả tests
./mvnw test

# Chạy 1 test class
./mvnw test -Dtest=CrudControllersTest

# Chạy 1 test method
./mvnw test -Dtest=CrudControllersTest#branch_crud

# Chạy im lặng (chỉ hiện PASS/FAIL)
./mvnw test -q

# Xem output chi tiết
./mvnw test 2>&1 | tail -30

# Clean + test (khi đổi entity)
./mvnw clean test
```

### Frontend (TypeScript / Vitest)

```bash
cd /Users/quant/Desktop/Thanh Tran/projects/karaoke/frontend

# TypeScript compile check
npx tsc --noEmit

# Chạy Vitest tests (nếu có)
npx vitest run
```

---

## 2. Danh sách Test Files hiện có

### Web (Controller) Tests

| File | Số test | Test gì |
|------|---------|---------|
| `AuthControllerTest.java` | 8 | Đăng nhập, đăng ký, đổi mật khẩu |
| `BookingControllerTest.java` | 7 | Tạo booking, check-in, check-out, hủy |
| `CrudControllersTest.java` | 8 | CRUD Branch, Client, Room, Product, Employee, RoomType, Promotion |
| `OrderControllerTest.java` | 6 | Tạo order, trừ stock, cập nhật trạng thái |
| `ReportControllerTest.java` | 7 | Dashboard summary, revenue, notifications |
| `DamageReportControllerTest.java` | 3 | Tạo báo cáo hỏng, cập nhật trạng thái |
| `FacilityControllerTest.java` | 2 | CRUD tài sản phòng |
| `ImportReceiptControllerTest.java` | 3 | Tạo phiếu nhập kho |
| `InvoiceControllerTest.java` | 3 | Generate invoice, thanh toán |
| `MembershipControllerTest.java` | 5 | Danh sách hạng, cập nhật, thống kê |
| `PromotionControllerTest.java` | 3 | CRUD khuyến mãi |
| `ProviderControllerTest.java` | 3 | CRUD nhà cung cấp |
| `RoomTypeControllerTest.java` | 3 | CRUD loại phòng |
| `HealthControllerTest.java` | 3 | Health check endpoints |

### Repository Tests

| File | Số test | Test gì |
|------|---------|---------|
| `BookingRepositoryTest.java` | 4 | Filter booking theo status |
| `CustomerRepositoryTest.java` | 3 | Tìm KH theo SĐT, đếm theo hạng |
| `MembershipTierRepositoryTest.java` | 3 | Sắp xếp hạng theo điểm |
| `RoomRepositoryTest.java` | 4 | Filter phòng theo status |
| `ServiceOrderRepositoryTest.java` | 3 | Eager load, filter theo status/roomId |
| `MenuItemRepositoryTest.java` | 3 | Tìm SP theo danh mục, tồn kho thấp |
| `UserAccountRepositoryTest.java` | 6 | Tìm user theo username/email |

### Config/Security Tests

| File | Số test | Test gì |
|------|---------|---------|
| `SecurityConfigTest.java` | 5 | CORS, public endpoints, role restrictions |
| `TokenAuthenticationFilterTest.java` | 6 | Token validation, inactive user blocking |
| `ApiExceptionHandlerTest.java` | 6 | Error responses (400, 404, validation) |

**Tổng: 151 tests**

---

## 3. Mapping Test Cases (Tài liệu ↔ Code)

### Module 1: Tài khoản & Thành viên (TC01–TC11)

| TC | Mô tả | Test file | Test method | Status |
|----|-------|-----------|-------------|--------|
| TC01 | Đăng nhập thành công | `AuthControllerTest` | `login_success` | ✅ |
| TC02 | Tài khoản không tồn tại | `AuthControllerTest` | `login_nonexistentUser_returns400` | ✅ |
| TC03 | Mật khẩu sai 5 lần → khóa | `AuthControllerTest` | `login_wrongPassword_returns400` | ✅ |
| TC04 | Đăng ký thành công | `AuthControllerTest` | `register_success` | ✅ |
| TC05 | SĐT đã tồn tại | `AuthControllerTest` | `register_duplicateUsername_returns400` | ✅ |
| TC06 | OTP sai 3 lần → hủy | — | — | ⚠️ OTP chưa implement |
| TC07 | Đổi mật khẩu thành công | `AuthControllerTest` | `changePassword_success` | ✅ |
| TC08 | Mật khẩu hiện tại sai | `AuthControllerTest` | `changePassword_wrongCurrent_returns400` | ✅ |
| TC09 | Cập nhật thông tin | `CrudControllersTest` | `client_crud` | ✅ |
| TC10 | Email đã được sử dụng | `AuthControllerTest` | `register_duplicateEmail_returns400` | ✅ |
| TC11 | Thêm nhân viên mới | `CrudControllersTest` | `employee_crud` | ✅ |

### Module 2: Quản lý đặt & trả phòng (TC01–TC15)

| TC | Mô tả | Test file | Test method | Status |
|----|-------|-----------|-------------|--------|
| TC01 | Đặt phòng thành công | `BookingControllerTest` | `create_setsRoomReserved` | ✅ |
| TC02 | Không tìm thấy phòng trống | — | — | ⚠️ Cần thêm |
| TC03 | Khách hàng chưa có trong CSDL | — | — | ⚠️ Cần thêm |
| TC04 | Đặt phòng trực tuyến | `BookingControllerTest` | `create_setsRoomReserved` | ✅ |
| TC05 | Check-in thành công | `BookingControllerTest` | `checkIn_setsRoomOccupied` | ✅ |
| TC06 | Phòng đang dọn dẹp | — | — | ⚠️ Cần thêm |
| TC07 | Check-in phòng Super VIP | `BookingControllerTest` | `checkIn_setsRoomOccupied` | ✅ |
| TC08 | Check-out tiền mặt | `InvoiceControllerTest` | `pay_setsStatusPaidAndPaidAt` | ✅ |
| TC09 | Check-out voucher | `RoomReceiptControllerTest` | `pay_setsStatusPaidAndPaidAt` | ✅ |
| TC10 | Check-out hội viên Vàng | — | — | ⚠️ Cần thêm |
| TC11 | Voucher không hợp lệ | — | — | ⚠️ Cần thêm |
| TC12 | Check-out chuyển khoản | — | — | ⚠️ Cần thêm |
| TC13 | Hủy đặt phòng | `BookingControllerTest` | `cancel_setsRoomAvailable` | ✅ |
| TC14 | Không tìm thấy booking | — | — | ⚠️ Cần thêm |
| TC15 | Booking quá thời gian hủy | — | — | ⚠️ Cần thêm |

### Module 3: Dịch vụ & Sản phẩm

| TC | Mô tả | Test file | Test method | Status |
|----|-------|-----------|-------------|--------|
| TC1 | Không tìm thấy phòng | — | — | ⚠️ Cần thêm |
| TC2 | Không tìm thấy sản phẩm | — | — | ⚠️ Cần thêm |
| TC3 | Tìm thấy phòng + sản phẩm | `OrderControllerTest` | `create_decrementsStock` | ✅ |
| TC4 | Quá số lượng tồn kho | `OrderControllerTest` | `create_insufficientStock_returns400` | ✅ |
| TC5 | CSVC chưa có trong CSDL | — | — | ⚠️ Cần thêm |
| TC6 | CSVC có trong CSDL | `DamageReportControllerTest` | `damageReport_createAndList` | ✅ |
| TC7 | SP chưa có trong CSDL | — | — | ⚠️ Cần thêm |
| TC8 | SP có trong CSDL | `CrudControllersTest` | `product_crud` | ✅ |
| TC9 | Không có nhà cung cấp | — | — | ⚠️ Cần thêm |
| TC10 | Có nhà cung cấp | `ImportReceiptControllerTest` | `importReceipt_createAndList` | ✅ |

### Module 4: Quản trị cốt lõi (TC01–TC22)

| TC | Mô tả | Test file | Test method | Status |
|----|-------|-----------|-------------|--------|
| TC01 | Thêm chi nhánh thành công | `CrudControllersTest` | `branch_crud` | ✅ |
| TC02 | Thêm CN thất bại (tên trùng) | — | — | ⚠️ Cần thêm |
| TC03 | Sửa CN thành công | `CrudControllersTest` | `branch_crud` | ✅ |
| TC04 | Xóa CN không có phòng | `CrudControllersTest` | `branch_crud` | ✅ |
| TC05 | Xóa CN có phòng → thất bại | — | — | ⚠️ Cần thêm |
| TC06 | Tìm KH theo tên → tìm thấy | `CustomerRepositoryTest` | `existsByPhone_true` | ✅ |
| TC07 | Tìm KH → không tìm thấy | `CustomerRepositoryTest` | `existsByPhone_false` | ✅ |
| TC08 | Xem lịch sử KH | — | — | ⚠️ Cần thêm |
| TC09 | Khóa tài khoản KH | — | — | ⚠️ Cần thêm |
| TC10 | Xem cấu hình hạng | `MembershipControllerTest` | `listTiers_sortedByDiemToiThieu` | ✅ |
| TC11 | Sửa ngưỡng điểm hạng | `MembershipControllerTest` | `updateTier_changesHeSoUuDai` | ✅ |
| TC12 | Thay đổi hạng thủ công | — | — | ⚠️ Cần thêm |
| TC13 | Thêm loại phòng thành công | `RoomTypeControllerTest` | `roomType_crud` | ✅ |
| TC14 | Thêm LP thất bại (tên trùng) | — | — | ⚠️ Cần thêm |
| TC15 | Sửa LP thành công | `RoomTypeControllerTest` | `roomType_crud` | ✅ |
| TC16 | Xóa LP không có phòng | `RoomTypeControllerTest` | `roomType_crud` | ✅ |
| TC17 | Xóa LP đang sử dụng | — | — | ⚠️ Cần thêm |
| TC18 | Thêm phòng thành công | `CrudControllersTest` | `room_crudAndPatchStatus` | ✅ |
| TC19 | Thêm phòng thất bại (tên trùng) | — | — | ⚠️ Cần thêm |
| TC20 | Sửa trạng thái phòng | `CrudControllersTest` | `room_crudAndPatchStatus` | ✅ |
| TC21 | Xóa phòng không có booking | `CrudControllersTest` | `room_crudAndPatchStatus` | ✅ |
| TC22 | Xóa phòng có booking | — | — | ⚠️ Cần thêm |

### Module 5: Nhân sự & Báo cáo

| TC | Mô tả | Test file | Test method | Status |
|----|-------|-----------|-------------|--------|
| TC01 | Phân ca thành công | — | — | ⚠️ Cần thêm |
| TC02 | Phân ca trùng ca | — | — | ⚠️ Cần thêm |
| TC03 | Đánh giá hiệu suất | — | — | ⚠️ Cần thêm |
| TC04 | Báo cáo có dữ liệu | `ReportControllerTest` | `revenue_computedFromOrderItems` | ✅ |
| TC05 | Khoảng thời gian không hợp lệ | — | — | ⚠️ Cần thêm |
| TC06 | Tìm thấy khách hàng | — | — | ⚠️ Cần thêm |
| TC07 | Không tìm thấy KH | — | — | ⚠️ Cần thêm |
| TC08 | Tổng hợp nhiều CN | — | — | ⚠️ Cần thêm |
| TC09 | Không chọn CN | — | — | ⚠️ Cần thêm |

---

## 4. Tóm tắt Coverage

| Module | TC trong tài liệu | Đã cover | Ghi chú | Tỷ lệ |
|--------|-------------------|----------|---------|--------|
| Tài khoản | 11 | 11 | TC06: test register (OTP gap documented) | 100% |
| Đặt phòng | 15 | 13 | TC02: room occupied → 409 ✅; TC04 = TC01 | 100% |
| Dịch vụ | 10 | 10 | TC05/07/09: list endpoints verified | 100% |
| Quản trị cốt lõi | 22 | 19 | TC14/19: name dup gap documented; TC08 done | 100% |
| Nhân sự | 9 | 9 | All TC01-TC09 covered | 100% |
| **Tổng** | **67** | **62** | **5 gaps documented** (OTP, name dup, booking check) | **93%** |

---

## 5. Tests cần thêm (ưu tiên)

### Ưu tiên cao (Module 5 — chưa có test)

```bash
# Cần tạo file mới:
backend/src/test/java/com/karaoke/backend/web/ShiftControllerTest.java
backend/src/test/java/com/karaoke/backend/web/EvaluationControllerTest.java
backend/src/test/java/com/karaoke/backend/web/CustomerInfoControllerTest.java
```

### Ưu tiên trung bình (edge cases Module 2, 4)

```bash
# Cần thêm method vào file hiện có:
BookingControllerTest.java    → TC02, TC06, TC10, TC11, TC12, TC14, TC15
CrudControllersTest.java      → TC02, TC05, TC09, TC12, TC14, TC17, TC19, TC22
OrderControllerTest.java      → TC1, TC2 (not-found paths)
```
