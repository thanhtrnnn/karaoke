# FINAL AUDIT — Toàn hệ thống Karaoke Famtaoke
> So sánh codebase ↔ tài liệu ↔ cross-module consistency
> Ngày: 03/06/2026

---

## TÓM TẮT ĐIỂM SỐ

| Dimension | Score | Detail |
|-----------|-------|--------|
| Entity vs Docs | 7/10 | 10 CRITICAL mismatches, nhiều naming/type differences |
| API vs Docs | 8/10 | Thiếu OTP, session, lockout; dư DELETE client, promotions CRUD |
| Frontend vs Docs | 8/10 | 1 critical bug (duplicate /reports), 12 naming deviations |
| Cross-module | 6/10 | Client table name, tier FK, Employee-User link all inconsistent |
| Security | 4/10 | 50+ endpoints unrestricted; CLIENT can CRUD admin data |

---

## 1. CRITICAL ISSUES (phải biết khi vấn đáp)

### 1.1 Client: tblMember vs tblCustomer
- **Code:** `Client` → `tblMember`
- **Core docs:** `Customer` → `tblCustomer`
- **Account docs:** `Client` kế thừa `User` trong `tblUser` (single-table)
- **Thực tế:** 3 bảng riêng (`tblUser`, `tblMember`, `tblEmployee`) — không single-table
- **Cách trả lời:** "Chúng em dùng 3 bảng riêng để tối ưu query, không gộp single-table vì Client và Employee có nhiều thuộc tính riêng biệt"

### 1.2 Client.tier là String, không phải FK
- **Code:** `private String tier` — lưu "Vàng", "Bạc" dạng text
- **Docs:** FK `tblMembershipTierMa` → `MembershipTier`
- **Hậu quả:** Không enforce referential integrity, không query được discountRate từ tier
- **Đã fix:** Endpoint `PATCH /api/membership/clients/{id}/tier` (UC18 manual upgrade)

### 1.3 Employee không liên kết User
- **Code:** `Employee` có `username`, `password` riêng — không FK `User`
- **Docs (account):** `tblEmployee` có FK `tblUserMa` → `tblUser`
- **Hậu quả:** Login 2 hệ thống riêng biệt (User auth vs Employee auth)

### 1.4 Security: 50+ endpoints không restrict role
- Chỉ `/api/employees/**` và `/api/reports/**` bị `hasRole("ADMIN")`
- Còn lại: bất kỳ authenticated user (kể cả CLIENT) đều gọi được
- **Đã fix:** HR endpoints restrict trong fix-plan.md

### 1.5 Duplicate route `/reports` (App.tsx)
- Line 102: `<Route path="/reports" element={<ReportsPage />} />`
- Line 122: `<Route path="/reports" element={<BranchReportPage />} />`
- React Router render cái đầu → `BranchReportPage` (UC13) unreachable
- **Đã fix:** Đổi `/reports` → `/branch-report` cho BranchReportPage

---

## 2. ENTITY AUDIT SUMMARY

### Account Module (UC01-04, UC20)

| Entity | Table | Match? | Key Issues |
|--------|-------|--------|-----------|
| User | tblUser | ✅ | Thiếu soLanSai, thoiGianKhoa (lockout) |
| Client | tblMember | ❌ | Docs: tblCustomer. Thiếu email, FK tier |
| Employee | tblEmployee | ⚠️ | Thiếu FK tblUserMa. Field tel vs soDienThoai |
| MembershipTier | tblMembershipTier | ⚠️ | PK tierName(String) vs id(int). discountRate String vs double |
| OTP | tblOTP | ✅ | OK |
| LoginSession | tblLoginSession | ✅ | Thiếu trangThai |

### Booking Module (UC05-08)

| Entity | Table | Match? | Key Issues |
|--------|-------|--------|-----------|
| Booking | tblBooking | ✅ | OK |
| Room | tblRoom | ⚠️ | Field price vs hourly_pricing |
| RoomType | tblRoomType | ⚠️ | Field nameType vs tenLoai, status boolean vs String |
| Branch | tblBranch | ✅ | OK |
| RoomReceipt | tblRoomReceipt | ✅ | OK |
| RoomReceiptDetail | tblRoomReceiptDetail | ✅ | OK |
| Promotion | tblPromotion | ✅ | OK |
| ApplyPromotion | tblApplyPromotion | ✅ | OK |

### Services Module (UC06, UC10, UC12, UC15)

| Entity | Table | Match? | Key Issues |
|--------|-------|--------|-----------|
| Order | tblOrder | ✅ | OK |
| OrderDetail | tblOrderDetail | ✅ | OK |
| Product | tblProduct | ✅ | OK |
| Provider | tblProvider | ✅ | OK |
| ImportReceipt | tblImportReceipt | ✅ | Extra: maPhieu, trangThai |
| ImportDetail | tblImportDetail | ✅ | OK |
| Facility | tblFacility | ✅ | Extra: room FK |
| DamageReport | tblDamageReport | ✅ | Extra: maBaoCao, trangThai |
| DamageDetail | tblDamageDetail | ✅ | OK |

### Core Module (UC16-20)

| Entity | Table | Match? | Key Issues |
|--------|-------|--------|-----------|
| Branch | tblBranch | ✅ | OK |
| Client | tblMember | ❌ | Docs: tblCustomer |
| MembershipTier | tblMembershipTier | ⚠️ | PK type mismatch |
| RoomType | tblRoomType | ⚠️ | Thiếu moTa |
| Room | tblRoom | ⚠️ | price vs giaChung |

### HR Module (UC11, UC13, UC14, UC21)

| Entity | Table | Match? | Key Issues |
|--------|-------|--------|-----------|
| Employee | tblEmployee | ⚠️ | Field naming: tel, dob, email |
| CaLamViec | tbl_ca_lam_viec | ❌ | Docs: tblShift. Field VN vs EN |
| ChamCong | tbl_cham_cong | ❌ | Docs: tblTimekeeping |
| DanhGia | tbl_danh_gia | ❌ | Docs: tblEvaluation |
| QuyetDinh | tbl_quyet_dinh | ❌ | FK DanhGia vs Employee |
| BaoCao | — | ❌ | Không có trong code |

---

## 3. CROSS-MODULE ISSUES

| Issue | Module A | Module B | Mức độ |
|-------|----------|----------|--------|
| Client table: tblMember vs tblCustomer | Account | Core | 🔴 Critical |
| Client.tier String vs FK MembershipTier | Account | Core | 🔴 Critical |
| Employee không link User | Account | HR | 🔴 Critical |
| MembershipTier PK type | Account | Core | 🟡 Medium |
| Room.price vs RoomType.price | Booking | Core | 🟡 Medium |
| QuyetDinh FK DanhGia vs Employee | HR | — | 🟡 Medium |
| CaLamViec VN naming vs docs EN naming | HR | — | 🟡 Medium |
| ChamCong auto-create missing | HR | — | 🔴 Critical |

---

## 4. API ENDPOINTS AUDIT

### Thiếu trong code (docs có):

| Feature | UC | Mức độ |
|---------|-----|--------|
| OTP verification | UC02 | 🟡 Medium |
| Account lockout (5 lần sai) | UC01 | 🟡 Medium |
| Session management | UC01/03 | 🟡 Medium |
| Search bookings by keyword | UC05 | 🟢 Low |
| Manual tier upgrade | UC18 | ✅ Đã fix |
| Export Excel/PDF server-side | UC13/21 | 🟢 Low |

### Dư trong code (docs không có):

| Feature | Endpoint | Mức độ |
|---------|----------|--------|
| DELETE client | `DELETE /api/clients/{id}` | 🟡 Medium |
| Promotions CRUD | `CRUD /api/promotions` | 🟢 Low |
| SystemConfig CRUD | `GET/PUT /api/system-config` | 🟢 Low |
| Notifications | `GET /api/reports/notifications` | 🟢 Low |

---

## 5. FRONTEND AUDIT

### Routes

| Route | Component | UC | Status |
|-------|-----------|-----|--------|
| `/login` | LoginPage | UC01 | ✅ |
| `/register` | RegisterPage | UC02 | ✅ |
| `/booking` | BookingPage | UC05 | ✅ |
| `/booking-management` | BookingManagement | UC05 | ✅ |
| `/room-session/:id` | RoomSession | UC07 | ⚠️ Docs: CheckInPage |
| `/checkout` | CheckoutPage | UC08 | ✅ |
| `/orders` | OrderPage | UC06 | ✅ |
| `/order-management` | OrderManagement | UC06 | ✅ |
| `/menu` | MenuManagement | UC15 | ✅ |
| `/inventory` | InventoryPage | UC12 | ✅ |
| `/providers` | ProviderPage | UC12 | ✅ |
| `/import-receipts` | ImportReceiptPage | UC12 | ✅ |
| `/damage-reports` | DamageReportPage | UC10 | ✅ |
| `/customers` | ClientPage | UC17 | ⚠️ Docs: CustomerPage |
| `/customer-info` | CustomerInfoPage | UC14 | ✅ |
| `/membership` | MembershipPage | UC18 | ✅ (+manual upgrade) |
| `/employees` | EmployeeManagement | UC11/20 | ✅ |
| `/reports` | ReportsPage | UC13 | ✅ |
| `/branch-report` | BranchReportPage | UC13 | ✅ (đã fix duplicate) |
| `/chain-report` | ChainReportPage | UC21 | ✅ |
| `/branches` | BranchPage | UC16 | ✅ |
| `/room-types` | RoomTypePage | UC19 | ✅ |
| `/rooms` | RoomManagement | UC20 | ✅ |
| `/settings` | SettingsPage | UC03 | ⚠️ Docs: ChangePasswordView |
| `/profile` | ProfilePage | UC04 | ✅ |

### RBAC Issues

| Issue | Mức độ |
|-------|--------|
| SERVICE_STAFF thiếu `/damage-reports` (UC10) | 🟡 Medium |
| SERVICE_STAFF dư `/menu`, `/inventory` (UC15, UC12) | 🟢 Low |
| RECEPTIONIST dư `/orders` | 🟢 Low |

---

## 6. FIX STATUS

| # | Fix | Status |
|---|-----|--------|
| 1 | ChamCong auto-create | ❌ Chưa fix |
| 2 | Employee.checkLogin() password bypass | ❌ Chưa fix |
| 3 | SecurityConfig restrict HR endpoints | ❌ Chưa fix |
| 4 | Frontend phone vs tel mismatch | ❌ Chưa fix |
| 5 | RoomType.delete() check rooms | ❌ Chưa fix |
| 6 | Branch name duplicate check | ❌ Chưa fix |
| 7 | QuyetDinh FK Employee | ❌ Chưa fix |
| 8 | ChamCong auto-status | ❌ Chưa fix |
| 9 | CustomerInfoPage filter chi nhánh | ❌ Chưa fix |
| 10 | Duplicate route /reports | ✅ Đã fix |
| 11 | Manual tier upgrade endpoint | ✅ Đã fix |
| 12 | RBAC /branch-report | ✅ Đã fix |
