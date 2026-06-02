# Module 4: Quản trị Cốt lõi
> UC16 (Quản lý chi nhánh) · UC17 (Quản lý KH) · UC18 (Quản lý hạng HV) · UC19 (Quản lý phòng hát)

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

4 UC chính, 2 actor:

| UC | Tên | Actor chính |
|----|-----|-------------|
| UC16 | Quản lý hệ thống chi nhánh | Chủ doanh nghiệp (Admin) |
| UC17 | Quản lý khách hàng toàn hệ thống | Admin |
| UC18 | Quản lý hạng hội viên | Admin |
| UC19 | Quản lý phòng hát | Admin (danh mục loại phòng) + QL chi nhánh (phòng vật lý) |

### Q2. UC19 có 2 luồng actor — giải thích sự phân chia.

- **Admin / Chủ doanh nghiệp**: Quản lý **danh mục loại phòng** (RoomType: VIP, Thường, Deluxe — giá chuẩn, sức chứa chuẩn, áp dụng toàn chuỗi)
- **Quản lý chi nhánh**: Quản lý **phòng vật lý tại chi nhánh** (tạo phòng P01, gán loại, gán chi nhánh, sức chứa thực tế, trạng thái hiện tại)

### Q3. Lỗi UC numbering trong tài liệu gốc của module này.

Tài liệu core dùng **"Use Case 16/17/18/19/20"** thay vì **"UC16/UC17/UC18/UC19"** — sai format so với chuẩn account và XÁC ĐỊNH YÊU CẦU.

Ngoài ra, core tự đặt "Use Case 20 = Quản lý phòng hát tại chi nhánh" — **xung đột** với UC20 = Quản lý tài khoản nhân viên (của module account). Cách sửa: gộp phòng vật lý vào UC19 (2 luồng actor), xóa "Use Case 20" trong core.

---

## PHA II — PHÂN TÍCH

### Q4. II.2 — Các lớp thực thể của module Quản trị cốt lõi.

| Lớp thực thể | Thuộc tính sơ bộ |
|--------------|-----------------|
| **Branch** | tenChiNhanh, diaChi, sdt, trangThai |
| **Customer** | hoTen, sdt, email, hangHoiVien, diemTichLuy |
| **MembershipTier** | tenHang, diemToiThieu, moTa, tyLeGiam |
| **RoomType** | tenLoai, sucChuaChuan, giaChung, trangThai |
| **Room** | tenPhong, sucChua, trangThai, chiNhanh, loaiPhong |
| **Booking** | (ngoại lai — tham chiếu để kiểm tra trước xóa phòng) |

Lưu ý: **Customer** trong core ≠ **Client** trong account — đây là sự không nhất quán naming xuyên module.

### Q5. II.2 — Cardinality giữa các thực thể core.

- Branch – Room: **1-n** (composition: xóa chi nhánh → xóa phòng thuộc chi nhánh)
- RoomType – Room: **1-n** (aggregation: loại phòng là danh mục, tồn tại độc lập)
- MembershipTier – Customer: **1-n** (aggregation: hạng là danh mục)
- Customer – Booking: **1-n** (ngoại lai, dùng để xem lịch sử)

### Q6. II.3 — Sơ đồ lớp phân tích BCE.

**UC16 (Chi nhánh):**
```
Boundary: AdminHomeView, BranchPage, BranchForm
Control:  BranchController
Entity:   Branch
```
**UC17 (Khách hàng):**
```
Boundary: CustomerPage, CustomerDetailPanel
Control:  CustomerController
Entity:   Customer, Booking
```
**UC18 (Hạng hội viên):**
```
Boundary: MembershipTierPage, MembershipTierForm, ManualUpgradeModal
Control:  MembershipTierController
Entity:   MembershipTier, Customer
```
**UC19 (Phòng hát):**
```
Boundary: RoomTypePage, RoomTypeForm (Admin)
          BranchManagerHomeView, RoomPage, RoomForm (QL chi nhánh)
Control:  RoomController
Entity:   RoomType, Room, Booking(check xóa)
```

### Q7. II.4 — Kịch bản phiên bản 2 UC16 Quản lý chi nhánh.

```
1.  Admin đăng nhập → AdminHomeView hiển thị
2.  Admin click "Quản lý chi nhánh" → BranchPage gọi Branch.searchBranch()
3.  BranchPage hiển thị danh sách chi nhánh
4.  Admin click "Thêm mới" → BranchForm hiển thị (ô Tên, Địa chỉ, SĐT)
5.  Admin nhập thông tin, ấn Lưu → Branch.addBranch()
6.  BranchForm quay lại BranchPage, gọi Branch.searchBranch() refresh
7.  BranchPage hiển thị danh sách mới
```

Ngoại lệ: tên chi nhánh trùng → thông báo lỗi.

### Q8. II.4 — Kịch bản phiên bản 2 UC17 Quản lý khách hàng.

```
1.  Admin click "Quản lý khách hàng" → CustomerPage hiển thị
2.  Admin nhập từ khóa, ấn Tìm → Customer.searchCustomer()
3.  CustomerPage hiển thị danh sách khách
4.  Admin click chọn 1 khách → CustomerDetailPanel
5.  CustomerDetailPanel gọi Customer.getCustomerDetails() (thông tin cá nhân)
6.  CustomerDetailPanel gọi Booking.getBookingHistory() (lịch sử sử dụng)
7.  CustomerDetailPanel hiển thị đầy đủ, có nút "Khóa tài khoản"
```

---

## PHA III — THIẾT KẾ

### Q9. III.2 — Bảng CSDL module Quản trị cốt lõi.

| Bảng | Entity | FK |
|------|--------|----|
| tblBranch | Branch | — |
| tblCustomer | Customer | tblMembershipTierMa |
| tblMembershipTier | MembershipTier | — |
| tblRoomType | RoomType | — |
| tblRoom | Room | tblBranchMa, tblRoomTypeMa |

Lưu ý: module này quản lý **master data** của hệ thống — các bảng được tham chiếu bởi nhiều module khác.

### Q10. III.3.2 — Bảng chữ ký hàm Controller.

| Hàm | Controller | Input | Output |
|-----|-----------|-------|--------|
| `searchBranch()` | BranchController | keyword: String | List\<Branch\> |
| `addBranch()` | BranchController | branch: Branch | Branch |
| `updateBranch()` | BranchController | branch: Branch | Branch |
| `deleteBranch()` | BranchController | id: int | boolean |
| `searchCustomer()` | CustomerController | keyword: String | List\<Customer\> |
| `getCustomerDetails()` | CustomerController | customerId: int | Customer |
| `lockAccount()` | CustomerController | customerId: int | boolean |
| `getAllTiers()` | MembershipTierController | — | List\<MembershipTier\> |
| `updateTier()` | MembershipTierController | tier: MembershipTier | MembershipTier |
| `manualUpgrade()` | MembershipTierController | customerId, tierId: int | Customer |
| `getAllRoomTypes()` | RoomController | — | List\<RoomType\> |
| `addRoomType()` | RoomController | roomType: RoomType | RoomType |
| `updateRoomType()` | RoomController | roomType: RoomType | RoomType |
| `deleteRoomType()` | RoomController | id: int | boolean |
| `getRoomsByBranch()` | RoomController | branchId: int | List\<Room\> |
| `addRoom()` | RoomController | room: Room | Room |
| `updateRoom()` | RoomController | room: Room | Room |
| `deleteRoom()` | RoomController | roomId: int | boolean |
| `checkActiveBooking()` | RoomController | roomId: int | boolean |

### Q11. III.3.1 — Màn hình ManualUpgradeModal (UC18 đặc biệt).

```
┌──────────────────────────────────────┐
│  Nâng hạng thủ công                  │
│                                      │
│  Tìm KH: [___________] [Tìm]        │
│  Khách: Nguyễn Văn A (Đồng, 250đ)   │
│                                      │
│  Hạng mới: [Bạc     ▼]              │
│                                      │
│  [Hủy]          [Xác nhận]          │
└──────────────────────────────────────┘
```

Admin có thể nâng hạng thủ công (bỏ qua ngưỡng điểm) — dùng cho trường hợp đặc biệt.

---

## PHA IV — KIỂM THỬ

### Q12. Các loại test case quan trọng module Core.

| Nhóm | Kịch bản |
|------|---------|
| **Chi nhánh** | Thêm chi nhánh mới → Branch lưu thành công |
| **Chi nhánh** | Tên chi nhánh trùng → thông báo lỗi |
| **Chi nhánh** | Xóa chi nhánh có phòng đang hoạt động → thông báo lỗi |
| **Khách hàng** | Tìm theo SĐT → kết quả đúng |
| **Khách hàng** | Khóa tài khoản → user không thể đăng nhập |
| **Hạng HV** | Sửa ngưỡng điểm hạng Bạc → áp dụng ngay |
| **Hạng HV** | Nâng hạng thủ công → Customer.tier cập nhật |
| **Loại phòng** | Thêm loại phòng mới → RoomType tạo thành công |
| **Loại phòng** | Xóa loại phòng đang có phòng vật lý → thông báo lỗi |
| **Phòng vật lý** | Thêm phòng → Room.branch + Room.roomType gán đúng |
| **Phòng vật lý** | Xóa phòng đang OCCUPIED → checkActiveBooking() → từ chối |

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **Module này quản lý master data**: Branch, RoomType, MembershipTier — các bảng này là "backbone" được FK bởi mọi module khác
- **Customer vs Client**: core gọi là `Customer`, account gọi là `Client` — cùng 1 thực thể nghiệp vụ, không nhất quán naming
- **UC19 = 2 luồng**: Admin quản lý loại phòng (catalogue), QL chi nhánh quản lý phòng vật lý (instance)
- **checkActiveBooking()**: bắt buộc gọi trước khi xóa phòng — nếu có booking CHECKED_IN → không cho xóa
- **getBookingHistory()**: UC17 gọi sang module Booking để lấy lịch sử — đây là cross-module dependency

---

## DIAGRAM Q&A

### Q13. Biểu đồ UC (I.1) — 5 biểu đồ UC chi tiết (lỗi UC numbering).

Tài liệu gốc gọi là "Use Case 16/17/18/19/20" (sai format, đúng là UC16-19):
- **UC16**: Admin → include "Tìm chi nhánh", "Thêm/Sửa/Xóa chi nhánh"
- **UC17**: Admin → include "Tìm khách hàng", "Xem chi tiết", "Xem lịch sử booking", extend "Khóa tài khoản"
- **UC18**: Admin → include "Xem danh sách hạng", "Sửa hạng"; extend "Nâng hạng thủ công"
- **UC19** (loại phòng — Admin): include "Xem danh mục", "Thêm/Sửa/Xóa loại phòng"
- **"UC20"** (phòng vật lý — QL chi nhánh): include "Xem phòng chi nhánh", "Thêm/Sửa/Xóa phòng"

### Q14. Biểu đồ thực thể (II.2) — lớp Booking là "ngoại lai".

6 lớp Entity: **Branch, Customer, MembershipTier, RoomType, Room, Booking(ngoại lai)**

```
Branch "1" *-- "n" Room : composition
RoomType "1" -- "n" Room : aggregation
MembershipTier "1" -- "n" Customer : aggregation
Customer "1" -- "n" Booking : association (ngoại lai)
Room "1" -- "n" Booking : association (ngoại lai)
```

Booking là "ngoại lai" vì thuộc module Đặt phòng — chỉ tham chiếu để `checkActiveBooking()` trước khi xóa phòng.

### Q15. Biểu đồ lớp phân tích BCE (II.3) — phân chia theo UC.

```
[UC16] AdminHomeView, BranchPage, BranchForm → BranchController → Branch
[UC17] CustomerPage, CustomerDetailPanel → CustomerController → Customer, Booking
[UC18] MembershipTierPage, MembershipTierForm, ManualUpgradeModal → MembershipTierController → MembershipTier, Customer
[UC19-admin] RoomTypePage, RoomTypeForm → RoomController → RoomType
[UC19-mgr] BranchManagerHomeView, RoomPage, RoomForm → RoomController → Room, RoomType, Booking
```

### Q16. Biểu đồ tuần tự phân tích (II.4) — UC17: cross-entity call.

Điểm đặc biệt UC17:
```
CustomerDetailPanel → Customer.getCustomerDetails() [thông tin cá nhân]
CustomerDetailPanel → Booking.getBookingHistory() [lịch sử sử dụng]
```

2 Entity khác nhau được gọi để hiển thị 1 màn hình → CustomerDetailPanel phải chờ cả 2.

### Q17. Biểu đồ lớp thực thể (III.1) — RoomType và Room.

```
RoomType:
  id: int, typeName: String, standardCapacity: int
  standardPrice: double, status: String

Room:
  id: int, name: String, capacity: int, status: String
  roomType: RoomType (aggregation ◇)
  branch: Branch (composition ◆ — xóa branch → xóa room)
```

Phân biệt: Branch ◆ Room (composition), nhưng RoomType ◇ Room (aggregation) — loại phòng tồn tại dù xóa phòng vật lý.

### Q18. ERD (III.2) — module Core là backbone.

```
tblBranch ← tblRoom (tblBranchMa FK)
tblRoomType ← tblRoom (tblRoomTypeMa FK)
tblMembershipTier ← tblCustomer (tblMembershipTierMa FK)
```

Các bảng tblBranch, tblRoomType, tblMembershipTier là **master tables** — được FK bởi nhiều module khác:
- tblRoom → tblBranch (module Core)
- tblRoom → tblBooking (module Booking)
- tblCustomer → tblMembershipTier (module Core + Account)

### Q19. Biểu đồ lớp thiết kế MVC (III.3.2) — 4 Controller riêng biệt.

Module Core có 4 Controller riêng (không gộp 1 file như CrudControllers.java):
```
BranchController: GET/POST/PUT/DELETE /api/branches
CustomerController: GET /api/customers, GET /api/customers/{id}
MembershipTierController: GET/PUT /api/tiers, POST /api/tiers/{id}/upgrade
RoomController: GET/POST/PUT/DELETE /api/rooms, GET /api/room-types
```

### Q20. Biểu đồ tuần tự thiết kế (III.4) — UC19 Xóa phòng: phải checkActiveBooking trước.

```
RoomPage.btnDeleteClick(roomId)
→ RoomController.deleteRoom(roomId: int): boolean
  → BookingRepository.checkActiveBooking(roomId): boolean
  [alt có booking active]
    → throw IllegalArgumentException("Phòng đang có khách, không thể xóa")
    → ApiExceptionHandler → 400 { message: "Phòng đang có khách" }
  [else]
    → RoomRepository.deleteById(roomId)
    → return true
```

Đây là **business rule enforcement**: không xóa phòng đang có Booking CHECKED_IN.
