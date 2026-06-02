# FIX PLAN — Chỉnh codebase theo audit Core + HR
> Ưu tiên từ cao → thấp. Mỗi fix có: file cần sửa, mô tả, effort ước tính.

---

## PHASE 1: FIX BUG NGHIÊM TRỌNG (🔴 Critical)

### Fix 1.1 — ChamCong auto-create khi phân ca
**File:** `backend/src/main/java/com/karaoke/backend/web/HRControllers.java` → `ShiftController.create()`
**Bug:** Tạo CaLamViec nhưng không tạo ChamCong tương ứng
**Fix:**
```java
// Thêm ChamCongRepository vào constructor ShiftController
private final ChamCongRepository chamCongRepository;

// Trong create(), sau repository.save(shift):
ChamCong cc = new ChamCong();
cc.setCaLamViec(shift);
cc.setTrangThai("ChoChamCong");
chamCongRepository.save(cc);
```
**Effort:** 15 phút

---

### Fix 1.2 — Employee.checkLogin() password bypass
**File:** `backend/src/main/java/com/karaoke/backend/domain/Employee.java`
**Bug:** `checkLogin()` chỉ check username, bỏ qua password
**Fix:** Xóa hàm `checkLogin()` — nó là dead code, không được gọi ở đâu. Employee dùng User entity để xác thực qua AuthController.
**Effort:** 5 phút

---

### Fix 1.3 — SecurityConfig: restrict HR + Core endpoints theo role
**File:** `backend/src/main/java/com/karaoke/backend/config/SecurityConfig.java`
**Bug:** HR/Core endpoints chỉ cần authenticated, CLIENT cũng gọi được
**Fix:**
```java
// Thêm sau .requestMatchers("/api/employees/**").hasRole("ADMIN"):
.requestMatchers("/api/shifts/**").hasAnyRole("ADMIN", "BRANCH_MANAGER")
.requestMatchers("/api/timekeeping/**").hasAnyRole("ADMIN", "BRANCH_MANAGER")
.requestMatchers("/api/evaluations/**").hasAnyRole("ADMIN", "BRANCH_MANAGER")
.requestMatchers("/api/decisions/**").hasAnyRole("ADMIN", "BRANCH_MANAGER")
.requestMatchers(HttpMethod.POST, "/api/branches/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/branches/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/branches/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.POST, "/api/room-types/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/room-types/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/room-types/**").hasRole("ADMIN")
```
**Effort:** 20 phút

---

### Fix 1.4 — Frontend phone vs tel mismatch
**File:** `frontend/src/pages/EmployeeManagement.tsx`
**Bug:** Đọc `e.phone` nhưng Employee entity dùng field `tel`
**Fix:** Đổi tất cả `e.phone` → `e.tel` trong map function
**Effort:** 10 phút

---

## PHASE 2: FIX TÍNH ĐÚNG ĐẮC (🟡 Medium)

### Fix 2.1 — RoomType.delete() check phòng vật lý đang dùng
**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` → `RoomTypeController.delete()`
**Fix:**
```java
// Inject RoomRepository vào RoomTypeController
private final RoomRepository roomRepository;

void delete(@PathVariable String id) {
    if (roomRepository.existsByRoomTypeId(id)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Loại phòng đang được sử dụng tại các chi nhánh, không thể xóa");
    }
    repository.deleteById(id);
}
```
**Cần thêm:** `boolean existsByRoomTypeId(String roomTypeId);` vào `RoomRepository`
**Effort:** 20 phút

---

### Fix 2.2 — Branch: check trùng tên khi tạo/sửa
**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java` → `BranchController`
**Fix:**
```java
// Thêm vào BranchRepository:
boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
boolean existsByNameIgnoreCase(String name);

// Trong BranchController.create():
if (repository.existsByNameIgnoreCase(branch.getName())) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên chi nhánh đã tồn tại");
}

// Trong BranchController.update():
if (repository.existsByNameIgnoreCaseAndIdNot(branch.getName(), id)) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên chi nhánh đã tồn tại");
}
```
**Effort:** 15 phút

---

### Fix 2.3 — QuyetDinh FK từ DanhGia → Employee
**File:** `backend/src/main/java/com/karaoke/backend/domain/QuyetDinh.java`
**Bug:** QuyetDinh FK DanhGia (bắt buộc có đánh giá trước). Tài liệu: QuyetDinh FK Employee trực tiếp.
**Fix:**
```java
// Thay vì:
@ManyToOne
private DanhGia danhGia;

// Thành:
@ManyToOne
private Employee employee;
```
**Cập nhật:** `DecisionController.create()` đổi từ `danhGiaId` → `employeeId`
**Cập nhật:** `QuyetDinhRepository` đổi `findByDanhGia_Id` → `findByEmployee_Id`
**Effort:** 30 phút

---

### Fix 2.4 — ChamCong auto-status (DungGio/Muon/Vang)
**File:** `backend/src/main/java/com/karaoke/backend/web/HRControllers.java` → `TimekeepingController.create()`
**Fix:**
```java
// Trong create(), sau khi set gioVaoThuc:
LocalTime gioVaoCa = shift.getGioBatDau();
LocalTime gioVaoThuc = request.getGioVaoThuc().toLocalTime();

if (request.getGioVaoThuc() == null) {
    cc.setTrangThai("Vang");
} else if (gioVaoThuc.isAfter(gioVaoCa.plusMinutes(15))) {
    cc.setTrangThai("Muon");
} else {
    cc.setTrangThai("DungGio");
}
```
**Effort:** 20 phút

---

### Fix 2.5 — CustomerInfoPage filter theo chi nhánh (UC14)
**File:** `frontend/src/pages/CustomerInfoPage.tsx`
**Fix:** Thêm `branchId` param vào search API call:
```tsx
const user = JSON.parse(localStorage.getItem('user') || '{}');
const branchParam = user.role === 'BRANCH_MANAGER' ? `&branchId=${user.branchId}` : '';
const res = await fetch(`/api/clients?keyword=${keyword}${branchParam}`, { headers });
```
**Backend:** Thêm `branchId` filter vào `ClientController.list()`
**Effort:** 30 phút

---

## PHASE 3: IMPROVEMENTS (🟢 Low)

### Fix 3.1 — BaoCao entity cho UC13/UC21
**File mới:** `backend/src/main/java/com/karaoke/backend/domain/BaoCao.java`
```java
@Entity @Table(name = "tblBaoCao")
public class BaoCao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne private Branch branch;
    private String kyBaoCao;  // "Tháng 5/2026"
    private BigDecimal tongDoanhThu;
    private Integer luotKhach;
    private LocalDate ngayTao;
}
```
**Repository:** `BaoCaoRepository extends JpaRepository<BaoCao, Long>`
**Controller:** Thêm `POST /api/reports/save` endpoint
**Effort:** 1 giờ

---

### Fix 3.2 — Server-side export (Excel/PDF)
**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`
**Fix:** Thêm `GET /api/reports/export?branchId=&from=&to=&format=csv` endpoint
**Effort:** 1 giờ

---

### Fix 3.3 — Notifications cho HR events
**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`
**Fix:** Thêm vào `notifications()`: check nhân viên nghỉ phép, ca trống không có NV
**Effort:** 30 phút

---

## THỨ TỰ THỰC HIỆN

```
Phase 1 (45 phút): 1.1 → 1.2 → 1.3 → 1.4
Phase 2 (2 giờ):   2.1 → 2.2 → 2.3 → 2.4 → 2.5
Phase 3 (2.5 giờ): 3.1 → 3.2 → 3.3
```

**Tổng effort ước tính:** ~5 giờ

---

## TESTING CHECKLIST

Sau mỗi fix, verify:

- [ ] 1.1: Tạo shift → ChamCong tự tạo trong DB
- [ ] 1.2: `checkLogin()` bị xóa, code compile OK
- [ ] 1.3: CLIENT gọi POST /api/shifts → 403 Forbidden
- [ ] 1.4: EmployeeManagement hiển thị đúng số điện thoại
- [ ] 2.1: Xóa loại phòng đang có phòng → 409 Conflict
- [ ] 2.2: Tạo chi nhánh trùng tên → 409 Conflict
- [ ] 2.3: Tạo quyết định trực tiếp cho NV (không cần đánh giá trước)
- [ ] 2.4: Chấm công → trạng thái tự tính (DungGio/Muon/Vang)
- [ ] 2.5: QL chi nhánh chỉ thấy khách hàng CN mình
- [ ] 3.1: Lưu báo cáo → tblBaoCao có dữ liệu
- [ ] 3.2: Export CSV server-side → file download
- [ ] 3.3: Notifications có cảnh báo HR
