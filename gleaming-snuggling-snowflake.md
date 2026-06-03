# PLAN: Audit Toàn diện 5 Modules — Codebase vs Tài liệu

## Context

Audit 5 modules phát hiện:
- **9 issues** cần fix trong code (thiếu endpoints, field, entity)
- **38 test cases** trong docs nhưng không có test tương ứng trong code (57% gaps)
- **25 test cases** đã covered (37%)

## Test Gap Summary (67 doc TCs vs codebase)

| Module | Doc TCs | Covered | Gaps | Coverage |
|--------|---------|---------|------|----------|
| Account (UC01-04, UC20) | 11 | 6 | 5 | 55% |
| Booking (UC05, UC07, UC08) | 15 | 3 | 12 | 20% |
| Services (UC06, UC10, UC12, UC15) | 10 | 5 | 5 | 50% |
| Core (UC16-19) | 22 | 9 | 13 | 41% |
| HR (UC11, UC13, UC14, UC21) | 9 | 0 | 9 | **0%** |
| **Total** | **67** | **25** | **38** | **37%** |

## Phân loại Issues

### A. THỰC SỰ CẦN FIX (code thiếu chức năng)

| # | Module | Issue | File cần sửa | Effort |
|---|--------|-------|-------------|--------|
| A1 | Booking | Thiếu `searchFreeRoom(startTime, endTime, branchId)` endpoint | BookingController.java | 30p |
| A2 | Services | Thiếu `searchProductByName(keyword)` endpoint | CrudControllers.java (ProductController) | 15p |
| A3 | Services | Thiếu `searchFacility(keyword)` endpoint | CrudControllers.java (FacilityController) | 15p |
| A4 | Services | Thiếu `searchProvider(keyword)` endpoint | CrudControllers.java (ProviderController) | 15p |
| A5 | Account | Thiếu `email` field trên Client entity | Client.java | 10p |
| A6 | Account | `MembershipTier.discountRate` là String → đổi BigDecimal | MembershipTier.java + CrudControllers.java | 20p |
| A7 | Account | Thiếu Profile endpoints cho UC04 | CrudControllers.java hoặc AuthController.java | 20p |
| A8 | Core | `RoomType` thiếu `description` field | RoomType.java | 10p |
| A9 | HR | Thiếu `searchCustomerInBranch(keyword, branchId)` cho UC14 | CrudControllers.java (ClientController) | 15p |

### B. ĐÃ CÓ TRONG CODE, KHÔNG CẦN FIX (docs dùng tên khác)

| # | Module | Issue | Lý do bỏ qua |
|---|--------|-------|-------------|
| B1 | All | Enum values EN vs VN | Frontend gửi EN strings, khớp code |
| B2 | All | "Customer" vs "Client" | API dùng `/api/clients`, frontend match |
| B3 | Booking | Room.price vs hourly_pricing | Frontend gửi `price`, khớp code |
| B4 | HR | CaLamViec field names VN | Frontend gửi VN, khớp code |
| B5 | Booking | CheckInPage vs RoomSession | Design choice — SPA khác desktop |
| B6 | All | Single-table inheritance | Architecture decision — 3 tables OK |
| B7 | Account | User.soLanSai/thoiGianKhoa | Account lockout = future feature |
| B8 | Account | OTPVerifyPage | OTP flow not implemented (demo mode) |
| B9 | Account | ChangePasswordPage | Dùng SettingsPage thay thế |
| B10 | Core | CustomerDetailPanel | CustomerInfoPage đã cover |
| B11 | Core | ManualUpgradeModal | MembershipPage đã có UI |
| B12 | HR | BaoCao entity | Reports computed on-the-fly |
| B13 | HR | exportFile endpoint | Client-side CSV export đã có |
| B14 | Services | Order.room FK redundant | Convenience field, không gây lỗi |
| B15 | Services | Facility.room FK | Docs không rõ ràng, giữ nguyên |

## Implementation Steps

### Step 1: Add missing search endpoints (A1-A4)

**BookingController.java** — thêm searchFreeRoom:
```java
@GetMapping("/search-free")
List<Room> searchFreeRoom(
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
    @RequestParam String branchId) {
    // Logic: tìm phòng AVAILABLE trong branch, không có booking trùng giờ
}
```

**CrudControllers.java** — thêm keyword search cho Product, Facility, Provider:
```java
// ProductController:
@GetMapping List<Product> list(@RequestParam(required = false) String keyword, ...)
// FacilityController:
@GetMapping List<Facility> list(@RequestParam(required = false) String keyword)
// ProviderController:
@GetMapping List<Provider> list(@RequestParam(required = false) String keyword)
```

### Step 2: Fix entity fields (A5-A8)

**Client.java**: thêm `private String email;`
**MembershipTier.java**: đổi `discountRate` từ String → BigDecimal
**RoomType.java**: thêm `private String description;`

### Step 3: Add profile endpoints (A7)

**AuthController.java** hoặc mới **ProfileController.java**:
```java
@GetMapping("/api/profile/{id}")
Client getProfile(@PathVariable String id)

@PutMapping("/api/profile/{id}")
Client updateProfile(@PathVariable String id, @RequestBody Client client)
```

### Step 4: Add branch-scoped customer search (A9)

**CrudControllers.java** ClientController:
```java
@GetMapping List<Client> list(
    @RequestParam(required = false) String keyword,
    @RequestParam(required = false) String branchId)
```

### Step 5: Update frontend to use new endpoints

- BookingPage: gọi `/api/bookings/search-free` thay vì filter client-side
- OrderPage: gọi `/api/products?keyword=` thay vì chỉ category
- DamageReportPage: gọi `/api/facilities?keyword=`
- ImportReceiptPage: gọi `/api/providers?keyword=`
- CustomerInfoPage: gọi `/api/clients?keyword=&branchId=`

### Step 6: Verify

```bash
cd backend && ./mvnw test   # Expect: 111+ pass
cd frontend && npx tsc --noEmit  # Expect: 0 errors
```

## Files to Modify

**Backend:**
1. `backend/src/main/java/com/karaoke/backend/domain/Client.java` — add email
2. `backend/src/main/java/com/karaoke/backend/domain/MembershipTier.java` — discountRate String→BigDecimal
3. `backend/src/main/java/com/karaoke/backend/domain/RoomType.java` — add description
4. `backend/src/main/java/com/karaoke/backend/web/BookingController.java` — add searchFreeRoom
5. `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` — add keyword search for Product/Facility/Provider/Client, add profile endpoints

**Frontend:**
6. `frontend/src/pages/BookingPage.tsx` — use searchFreeRoom endpoint
7. `frontend/src/pages/OrderPage.tsx` — use product keyword search
8. `frontend/src/pages/DamageReportPage.tsx` — use facility keyword search
9. `frontend/src/pages/ImportReceiptPage.tsx` — use provider keyword search
10. `frontend/src/pages/CustomerInfoPage.tsx` — use branchId filter

**Tests:**
11. `backend/src/test/java/com/karaoke/backend/web/MembershipControllerTest.java` — update for BigDecimal

## Test Gaps Detail (38 missing TCs)

### Module 1 — Account (5 gaps)
- TC03: Wrong pw 5x → lock account (need lockout logic + test)
- TC04: Register with OTP (OTP not implemented — skip)
- TC06: OTP wrong 3x → cancel (OTP not implemented — skip)
- TC09: Update profile success (need profile endpoint + test)
- TC10: Email duplicate (covered by register_duplicateEmail — OK)

### Module 2 — Booking (12 gaps)
- TC02: No available room → error
- TC04: Online booking (same as TC01 — skip)
- TC06: Room being cleaned → cannot check-in
- TC07: Check-in Super VIP (same as TC05 — skip)
- TC09: Check-out with voucher discount
- TC10: Check-out with Gold member discount
- TC11: Invalid voucher code
- TC12: Check-out bank transfer
- TC14: Booking not found
- TC15: Booking past cancel time

### Module 3 — Services (5 gaps)
- TC01: Room not found during order
- TC02: Product not found
- TC05: Facility not in DB
- TC07: Product not found in menu edit
- TC09: Provider not found

### Module 4 — Core (13 gaps)
- TC02: Branch duplicate name → error
- TC05: Delete branch with rooms → error
- TC06-08: Customer search/view history (need tests)
- TC09: Lock customer account (need test)
- TC12: Manual tier upgrade (need test)
- TC14: RoomType duplicate name → error
- TC17: Delete RoomType in use → error
- TC19: Room duplicate name → error
- TC22: Delete room with active booking → error

### Module 5 — HR (9 gaps — entire module untested)
- TC01: Assign shift success
- TC02: Duplicate shift detection
- TC03: Performance evaluation
- TC04: Branch report with data
- TC05: Invalid date range
- TC06-07: Customer search at branch
- TC08-09: Chain-wide report aggregation

## Implementation Steps (updated)

### Step 1-5: Fix code (same as above)

### Step 6: Write missing tests

Create new test files:
- `HRControllersTest.java` — TC01-TC03 (shifts, timekeeping, evaluation)
- `ReportControllerTest.java` — extend with TC04, TC05 (branch report, invalid date)
- `CustomerInfoControllerTest.java` — TC06-TC07 (customer search at branch)

Extend existing test files:
- `BookingControllerTest.java` — add TC02, TC06, TC09-TC12, TC14-TC15
- `CrudControllersTest.java` — add TC02, TC05, TC06-TC09, TC12, TC14, TC17, TC19, TC22
- `OrderControllerTest.java` — add TC01, TC02 (not-found paths)

### Step 7: Verify
```bash
cd backend && ./mvnw test   # Expect: 150+ pass (111 existing + ~40 new)
cd frontend && npx tsc --noEmit  # Expect: 0 errors
```

---

# PHẦN B — TRUY VẾT BÁO CÁO CHUẨN ↔ CODEBASE (đọc báo cáo → tìm trong code)

> Nguồn: `cnpm/exports/{account,booking,services,core,hr}`. Trạng thái: **KHỚP** (tên trùng) · **ĐỔI TÊN** (cùng chức năng, khác tên — kèm wrapper nếu cần) · **THIẾU** (phải thêm).
> Đường dẫn rút gọn: BE = `backend/src/main/java/com/karaoke/backend/`, FE = `frontend/src/pages/`.

## 1) Module ACCOUNT (UC01–04, UC20)
| Báo cáo (lớp.method) | Code (file:dòng) | Trạng thái |
|---|---|---|
| LoginPage / RegisterPage / ProfilePage | FE `LoginPage.tsx` / `RegisterPage.tsx` / `ProfilePage.tsx` | KHỚP |
| ChangePasswordPage | FE `SettingsPage.tsx` | ĐỔI TÊN |
| OTPVerifyPage | — | THIẾU (demo, bỏ qua) |
| StaffManagePage | FE `EmployeeManagement.tsx` | ĐỔI TÊN |
| AuthController.checkLogin() | BE `web/AuthController.java:104` login() | ĐỔI TÊN |
| AuthController.register() | BE `web/AuthController.java:60` | KHỚP |
| AuthController.changePassword() | BE `web/AuthController.java:114` | KHỚP |
| ProfileController.getProfile/updateProfile | — | THIẾU → **N3** |
| StaffController.* | BE `web/CrudControllers.java:316` EmployeeController | ĐỔI TÊN |
| Entity User | BE `domain/User.java:17` | KHỚP (thiếu `failedAttempts/lockUntil` → **N1**) |
| Entity Client | BE `domain/Client.java:17` | KHỚP (thiếu `email` → **N2**) |
| Entity Employee / MembershipTier | BE `domain/Employee.java:18` / `MembershipTier.java:15` | KHỚP |
| Entity OTP / LoginSession | BE `domain/Otp.java:19` / `LoginSession.java:19` | KHỚP |

## 2) Module BOOKING (UC05, UC06 hủy, UC07, UC08)
| Báo cáo | Code (file:dòng) | Trạng thái |
|---|---|---|
| ReceptionistHomePage | FE `ReceptionDashboard.tsx` | ĐỔI TÊN |
| SearchFreeRoomForm / SearchClientForm / ConfirmBookingModal | FE `BookingPage.tsx` | ĐỔI TÊN |
| CheckInPage / ConfirmCheckInView / CancelBookingPage | FE `BookingManagement.tsx`, `RoomSession.tsx` | ĐỔI TÊN |
| CheckOutPage / InvoicePanel | FE `CheckoutPage.tsx` | KHỚP / ĐỔI TÊN |
| BookingController.createBooking() | BE `web/BookingController.java:71` | KHỚP |
| BookingController.checkIn() | BE `web/BookingController.java:126` updateStatus | ĐỔI TÊN |
| BookingController.cancelBooking() | BE `web/BookingController.java:159` | KHỚP |
| BookingController.getPendingBookings()/getActiveRooms() | BE `web/BookingController.java:171` / `:177` | KHỚP |
| BookingController.searchFreeRoom() | — | THIẾU → **N4** (`/api/bookings/search-free`) |
| calculateInvoice() / applyPromotion() / confirmPayment() | BE `web/CrudControllers.java:449` generate / `:422` apply-promotion / `:382` pay | ĐỔI TÊN |
| Entity Room/Branch/Client/Employee | BE `domain/Room.java:22` / `Branch.java:19` / `Client.java:17` / `Employee.java:18` | KHỚP |
| Entity MemberRanking | BE `domain/MembershipTier.java:15` | ĐỔI TÊN |
| Entity Room_receipt / Room_receipt_detail | BE `domain/RoomReceipt.java:26` / `RoomReceiptDetail.java:20` | ĐỔI TÊN |
| Entity Promotion / Apply_Promotion | BE `domain/Promotion.java:17` / `ApplyPromotion.java:20` | KHỚP / ĐỔI TÊN |

## 3) Module SERVICES (UC06 order, UC09 damage, UC10/UC15 menu/kho)
| Báo cáo | Code (file:dòng) | Trạng thái |
|---|---|---|
| SearchRoomPage / CreateOrderPage / ConfirmOrderPage | FE `OrderPage.tsx` (+ `OrderManagement.tsx`) | ĐỔI TÊN |
| DamageReportPage / ConfirmReportPage | FE `DamageReportPage.tsx` | KHỚP / ĐỔI TÊN |
| MenuPage / EditMenuPage | FE `MenuManagement.tsx` | ĐỔI TÊN |
| WarehouseManagePage / SearchProviderPage / ImportReceiptPage | FE `InventoryPage.tsx` / `ProviderPage.tsx` / `ImportReceiptPage.tsx` | ĐỔI TÊN / KHỚP |
| LoginController.checkLogin() | BE `web/AuthController.java:104` | ĐỔI TÊN |
| RoomController.getActiveRooms()/searchRoomByName() | BE `web/BookingController.java:177` / `web/CrudControllers.java:223` | ĐỔI TÊN (search theo tên: lọc) |
| ProductController.getAllProducts() | BE `web/CrudControllers.java:273` | KHỚP |
| ProductController.searchProductByName() | — | THIẾU → **N5** |
| OrderController.saveOrder() | BE `web/OrderController.java:74` create | ĐỔI TÊN |
| FacilityController.getAllFacility() | BE `web/CrudControllers.java:590` | KHỚP |
| FacilityController.searchFacility() | — | THIẾU → **N5** |
| DamageReportController.saveDamageReport()/updateReceipt() | BE `web/DamageReportController.java:38` | KHỚP |
| ProviderController.getAllProviders() | BE `web/CrudControllers.java:630` | KHỚP |
| ProviderController.searchProvider() | — | THIẾU → **N5** |
| ImportController.saveImportReceipt()/updateProductStock() | BE `web/ImportController.java:37` | KHỚP |
| Entity Order/OrderDetail/Product/Facility/Provider/ImportReceipt/ImportDetail/DamageReport/DamageDetail | BE `domain/Order.java:24`, `OrderDetail.java:20`, `Product.java:18`, `Facility.java:17`, `Provider.java:15`, `ImportReceipt.java:22`, `ImportDetail.java:19`, `DamageReport.java:22`, `DamageDetail.java:19` | KHỚP |

## 4) Module CORE (UC16–20)
| Báo cáo | Code (file:dòng) | Trạng thái |
|---|---|---|
| AdminHomeView / BranchManagerHomeView | FE `ManagerDashboard.tsx` | ĐỔI TÊN |
| BranchPage / BranchForm | FE `BranchPage.tsx` | KHỚP / ĐỔI TÊN |
| CustomerPage / CustomerDetailPanel | FE `ClientPage.tsx` / `CustomerInfoPage.tsx` | ĐỔI TÊN |
| MembershipTierPage / MembershipTierForm / ManualUpgradeModal | FE `MembershipPage.tsx` | ĐỔI TÊN |
| RoomTypePage / RoomTypeForm | FE `RoomTypePage.tsx` | KHỚP / ĐỔI TÊN |
| RoomPage / RoomForm | FE `RoomManagement.tsx` | ĐỔI TÊN |
| BranchController.getAllBranches()/saveBranch()/deleteBranch() | BE `web/CrudControllers.java:75` / `:83`,`:92` / `:103` | KHỚP |
| CustomerController.searchCustomers()/getCustomerById()/lockAccount() | BE `web/CrudControllers.java:123` / `:129` / `:147` (ClientController) | ĐỔI TÊN |
| MembershipTierController.getAllTiers()/updateTier()/manualUpgrade() | BE `web/CrudControllers.java:508` / `:511` / `:529` (MembershipController) | ĐỔI TÊN |
| RoomTypeController.getAllRoomTypes()/saveRoomType()/deleteRoomType() | BE `web/CrudControllers.java:169` / `:177`,`:191` / `:198` | KHỚP |
| RoomController.getRoomsByBranch()/saveRoom()/deleteRoom() | BE `web/CrudControllers.java:223` / `:236`,`:239` / `:253` | KHỚP |
| Entity Branch/MembershipTier/RoomType/Room/Booking | BE `domain/Branch.java:19`, `MembershipTier.java:15`, `RoomType.java:16`, `Room.java:22`, `Booking.java:24` | KHỚP |
| Entity Customer | BE `domain/Client.java:17` | ĐỔI TÊN |

## 5) Module HR (UC11, UC13, UC14, UC21)
| Báo cáo | Code (file:dòng) | Trạng thái |
|---|---|---|
| LoginPage / StaffManagementPage / ShiftAssignForm / EvaluationForm | FE `LoginPage.tsx` / `EmployeeManagement.tsx` (tabs) | KHỚP / ĐỔI TÊN |
| BranchReportPage / ReportChartPanel | FE `BranchReportPage.tsx` (Recharts) | KHỚP |
| CustomerInfoPage / CustomerHistoryPanel | FE `CustomerInfoPage.tsx` | KHỚP |
| ChainReportPage / ComparisonPanel | FE `ChainReportPage.tsx` | KHỚP |
| LoginController.checkLogin() | BE `web/AuthController.java:104` | ĐỔI TÊN |
| NhanVienController.getStaffByBranch()/searchStaff() | BE `web/CrudControllers.java:321` EmployeeController.list(branchId) | ĐỔI TÊN → wrapper **NhanVienController** |
| CaLamViecController.checkDuplicate() | BE `web/HRControllers.java:68` existsDuplicateShift() | ĐỔI TÊN |
| CaLamViecController.assignShift() | BE `web/HRControllers.java:64` ShiftController.create() | ĐỔI TÊN → wrapper |
| DanhGiaController.saveEvaluation() | BE `web/HRControllers.java:174` EvaluationController.create() | ĐỔI TÊN → wrapper |
| QuyetDinhController.saveDecision() | BE `web/HRControllers.java:216` DecisionController.create() | ĐỔI TÊN → wrapper |
| BaoCaoController.createReport()/exportFile() | BE `web/ReportController.java:61` summary / `:125` revenue | ĐỔI TÊN → wrapper |
| KhachHangController.searchCustomer()/getHistory() | BE `web/CrudControllers.java:123` / `:367` (Client/RoomReceipt) | ĐỔI TÊN → wrapper |
| ChiNhanhController.getBranches() | BE `web/CrudControllers.java:75` | ĐỔI TÊN → wrapper |
| BaoCaoChuoiController.aggregateChain() | BE `web/ReportController.java:61` (FE loop) | ĐỔI TÊN → wrapper |
| Entity Employee/CaLamViec/ChamCong/QuyetDinh | BE `domain/Employee.java:18`, `CaLamViec.java:20`, `ChamCong.java:19`, `QuyetDinh.java:19` | KHỚP |
| Entity DanhGiaNhanVien | BE `domain/DanhGia.java:19` | ĐỔI TÊN |
| Entity ChiNhanh / KhachHang / HoaDon | BE `domain/Branch.java:19` / `Client.java:17` / `RoomReceipt.java:26` | ĐỔI TÊN |
| Entity BaoCao | — | THIẾU → **N7** (tạo `domain/BaoCao.java`) |

> **HR wrapper**: để đọc báo cáo HR (tên tiếng Việt) tra thẳng ra code, tạo các `@RestController/@Service` đúng tên báo cáo, delegate sang controller Anh đang chạy (xem Phần C).

---

# PHẦN C — HÀNH ĐỘNG CĂN CHỈNH ĐẠT 100% (N1–N12)
Xem bảng N1–N12 trong plan `sorted-whistling-puppy.md`. Tóm tắt thực thi:
- **N1** `User`+failedAttempts/lockUntil; **N2** `Client`+email; **N3** ProfileController.
- **N4** searchFreeRoom; **N5** keyword search Product/Facility/Provider; **N6** clients?branchId.
- **N7** entity BaoCao; **N8** RBAC `/api/employees` cho BRANCH_MANAGER; **N9/N10** report lọc branchId+from/to.
- **N11** seed (chi nhánh 2, ca/chấm công/đánh giá/quyết định, hóa đơn); **N12** FE gọi endpoint mới.
- **HR wrappers**: `NhanVienController`, `CaLamViecController`, `DanhGiaController`, `QuyetDinhController`, `BaoCaoController`, `KhachHangController`, `ChiNhanhController`, `BaoCaoChuoiController` (thin, delegate).

## Bổ sung từ plan follow-up `(1).md` (đã đối chiếu — gộp các mục bổ trợ)
- **N13** `LoginSession`+`trangThai` (TC07 "Đã thu hồi") + `changePassword()` thu hồi session cũ (`LoginSessionRepository.deleteByUser...`). | `domain/LoginSession.java`, `web/AuthController.java`
- **N14** `RoomType`+`moTa`(description), `MembershipTier`+`diemThuongNhan`(bonus multiplier) — nếu test-data báo cáo có. | `domain/RoomType.java`, `domain/MembershipTier.java`
- **N15** Sửa số UC trong Swagger annotation cho khớp danh sách UC chuẩn: OrderController **UC06**, DamageReportController **UC10**, ImportController **UC12**. | `web/OrderController.java`, `web/DamageReportController.java`, `web/ImportController.java`
- **N16** Đổi giá trị trạng thái chấm công auto-create `"ChoChamCong"` → `"Pending"` (khớp test-data). | `web/HRControllers.java:84`
- **N17 (TÙY CHỌN — cần người dùng quyết)** Hướng NGƯỢC của (1) PHASE 5: sửa **tài liệu** `exports/*.md` cho khớp code (đổi tên class/table trong báo cáo). ⚠️ Mâu thuẫn với mục tiêu "báo cáo chuẩn là gốc" — chỉ làm nếu chấp nhận chỉnh báo cáo (bidirectional). Mặc định: **KHÔNG** sửa tài liệu, giữ báo cáo làm gốc.

> Lưu ý: plan `(1).md` **bỏ sót** 3 lỗi thật đã kiểm chứng (RBAC 403 `/api/employees` — N8; report không lọc branchId/from-to — N9/N10; thiếu seed — N11). Plan của ta giữ các mục này.
