# PLAN: Khớp TOÀN BỘ Codebase với Tài liệu MVC

## Context

Audit 5 modules phát hiện: Booking module thiếu UI classes, các modules khác thiếu fields/features. Plan này fix TẤT CẢ.

---

## PHASE 1: BOOKING MODULE — Tách UI classes theo MVC

### 1.1 BookingPage.tsx → 3 bước wizard

**Hiện tại:** Gộp tất cả vào 1 trang (room list + client input + confirm modal)
**Theo tài liệu:** 3 Boundary classes riêng biệt

Tách thành:
- **SearchFreeRoomForm** (bước 1): chọn ngày + giờ → `GET /api/rooms?status=AVAILABLE` → bảng phòng trống
- **SearchClientForm** (bước 2): nhập SĐT/tên → `GET /api/clients?keyword=` → chọn khách
- **ConfirmBookingModal** (bước 3): đã có, giữ nguyên

### 1.2 BookingManagement.tsx — thêm getActiveRoom()

Thêm section "Phòng đang hoạt động" (UC08):
- `GET /api/bookings/active-rooms` → danh sách phòng OCCUPIED
- Nút "Check-out" → navigate sang CheckoutPage

### 1.3 Backend — verify endpoints

- `GET /api/rooms?status=AVAILABLE` ✅ đã có
- `GET /api/clients?keyword=` ✅ đã có
- `POST /api/bookings` ✅ đã có
- `PUT /api/bookings/{id}/status` ✅ đã có (check-in, check-out, cancel)
- `GET /api/bookings/active-rooms` ✅ đã có

---

## PHASE 2: ACCOUNT MODULE — Thêm fields/features thiếu

### 2.1 Entity fields thiếu

| File | Thêm field | Lý do |
|------|-----------|-------|
| `Client.java` | `String email` | Tài liệu test data có cột email |
| `LoginSession.java` | `String trangThai` | TC07 cần "Đã thu hồi" status |
| `RoomType.java` | `String moTa` | Test data có "Phòng phổ thông" |
| `MembershipTier.java` | `Integer diemThuongNhan` | Test data có bonus multiplier |

### 2.2 Profile update endpoint

**AuthController.java**: thêm `PUT /api/auth/profile`
- Input: `fullName`, `email` (từ JWT user)
- Update User entity
- Frontend ProfilePage: hiển thị thêm fullName, phone, tier, loyaltyPoints; cho edit

### 2.3 Session revocation

**AuthController.java**: thêm logic trong `changePassword()`
- `LoginSessionRepository.deleteByUserId(userId)` — xóa tất cả session cũ

---

## PHASE 3: SERVICES MODULE — Thêm search + fix UC numbering

### 3.1 Thêm keyword search cho 3 Controllers

| Controller | Thêm param | Repository method |
|-----------|-----------|------------------|
| ProductController | `@RequestParam keyword` | `findByNameContainingIgnoreCase(keyword)` |
| ProviderController | `@RequestParam keyword` | `findByNameContainingIgnoreCase(keyword)` |
| FacilityController | `@RequestParam keyword` | `findByNameContainingIgnoreCase(keyword)` |

### 3.2 UC numbering trong Swagger annotations

| Controller | Hiện tại | Đúng |
|-----------|---------|------|
| OrderController | UC08 | UC06 |
| DamageReportController | UC09 | UC10 |
| ImportController | UC11 | UC12 |

---

## PHASE 4: CORE MODULE — Thêm fields thiếu

### 4.1 Entity fields

| File | Thêm field | Lý do |
|------|-----------|-------|
| `RoomType.java` | `String moTa` | Test data có "Phòng phổ thông" |
| `MembershipTier.java` | `Integer diemThuongNhan` | Test data có bonus multiplier |

### 4.2 ChamCong status value

**HRControllers.java**: đổi `"ChoChamCong"` → `"Pending"` trong ShiftController auto-create

---

## PHASE 5: TÀI LIỆU — Cập nhật khớp code

### 5.1 Account doc
- User: thêm `username`, `active`; đổi role thành 5 giá trị enum
- Client: đổi `tblUser` → `tblMember`; thêm `salutation`, `firstName`, `lastName`, `accountStatus`; bỏ single-table inheritance
- Employee: đổi `tblUser` → `tblEmployee`; thêm `dob`, `tel`, `email`, `username`, `password`, `active`
- MembershipTier: đổi PK `id:int` → `tierName:String`; đổi `discountRate` → String
- LoginSession: thêm `trangThai`

### 5.2 Booking doc
- Thêm Booking entity vào section 2.2
- Client: đổi `tblClient` → `tblMember`
- MemberRanking → MembershipTier
- BookingStatus: thêm `PENDING`, `COMPLETED`
- Room: thêm `RoomType` entity reference; đổi `hourly_pricing` → `price`

### 5.3 Services doc
- Đổi tên class underscore → PascalCase
- OrderStatus: đổi `Served` → `SERVED`
- DamageDetail: đổi FK `room_receipt_id` → `damage_report_id`

### 5.4 Core doc
- Client: đổi `Customer` → `Client`, `tblCustomer` → `tblMember`
- MembershipTier: đổi PK `id:int` → `tierName:String`

### 5.5 HR doc
- CaLamViec: đổi `tblShift` → `tbl_ca_lam_viec`; fields EN → VN
- ChamCong: đổi `tblTimekeeping` → `tbl_cham_cong`; fields EN → VN
- DanhGia: đổi `tblEvaluation` → `tbl_danh_gia`; class → `DanhGia`
- QuyetDinh: đổi FK `DanhGiaNhanVien` → `Employee`

---

## Files to modify

### Backend Java
1. `domain/Client.java` — thêm email
2. `domain/LoginSession.java` — thêm trangThai
3. `domain/RoomType.java` — thêm moTa
4. `domain/MembershipTier.java` — thêm diemThuongNhan
5. `web/AuthController.java` — thêm profile update + session revocation
6. `web/CrudControllers.java` — keyword search cho Product, Provider, Facility
7. `web/HRControllers.java` — "ChoChamCong" → "Pending"
8. `web/OrderController.java` — fix UC numbering annotation
9. `web/DamageReportController.java` — fix UC numbering annotation
10. `web/ImportController.java` — fix UC numbering annotation
11. `repository/ProductRepository.java` — thêm findByKeyword
12. `repository/ProviderRepository.java` — thêm findByKeyword
13. `repository/FacilityRepository.java` — thêm findByKeyword

### Frontend
14. `pages/BookingPage.tsx` — tách 3 bước wizard
15. `pages/BookingManagement.tsx` — thêm getActiveRoom section
16. `pages/ProfilePage.tsx` — hiển thị thêm fields, cho edit

### Tài liệu (5 files)
17. `exports/account/tài-khoản-va-thành-viên.md`
18. `exports/booking/quản-lý-đặt-va-trả-phòng.md`
19. `exports/services/dịch-vụ-va-sản-phẩm.md`
20. `exports/core/quản-trị-cốt-lõi.md`
21. `exports/hr/nhân-sự-va-báo-cáo-thống-kê.md`

---

## Verification

```bash
cd backend && ./mvnw clean test   # Expect: all pass
cd frontend && npx tsc --noEmit   # Expect: 0 errors
```
