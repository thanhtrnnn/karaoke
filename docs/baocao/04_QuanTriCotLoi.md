# Module 4: Quản trị Cốt lõi
> UC16 (Quản lý chi nhánh) · UC17 (Quản lý KH) · UC18 (Quản lý hạng HV) · UC19 (Quản lý danh mục loại phòng) · UC20* (Quản lý phòng hát chi nhánh)

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

**5 UC**, 2 actor:

| UC (trong tài liệu) | Tên | Actor chính |
|---------------------|-----|-------------|
| UC16 | Quản lý hệ thống chi nhánh | Chủ doanh nghiệp (Admin) |
| UC17 | Quản lý khách hàng toàn hệ thống | Admin |
| UC18 | Quản lý hạng hội viên | Admin |
| UC19 | Quản lý danh mục loại phòng | Admin |
| UC20* | Quản lý phòng hát tại chi nhánh | Quản lý chi nhánh |

⚠️ **UC20 trong tài liệu core xung đột** với UC20 của tab XÁC ĐỊNH YÊU CẦU (= Quản lý tài khoản nhân viên, thuộc module account). Đây là lỗi đánh số.

### Q2. UC19 và UC20 trong core khác nhau thế nào?

| | UC19 | UC20 (trong core) |
|--|------|------------------|
| Tên | Quản lý danh mục **loại** phòng | Quản lý **phòng hát** tại chi nhánh |
| Actor | Admin (Chủ doanh nghiệp) | Quản lý chi nhánh |
| Phạm vi | Toàn chuỗi — chuẩn hóa loại phòng | 1 chi nhánh — phòng vật lý cụ thể |
| Thao tác | Thêm/sửa/xóa loại phòng (VIP, Thường, Deluxe, sức chứa chuẩn, giá chuẩn) | Thêm/sửa/xóa phòng P01, gán loại, đổi trạng thái |

### Q3. Lỗi UC numbering trong tài liệu gốc của module này.

Tài liệu core dùng **"Use Case 16/17/18/19/20"** thay vì **"UC16/UC17/UC18/UC19/UC20"** — sai format so với chuẩn account và XÁC ĐỊNH YÊU CẦU.

Xung đột UC20: Core gán "Use Case 20 = Quản lý phòng hát tại chi nhánh" nhưng XÁC ĐỊNH YÊU CẦU quy định UC20 = Quản lý tài khoản nhân viên (account). **Cách sửa đề xuất**: gộp UC19+UC20 của core thành UC19 duy nhất với 2 luồng actor (Admin quản lý danh mục, QL chi nhánh quản lý phòng vật lý).

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
**UC19 (Danh mục loại phòng — Admin):**
```
Boundary: RoomTypePage, RoomTypeForm
Control:  RoomController
Entity:   RoomType
```
**UC20* (Phòng hát tại chi nhánh — QL chi nhánh):**
```
Boundary: BranchManagerHomeView, RoomPage, RoomForm
Control:  RoomController
Entity:   Room, RoomType, Booking (kiểm tra trước xóa)
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

### Q8b. II.4 — Kịch bản phiên bản 2 UC20* Quản lý phòng hát tại chi nhánh.

```
1.  QL chi nhánh đăng nhập → BranchManagerHomeView, click "Quản lý phòng hát"
2.  RoomPage gọi Room.getRoomsByBranch() → danh sách phòng chi nhánh hiển thị
3.  QL chọn "Thêm mới" → RoomForm hiển thị
4.  QL nhập Tên = "VIP-02", chọn Loại phòng = "VIP" từ dropdown (lấy từ danh mục Admin đã tạo)
5.  QL nhấn Lưu → Room.addRoom()
    (Sức chứa và Giá tự động kế thừa từ RoomType)
6.  RoomPage hiển thị danh sách mới, thông báo "Thêm phòng thành công"
```
Ngoại lệ: tên phòng trùng trong cùng chi nhánh → thông báo lỗi, nhập lại.
Xóa phòng: trước khi xóa gọi Booking.checkActiveBooking() — nếu có booking đang hoạt động → từ chối.

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

**BranchController** (UC16):

| Hàm | Input | Output |
|-----|-------|--------|
| `searchBranch()` | keyword: String | List\<Branch\> |
| `addBranch()` | branch: Branch | Branch |
| `updateBranch()` | branch: Branch | Branch |
| `deleteBranch()` | id: int | boolean |

**CustomerController** (UC17):

| Hàm | Input | Output |
|-----|-------|--------|
| `searchCustomer()` | keyword: String | List\<Customer\> |
| `getCustomerDetails()` | customerId: int | Customer |
| `getBookingHistory()` | customerId: int | List\<Booking\> |
| `lockAccount()` | customerId: int | boolean |

**MembershipTierController** (UC18):

| Hàm | Input | Output |
|-----|-------|--------|
| `getAllTiers()` | — | List\<MembershipTier\> |
| `updateTier()` | tier: MembershipTier | MembershipTier |
| `manualUpgrade()` | customerId, tierId: int | Customer |

**RoomController** (UC19 + UC20*):

| Hàm | UC | Input | Output |
|-----|----|-------|--------|
| `getAllRoomTypes()` | UC19 | — | List\<RoomType\> |
| `addRoomType()` | UC19 | roomType: RoomType | RoomType |
| `updateRoomType()` | UC19 | roomType: RoomType | RoomType |
| `deleteRoomType()` | UC19 | id: int | boolean |
| `getRoomsByBranch()` | UC20 | branchId: int | List\<Room\> |
| `addRoom()` | UC20 | room: Room | Room |
| `updateRoom()` | UC20 | room: Room | Room |
| `deleteRoom()` | UC20 | roomId: int | boolean |
| `checkActiveBooking()` | UC20 | roomId: int | boolean |

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

| UC | Kịch bản |
|----|---------|
| **UC16** | Thêm chi nhánh mới → Branch lưu thành công |
| **UC16** | Tên chi nhánh trùng → thông báo "không thể trùng" |
| **UC16** | Xóa chi nhánh có phòng đang hoạt động → từ chối |
| **UC17** | Tìm KH theo SĐT → kết quả đúng toàn chuỗi |
| **UC17** | Xem lịch sử → hiển thị đúng Booking của KH |
| **UC17** | Khóa tài khoản → user không đăng nhập được |
| **UC18** | Sửa ngưỡng điểm hạng Bạc → áp dụng ngay cho toàn hệ thống |
| **UC18** | Nâng hạng thủ công → Customer.tier cập nhật đúng |
| **UC19** | Thêm loại phòng mới "Party" → RoomType tạo thành công |
| **UC19** | Xóa loại phòng đang có phòng vật lý → thông báo "đang được sử dụng" |
| **UC20*** | Thêm phòng VIP-02 → Room kế thừa sức chứa+giá từ RoomType |
| **UC20*** | Xóa phòng đang có booking CHECKED_IN → checkActiveBooking() → từ chối |

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **Module này có 5 UC** (UC16–UC20*), không phải 4 — dễ nhầm vì UC19+UC20 đều liên quan phòng
- **UC19 vs UC20**: UC19 = Admin quản lý **loại phòng chuẩn** (catalogue toàn chuỗi); UC20 = QL chi nhánh quản lý **phòng vật lý cụ thể** (instance từng chi nhánh)
- **UC20 xung đột master list**: tài liệu core gán UC20 = phòng hát, nhưng XÁC ĐỊNH YÊU CẦU gán UC20 = quản lý tài khoản NV — khi nào hỏi thì thừa nhận lỗi đánh số
- **Module này quản lý master data**: Branch, RoomType, MembershipTier — backbone của toàn hệ thống, bị FK bởi mọi module khác
- **Customer vs Client**: core gọi là `Customer`, account gọi là `Client` — cùng 1 entity, không nhất quán naming
- **checkActiveBooking()**: bắt buộc gọi trước khi xóa phòng — có booking CHECKED_IN → từ chối xóa
- **getBookingHistory()**: UC17 gọi sang module Booking để lấy lịch sử — cross-module dependency

---

## DIAGRAM Q&A

### Q13. Biểu đồ UC (I.1) — 5 biểu đồ UC chi tiết (lỗi UC numbering).

Tài liệu gốc gọi là "Use Case 16/17/18/19/20" (sai format, đúng phải là UCxx):

| UC (trong tài liệu) | Actor | UC con (Include) | UC con (Extend) |
|---------------------|-------|-----------------|----------------|
| UC16 | Admin | Thêm/Sửa/Xóa chi nhánh | — |
| UC17 | Admin | Tìm KH, Xem chi tiết, Xem lịch sử booking | Khóa tài khoản |
| UC18 | Admin | Xem/Sửa cấu hình hạng | Thay đổi hạng thủ công |
| UC19 | Admin | Thêm/Sửa/Xóa loại phòng | — |
| UC20* | QL chi nhánh | Thêm/Sửa/Xóa phòng vật lý | — |

⚠️ UC20 trong core **xung đột với master list** (XÁC ĐỊNH YÊU CẦU): UC20 = Quản lý tài khoản nhân viên (account).

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
