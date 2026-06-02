# DEEP AUDIT — Module Core (Quản trị Cốt lõi)
> So sánh tài liệu `exports/core/` ↔ codebase `../karaoke`
> Ngày audit: 03/06/2026

---

## TÓM TẮT KẾT QUẢ

| Tiêu chí | Kết quả |
|----------|---------|
| Entity code vs tài liệu | **5/5 entity có** — naming khác nhiều |
| Controller code vs tài liệu | **4 controller** (Branch, Client, RoomType, Room) trong CrudControllers.java |
| Frontend pages | **4/4 trang có** (BranchPage, CustomerPage, RoomTypePage, RoomManagement) |
| Thiếu xóa RoomType | ❌ Không check khi xóa loại phòng có phòng vật lý |
| Security | 🔴 HR endpoints không restrict role |
| Naming inconsistency | ⚠️ Nhiều field khác tài liệu |

---

## 1. ENTITY AUDIT

### 1.1 Branch.java

**Tài liệu:** `Branch: tenChiNhanh, diaChi, sdt, trangThai`
**Code:** `name`, `address`, `phone`, `active`, `rooms`

| Field code | Tài liệu | Khớp? |
|-----------|----------|-------|
| `name` | tenChiNhanh | ✅ |
| `address` | diaChi | ✅ |
| `phone` | sdt | ✅ |
| `active` | trangThai | ✅ |
| `rooms` | — | ❌ Tài liệu không mention (convenience getter) |

✅ Không có bug.

---

### 1.2 RoomType.java

**Tài liệu:** `RoomType: tenLoai, sucChuaChuan, giaChung, trangThai`
**Code:** `nameType`, `capacity`, `price`, `status`

| Field code | Tài liệu | Khớp? |
|-----------|----------|-------|
| `nameType` | tenLoai | ✅ |
| `capacity` | sucChuaChuan | ✅ |
| `price` | giaChung | ✅ |
| `status` | trangThai | ✅ (boolean, true=active) |

✅ Không có bug.

---

### 1.3 Room.java

**Tài liệu:** `Room: tenPhong, sucChua, trangThai, chiNhanh, loaiPhong`
**Code:** `id`, `name`, `roomType`, `capacity`, `price`, `status`, `branch`, `active`

| Field code | Tài liệu | Khớp? |
|-----------|----------|-------|
| `name` | tenPhong | ✅ |
| `capacity` | sucChua | ✅ |
| `status` | trangThai | ✅ (enum RoomStatus) |
| `branch` | chiNhanh | ✅ (`@ManyToOne Branch`) |
| `roomType` | loaiPhong | ✅ (`@ManyToOne RoomType`) |
| `price` | — | ❌ Tài liệu nói giá kế thừa từ RoomType, code lưu riêng |
| `active` | — | ❌ Không có trong tài liệu |

---

### 1.4 Client.java

**Tài liệu:** `Customer: hoTen, sdt, email, hangHoiVien, diemTichLuy`
**Code:** `fullName`, `phone`, `tier`, `loyaltyPoints`, `joinedAt`, `accountStatus`

| Field code | Tài liệu | Khớp? |
|-----------|----------|-------|
| `fullName` | hoTen | ✅ |
| `phone` | sdt | ✅ (unique) |
| `tier` | hangHoiVien | ✅ (String, không FK MembershipTier!) |
| `loyaltyPoints` | diemTichLuy | ✅ |
| `joinedAt` | — | ❌ Không có trong tài liệu |
| `accountStatus` | — | ❌ Không có trong tài liệu |

**⚠️ Không có FK sang MembershipTier!** Tài liệu nói Customer n-1 MembershipTier. Code dùng String `tier` thay vì `@ManyToOne MembershipTier`.

---

### 1.5 MembershipTier.java

**Tài liệu:** `MembershipTier: tenHang, diemToiThieu, moTa, tyLeGiam`
**Code:** `tierName` (PK), `minPoints`, `description`, `discountRate`

| Field code | Tài liệu | Khớp? |
|-----------|----------|-------|
| `tierName` (PK) | tenHang | ✅ |
| `minPoints` | diemToiThieu | ✅ |
| `description` | moTa | ✅ |
| `discountRate` | tyLeGiam | ✅ |

---

## 2. CONTROLLER AUDIT

### 2.1 BranchController — UC16

**Endpoint:** `CRUD /api/branches`

**✅ Đúng:** Không cho xóa chi nhánh còn phòng (`roomRepository.existsByBranchId(id)`)

**⚠️ Không đúng:** Không check tên chi nhánh trùng khi tạo/sửa — tài liệu nói "kiểm tra hợp lệ (tên không trùng)".

---

### 2.2 ClientController — UC17

**Endpoint:** `CRUD /api/clients` + `PATCH /api/clients/{id}/lock`

**✅ Đúng:** `searchByKeyword(keyword)` cho UC17 tìm kiếm

**✅ Đúng:** `lock()` toggle accountStatus cho UC17 khóa TK

**⚠️ Không đúng:** Không có `getBookingHistory()` endpoint — UC17 nói "xem lịch sử sử dụng"

---

### 2.3 RoomTypeController — UC19

**Endpoint:** `CRUD /api/room-types`

**🔴 THIẾU:** Không check khi xóa loại phòng có phòng vật lý đang dùng:

```java
// Code hiện tại — thiếu check:
void delete(@PathVariable String id) {
    repository.deleteById(id);  // ← Không kiểm tra!
}

// Theo tài liệu PHẢI:
void delete(@PathVariable String id) {
    if (roomRepository.existsByRoomTypeId(id)) {
        throw new ResponseStatusException(CONFLICT, "Loại phòng đang được sử dụng");
    }
    repository.deleteById(id);
}
```

---

### 2.4 RoomController — UC20*

**Endpoint:** `CRUD /api/rooms` + `PATCH /api/rooms/{id}/status`

**✅ Đúng:** Không cho xóa phòng có booking active (`bookingRepository.existsActiveByRoomId(id)`)

**⚠️ Không đúng:** Không filter phòng theo chi nhánh của QL chi nhánh đang đăng nhập. API trả tất cả phòng, frontend tự filter.

---

## 3. FRONTEND AUDIT

| Page | Route | UC | Trạng thái |
|------|-------|-----|-----------|
| `BranchPage.tsx` | `/branches` | UC16 | ✅ CRUD đầy đủ |
| `CustomerPage.tsx` | `/customers` | UC17 | ✅ Tìm kiếm + khóa TK |
| `RoomTypePage.tsx` | `/room-types` | UC19 | ✅ CRUD |
| `RoomManagement.tsx` | `/rooms` | UC20* | ✅ CRUD + status update |
| `MembershipPage.tsx` | `/membership` | UC18 | ✅ Cấu hình + thống kê |

---

## 4. MISSING FEATURES

| Feature | Tài liệu | Code | Mức độ |
|---------|----------|------|--------|
| Check trùng tên Branch | "tên không trùng" | ❌ | 🟡 Medium |
| Check trùng tên RoomType | "tên không trùng" | ❌ | 🟡 Medium |
| Check trùng tên Room trong CN | "tên phòng không trùng trong CN" | ❌ | 🟡 Medium |
| getBookingHistory() cho UC17 | "xem lịch sử sử dụng" | ❌ | 🟡 Medium |
| Kiểm tra khi xóa RoomType | "có CN nào dùng không?" | ❌ | 🟡 Medium |
| Filter phòng theo CN cho QL | "QL chỉ xem phòng CN mình" | ❌ | 🟢 Low |

---

## 5. CROSS-MODULE ISSUES

### 5.1 Client.tier là String, không phải FK MembershipTier

```java
// Code hiện tại:
private String tier;  // ← String "Vàng", "Bạc", "Kim cương"

// Tài liệu yêu cầu:
@ManyToOne
private MembershipTier membershipTier;  // ← FK tblMembershipTier
```

→ Không thể tự động áp dụng discountRate khi thanh toán. Không thể thay đổi ngưỡng điểm mà tự cập nhật hạng.

### 5.2 Room.price lưu riêng, không kế thừa từ RoomType

```java
// Code:
private BigDecimal price;  // ← lưu riêng cho mỗi phòng

// Tài liệu: giá kế thừa từ loại phòng
// → sửa giá loại phòng → tất cả phòng thuộc loại đó cập nhật
```

### 5.3 SecurityConfig

**🔴 LỖI:** Không có endpoint nào trong core module bị restrict theo role. Tất cả `/api/branches/**`, `/api/rooms/**`, `/api/room-types/**`, `/api/clients/**` đều chỉ cần authenticated.

Tài liệu nói UC16/UC17/UC18/UC19 chỉ Admin mới được làm, UC20 chỉ QL chi nhánh.
