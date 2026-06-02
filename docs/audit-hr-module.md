# DEEP AUDIT — Module HR (Nhân sự & Báo cáo thống kê)
> So sánh tài liệu `exports/hr/` ↔ codebase `../karaoke` (backend + frontend)
> Ngày audit: 03/06/2026

---

## TÓM TẮT KẾT QUẢ

| Tiêu chí | Kết quả |
|----------|---------|
| Entity code vs tài liệu | **5/5 entity có trong code** — nhưng nhiều field mismatch |
| Controller code vs tài liệu | **4/4 controller có** (Shift, Timekeeping, Evaluation, Decision) + ReportController |
| Frontend pages | **4/4 trang có** (EmployeeMgmt, BranchReport, ChainReport, CustomerInfo) |
| Routing | **Thiếu route `/customer-info`** trong ROLE_ROUTES cho ADMIN |
| Bug nghiêm trọng | **3 bug** (login security, ChamCong auto-create, field naming) |
| Thiếu sót | **6 items** (BaoCao entity, Duplicate prevention, Branch-scoped filtering, etc.) |

---

## 1. ENTITY AUDIT

### 1.1 Employee.java

**Tài liệu:** Entity Employee có `hoTen`, `soDienThoai`, `vaiTro`, `chiNhanh`, `trangThai`
**Code:** `fullName`, `dob`, `tel`, `email`, `role`, `status`, `username`, `password`, `branch`

| Field trong code | Có trong tài liệu? | Ghi chú |
|-----------------|---------------------|---------|
| `fullName` | ✅ (hoTen) | |
| `dob` | ❌ | Tài liệu không có ngày sinh |
| `tel` | ✅ (soDienThoai) | |
| `email` | ❌ | Tài liệu không có email cho NV |
| `role` | ✅ (vaiTro) | Enum `UserRole` |
| `status` | ✅ (trangThai) | Default "Working" |
| `username` | ❌ | Tài liệu không có username cho NV |
| `password` | ❌ | Tài liệu không có password cho NV |
| `branch` | ✅ (chiNhanh) | `@ManyToOne Branch` |
| `active` | ❌ | Không có trong tài liệu |

**🔴 BUG: `checkLogin()` chỉ check username, KHÔNG check password:**
```java
public boolean checkLogin(String username, String password) {
    return this.username != null && this.username.equals(username);
    // ↑ password parameter bị IGNORE hoàn toàn!
}
```
**Password lưu plain text** — không có BCrypt encode cho Employee. Không có security filter nào gọi `checkLogin()` — nó là dead code.

---

### 1.2 CaLamViec.java

**Tài liệu Entity:** `CaLamViec: loaiCa, ngay, gioVao, gioRa`
**Code:** `ngayLam`, `gioBatDau`, `gioKetThuc`, `loaiCa`, `employee`

| Field | Tài liệu | Ghi chú |
|-------|----------|---------|
| `ngayLam` | `ngay` | Khác tên |
| `gioBatDau` | `gioVao` | Khác tên |
| `gioKetThuc` | `gioRa` | Khác tên |
| `loaiCa` | ✅ | |
| `employee` | ❌ | Tài liệu không mention FK trực tiếp; trong code là `@ManyToOne Employee` |

---

### 1.3 ChamCong.java

**Tài liệu Entity:** `ChamCong: ngay, gioThucVao, gioThucRa, trangThai; FK CaLamViec`
**Code:** `gioVaoThuc`, `gioRaThuc`, `trangThai`, `caLamViec`

| Field | Tài liệu | Ghi chú |
|-------|----------|---------|
| `gioVaoThuc` | `gioThucVao` | Khác tên (đảo vị trí) |
| `gioRaThuc` | `gioThucRa` | Khác tên (đảo vị trí) |
| `trangThai` | ✅ | |
| `caLamViec` | ✅ | `@ManyToOne CaLamViec` |
| `ngay` | ❌ | Không có trong code (lấy từ caLamViec.ngayLam) |

---

### 1.4 DanhGia.java

**Tài liệu Entity:** `DanhGiaNhanVien: diemHieuSuat, nhanXet, kyDanhGia`
**Code:** `kyDanhGia`, `diem`, `nhanXet`, `ngayDanhGia`, `employee`

| Field | Tài liệu | Ghi chú |
|-------|----------|---------|
| `kyDanhGia` | ✅ | String (VD: "Tháng 5/2025") |
| `diem` | ✅ (diemHieuSuat) | `@Min(0) @Max(10)` |
| `nhanXet` | ✅ | |
| `ngayDanhGia` | ❌ | Tài liệu không mention ngày đánh giá |
| `employee` | ✅ | `@ManyToOne Employee` |

---

### 1.5 QuyetDinh.java

**Tài liệu Entity:** `QuyetDinh: loai (KhenThuong/KyLuat), lyDo, ngay`
**Code:** `loai`, `noiDung`, `ngayQuyetDinh`, `danhGia`

| Field | Tài liệu | Ghi chú |
|-------|----------|---------|
| `loai` | ✅ | String (không có enum) |
| `noiDung` | ✅ (lyDo) | Khác tên |
| `ngayQuyetDinh` | ✅ (ngay) | Khác tên |
| `danhGia` | ❌ | **Tài liệu gán QuyetDinh trực tiếp cho Employee**, code gán cho DanhGia |

**🔴 BUG kiến trúc:** `QuyetDinh.danhGia: DanhGia` (FK tbl_danh_gia) — bắt buộc phải có đánh giá trước khi tạo quyết định. Tài liệu nói quyết định gắn trực tiếp với nhân viên, không cần qua đánh giá.

---

## 2. CONTROLLER AUDIT

### 2.1 ShiftController — UC11 (Phân ca)

**Endpoint:** `POST /api/shifts`

**✅ Đúng:** Kiểm tra trùng ca trước khi lưu (`existsDuplicateShift()`)

**✅ Đúng:** Trùng ca → HTTP 409 CONFLICT

**⚠️ Không đúng:** Tài liệu nói "hệ thống khởi tạo bản ghi chấm công tương ứng với ca" khi phân ca thành công. Code **KHÔNG tự tạo ChamCong** — chỉ tạo CaLamViec rồi return.

**🔴 THIẾU:** Không có auto-create ChamCong khi tạo shift:

```java
// Code hiện tại — thiếu ChamCong auto-create:
CaLamViec shift = new CaLamViec();
// ... set fields ...
return repository.save(shift);  // ← ChamCong không được tạo!

// Theo tài liệu PHẢI:
return repository.save(shift);
// Auto-create ChamCong:
ChamCong cc = new ChamCong();
cc.setCaLamViec(shift);
cc.setTrangThai("ChoChamCong");  // trạng thái chờ
chamCongRepository.save(cc);
```

---

### 2.2 TimekeepingController — UC11 (Chấm công)

**Endpoint:** `POST /api/timekeeping`

**⚠️ Không đúng:** Không có logic so sánh giờ thực tế với giờ ca để tính trạng thái (DungGio/Muon/Vắng). Client phải tự gửi `trangThai`, server chỉ lưu.

**Theo tài liệu:** "Hệ thống hiển thị bảng chấm công (giờ vào, giờ ra, trạng thái đúng giờ/muộn/vắng)" — phải tự động tính.

---

### 2.3 EvaluationController — UC11 (Đánh giá)

**Endpoint:** `POST /api/evaluations`

**✅ Đúng:** `@Min(0) @Max(10)` validation trên điểm

**⚠️ Không đúng:** Tài liệu nói "Hệ thống kiểm tra chưa đến kỳ đánh giá → từ chối". Code không có logic kiểm tra kỳ đánh giá.

---

### 2.4 DecisionController — UC11 (Khen thưởng/Kỷ luật)

**Endpoint:** `POST /api/decisions`

**🔴 BUG:** Tạo quyết định yêu cầu `danhGiaId` (FK DanhGia) — nghĩa là phải có đánh giá trước. Nhưng theo tài liệu, quản lý có thể tạo quyết định khen thưởng/kỷ luật trực tiếp cho nhân viên mà không cần qua đánh giá.

---

### 2.5 ReportController — UC13 + UC21 (Báo cáo)

**Endpoint:** `GET /api/reports/summary`, `GET /api/reports/revenue`

**✅ Đúng:** Hỗ trợ `?branchId=`, `?from=`, `?to=` params cho UC13

**✅ Đúng:** `period` hỗ trợ: hourly, weekly, monthly, quarterly

**🔴 THIẾU:** Không có endpoint riêng cho UC21 (tổng hợp toàn chuỗi). UC21 hiện tại dùng frontend gọi loop `/api/reports/summary?branchId=...` cho từng chi nhánh — không có API aggregate server-side.

**🔴 THIẾU:** Không có BaoCao entity — báo cáo không lưu vào CSDL. Không có "export file" endpoint (hiện tại frontend tự sinh CSV client-side).

**🔴 THIẾU:** Không có Notifications endpoint riêng cho HR (hiện tại notifications chỉ check stock/order/room, không check HR events).

---

## 3. FRONTEND AUDIT

### 3.1 EmployeeManagement.tsx

**🔴 BUG: Field `phone` vs `tel`:**
```tsx
// Frontend:
setFormData({ name: '', role: 'Lễ tân', phone: '', ... });
// ...
setEmployees(data.map((e: any) => ({
  phone: e.phone,   // ← KHÔNG TỒN TẠI trong API response!
})));
```
Employee entity dùng field `tel`, nhưng frontend gọi `e.phone` → luôn hiển thị `undefined`.

**✅ Đúng:** CRUD nhân viên (Thêm/Sửa/Xóa) qua `/api/employees`

**⚠️ Không có:** Chấm công, Đánh giá, Khen thưởng/Kỷ luật — không có UI cho 3 sub-chức năng này trong `EmployeeManagement.tsx`

---

### 3.2 BranchReportPage.tsx (UC13)

**✅ Đúng:** Hiển thị doanh thu, công suất phòng, lượt khách, F&B

**✅ Đúng:** Bộ lọc kỳ (hourly/weekly/monthly) + date range

**✅ Đúng:** Xuất CSV + PDF (browser print)

**⚠️ Không có:** Biểu đồ doanh thu (Recharts AreaChart) — code import nhưng API revenue data format không khớp với component

---

### 3.3 ChainReportPage.tsx (UC21)

**✅ Đúng:** Loop từng chi nhánh → gọi `/api/reports/summary?branchId=...` → sort theo doanh thu

**✅ Đúng:** Bảng xếp hạng chi nhánh + xuất CSV

**⚠️ Không có:** So sánh biểu đồ (ComparisonPanel) — chỉ hiển thị bảng xếp hạng

---

### 3.4 CustomerInfoPage.tsx (UC14)

**✅ Đúng:** Tìm kiếm khách hàng + xem lịch sử hóa đơn

**✅ Đúng:** Hiển thị điểm tích lũy, hạng hội viên

**⚠️ Không có:** Filter theo chi nhánh — tìm kiếm toàn chuỗi (UC14 nói "khách hàng trong chi nhánh mình")

---

## 4. SECURITY AUDIT

### 4.1 RBAC (rbac.ts)

**✅ Đúng:** `BRANCH_MANAGER` có quyền truy cập: `/employees`, `/reports`, `/chain-report`, `/customer-info`

**🔴 LỖI:** Route `/customer-info` có trong `ROLE_ROUTES['BRANCH_MANAGER']` nhưng KHÔNG có trong `ROLE_ROUTES['ADMIN']`. Admin không thể truy cập `/customer-info`.

**✅ Đúng:** `ADMIN` dùng `'*'` (wildcard) nên vẫn truy cập được, nhưng nếu đổi sang explicit list sẽ miss.

### 4.2 Endpoint Security (SecurityConfig.java)

**🔴 LỖI:** Không có endpoint nào trong HR module bị restrict theo role. Tất cả `/api/shifts/**`, `/api/evaluations/**`, `/api/decisions/**` đều chỉ cần authenticated — bất kỳ user nào (kể cả CLIENT) cũng gọi được.

```java
// SecurityConfig hiện tại:
.requestMatchers("/api/reports/**").hasRole("ADMIN")  // ← chỉ reports bị restrict
// /api/shifts, /api/evaluations, /api/decisions → authenticated() (mọi role)
```

---

## 5. MISSING FEATURES (tài liệu có, code không có)

| Feature | Tài liệu | Code | Mức độ |
|---------|----------|------|--------|
| ChamCong auto-create khi phân ca | "Hệ thống khởi tạo bản ghi chấm công" | ❌ Không có | 🔴 Critical |
| Tính trạng thái DungGio/Muon/Vang | "tự động tính từ giờ thực tế" | ❌ Client tự gửi | 🟡 Medium |
| Kiểm tra kỳ đánh giá | "Chưa đến kỳ → từ chối" | ❌ Không có | 🟡 Medium |
| BaoCao entity (lưu báo cáo) | UC13: "lưu vào CSDL" | ❌ Không có | 🟡 Medium |
| Export server-side | "Hệ thống sinh file báo cáo" | Client-side CSV | 🟡 Medium |
| Filter theo chi nhánh (UC14) | "khách hàng trong chi nhánh mình" | Toàn chuỗi | 🟡 Medium |
| Notifications HR events | Stock/Order/Room only | Không có HR | 🟢 Low |

---

## 6. CODE QUALITY ISSUES

### 6.1 Naming inconsistency
- Code: `CaLamViec` → API: `/api/shifts` (tiếng Anh)
- Code: `DanhGia` → API: `/api/evaluations` (tiếng Anh)
- Code: `QuyetDinh` → API: `/api/decisions` (tiếng Anh)
- Frontend: `EmployeeManagement.tsx` (tiếng Anh) nhưng UI text tiếng Việt

### 6.2 No `@Column` annotation
Tất cả HR entities (`CaLamViec`, `ChamCong`, `DanhGia`, `QuyetDinh`) không có `@Column` annotation → tên cột trong DB sẽ là snake_case của field name Java. VD: `ngayLam` → `ngay_lam`, `gioBatDau` → `gio_bat_dau`.

### 6.3 CaLamViec duplicate check chỉ check `ngayLam` + `loaiCa`
```java
@Query("SELECT COUNT(c) > 0 FROM CaLamViec c WHERE c.employee.id = :employeeId AND c.ngayLam = :ngayLam AND c.loaiCa = :loaiCa")
```
Không check `gioBatDau` / `gioKetThuc` → NV có thể bị phân 2 ca sáng vào cùng ngày (nếu loaiCa khác nhau).

### 6.4 ChamCongRepository findByEmployee filter path dài
```java
findByCaLamViec_Employee_Branch_Id(String branchId)  // 4 levels deep
```
Hoạt động nhưng performance kém trên large dataset. Nên dùng custom @Query với JOIN.

---

## 7. ACTION ITEMS (ưu tiên sửa)

| # | Bug / Issue | Mức độ | Fix |
|---|-------------|--------|-----|
| 1 | ChamCong không auto-create khi tạo CaLamViec | 🔴 Critical | Thêm `chamCongRepo.save(new ChamCong(shift, null, null, "ChoChamCong"))` trong ShiftController.create() |
| 2 | Employee.checkLogin() bỏ qua password | 🔴 Critical | Xóa hàm này hoặc sửa lại check cả password (BCrypt) |
| 3 | Security: HR endpoints không restrict role | 🔴 Critical | Thêm `.requestMatchers("/api/shifts/**", "/api/evaluations/**", "/api/decisions/**").hasAnyRole("ADMIN", "BRANCH_MANAGER")` |
| 4 | Frontend phone vs tel mismatch | 🔴 Critical | Đổi `e.phone` → `e.tel` trong EmployeeManagement.tsx |
| 5 | QuyetDinh FK DanhGia thay vì Employee | 🟡 Medium | Đổi FK sang Employee (theo tài liệu) |
| 6 | Không có ChamCong auto-status | 🟡 Medium | Thêm logic tính DungGio/Muon trong TimekeepingController |
| 7 | Không có BaoCao entity cho UC13/UC21 | 🟡 Medium | Thêm `BaoCao` entity + endpoint lưu báo cáo |
| 8 | CustomerInfoPage không filter chi nhánh | 🟢 Low | Thêm `?branchId=` param cho UC14 |

---

## 8. MAP TÀI LIỆU ↔ CODE

### Backend

| Tài liệu | Code | Trạng thái |
|----------|------|-----------|
| Entity Employee | `domain/Employee.java` | ✅ Có, khác naming |
| Entity CaLamViec | `domain/CaLamViec.java` | ✅ Có |
| Entity ChamCong | `domain/ChamCong.java` | ✅ Có |
| Entity DanhGiaNhanVien | `domain/DanhGia.java` | ✅ Có (tên khác) |
| Entity QuyetDinh | `domain/QuyetDinh.java` | ✅ Có, FK khác |
| Entity BaoCao | ❌ | ❌ Không có |
| Controller StaffController | `web/HRControllers.java` (4 controllers) | ✅ Có |
| Controller ReportController | `web/ReportController.java` | ✅ Có |

### Frontend

| Tài liệu | Code | Trạng thái |
|----------|------|-----------|
| StaffManagementPage | `pages/EmployeeManagement.tsx` | ✅ Có |
| ShiftAssignForm | ❌ (inline trong EmployeeManagement) | ⚠️ Không tách riêng |
| EvaluationForm | ❌ | ❌ Không có UI |
| BranchReportPage | `pages/BranchReportPage.tsx` | ✅ Có |
| ChainReportPage | `pages/ChainReportPage.tsx` | ✅ Có |
| CustomerInfoPage | `pages/CustomerInfoPage.tsx` | ✅ Có |
| ReportChartPanel | ❌ (inline trong BranchReportPage) | ⚠️ Không tách riêng |
| ComparisonPanel | ❌ | ❌ Không có UI |
