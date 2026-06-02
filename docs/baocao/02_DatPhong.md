# Module 2: Quản lý Đặt & Trả Phòng
> UC05 (Đặt phòng + Hủy phòng) · UC07 (Check-in) · UC08 (Check-out)

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

4 chức năng, nhưng chỉ 3 UC chính (Hủy phòng là extend của UC05):

| UC | Tên | Actor chính |
|----|-----|-------------|
| UC05 | Đặt phòng | Khách hàng (trực tuyến) / NV Lễ tân (tại quầy) |
| UC05 ext | Hủy phòng trực tuyến | Khách hàng + NV Lễ tân |
| UC07 | Quản lý đặt phòng (check-in) | NV Lễ tân |
| UC08 | Quản lý trả phòng (check-out) | NV Lễ tân |

### Q2. Luồng đặt phòng tại quầy (NV Lễ tân) — các bước chính.

```
NV click "Đặt phòng" → SearchFreeRoomView hiện lên
→ NV hỏi khách thời gian, nhập vào ô và ấn Tìm
→ Room.searchFreeRoom() → danh sách phòng trống hiện
→ NV ấn chọn phòng → SearchClientView hiện
→ NV hỏi thông tin khách, ấn Tìm → Client.searchClient()
→ NV chọn khách → ConfirmView hiện (thông tin đặt phòng)
→ NV ấn Xác nhận → Room.changeStatus("Chờ nhận")
→ Hệ thống lưu xong, thông báo thành công
```

### Q3. State machine của Room và Room_receipt.

**Room status:**
```
Trống → (đặt phòng) → Chờ nhận → (check-in) → Đang hoạt động → (check-out) → Trống
Chờ nhận → (hủy) → Trống
```

**Room_receipt (hóa đơn) status:**
```
(tạo khi check-in) → Đang mở → (check-out xác nhận) → Đã thanh toán
                                (hủy) → Đã hủy
```

---

## PHA II — PHÂN TÍCH

### Q4. II.2 — Các lớp thực thể của module Đặt phòng.

Từ đoạn văn xuôi mô tả module:

| Lớp thực thể | Tên | Thuộc tính sơ bộ |
|--------------|-----|-----------------|
| Khách hàng | **Client** | hoTen, sdt, email, hangHoiVien, diemTichLuy |
| Chi nhánh | **Branch** | tenChiNhanh, diaChi, sdt |
| Phòng | **Room** | tenPhong, loaiPhong, sucChua, giaTheoGio, trangThai |
| Nhân viên | **Employee** | hoTen, vaiTro, chiNhanh |
| Hóa đơn | **Room_receipt** | ngayGio, tienPhong, tienDichVu, tongCong, phuongThucTT, trangThai |
| Chi tiết HĐ | **Room_receipt_detail** | tenMon, soLuong, donGia, thanhTien |
| Hạng hội viên | **MemberRanking** | tenHang, diemToiThieu, tyLeGiam |
| Khuyến mãi | **Promotion** | maKM, moTa, tyLeGiam, ngayHetHan |

### Q5. II.2 — Cardinality đặc biệt: quan hệ n-n nào xuất hiện?

- Room_receipt – Promotion: **n-n** (1 HĐ có thể áp nhiều KM, 1 KM dùng cho nhiều HĐ) → bảng trung gian **ApplyPromotion**
- Room_receipt – Room_receipt_detail: **1-n** (1 HĐ có nhiều chi tiết)

Quan hệ khác:
- Branch – Room: 1-n (composition: xóa chi nhánh → xóa phòng)
- Branch – Employee: 1-n (aggregation: nhân viên có thể chuyển chi nhánh)
- Client – Room_receipt: 1-n

### Q6. II.3 — Sơ đồ lớp phân tích BCE.

```
Boundary: ReceptionistHomeView, SearchFreeRoomView, SearchClientView, ConfirmView,
          CheckInView, ConfirmCheckInView, CheckOutView, InvoiceView, PaymentView,
          SearchBookingView, ConfirmCancelView
Control:  BookingController (ngầm hiểu)
Entity:   Client, Branch, Room, Employee, Room_receipt, Room_receipt_detail,
          MemberRanking, Promotion
```

### Q7. II.4 — Kịch bản phiên bản 2 UC07 Check-in.

```
1.  NV click "Check-in" trên ReceptionistHomeView
2.  CheckInView hiển thị
3.  CheckInView gọi Room.searchBooking() lấy danh sách "Chờ nhận"
4.  CheckInView gọi Client.searchClient() lấy thông tin khách
5.  CheckInView hiển thị danh sách booking chờ nhận
6.  NV hỏi khách thông tin để đối chiếu
7.  NV ấn chọn booking tương ứng
8.  ConfirmCheckInView hiển thị thông tin chi tiết
9.  NV ấn xác nhận check-in
10. ConfirmCheckInView gọi Room.changeStatus("Đang hoạt động")
11. ConfirmCheckInView gọi Room_receipt.startTimer() (ghi thời gian bắt đầu)
12. Thông báo thành công, NV ấn quay lại
13. Quay về ReceptionistHomeView
```

### Q8. II.4 — Kịch bản phiên bản 2 UC08 Check-out (luồng chính).

```
1.  NV click "Check-out" → CheckOutView hiển thị danh sách phòng "Đang hoạt động"
2.  NV hỏi khách số phòng, chọn phòng → InvoiceView
3.  InvoiceView gọi Room_receipt.CalculateTotalAmount() (tính tiền phòng + dịch vụ)
4.  InvoiceView gọi MemberRanking.checkMember() (kiểm tra hạng → giảm giá)
5.  InvoiceView hiển thị chi tiết hóa đơn
6.  Khách cung cấp mã ưu đãi (nếu có) → Promotion.applyPromotion()
7.  Room_receipt.CalculateTotalAmount() tính lại → InvoiceView cập nhật
8.  NV chọn phương thức TT → PaymentView
9.  Room_receipt.updateStatus("Đã thanh toán")
10. Room.changeStatus("Trống")
11. MemberRanking.addPoints() (cộng điểm tích lũy)
12. Thông báo thành công, in hóa đơn, quay về ReceptionistHomeView
```

---

## PHA III — THIẾT KẾ

### Q9. III.1 — Bảng CSDL module Đặt phòng.

| Bảng | Entity | Ghi chú |
|------|--------|---------|
| tblClient | Client | FK tblMemberRankingMa |
| tblBranch | Branch | |
| tblRoom | Room | FK tblBranchMa, tblRoomTypeMa |
| tblEmployee | Employee | FK tblBranchMa |
| tblRoom_receipt | Room_receipt (Invoice) | FK tblClientMa, tblRoomMa, tblEmployeeMa |
| tblRoom_receipt_detail | Room_receipt_detail | FK tblRoom_receiptMa |
| tblMemberRanking | MemberRanking | |
| tblPromotion | Promotion | |
| tblApply_promotion | n-n Room_receipt × Promotion | FK cả 2 |

### Q10. III.3.2 — Bảng chữ ký hàm BookingController.

| Hàm | Input | Output |
|-----|-------|--------|
| `searchFreeRoom()` | startTime: Date, endTime: Date, branchId: int | List\<Room\> |
| `searchClient()` | keyword: String | List\<Client\> |
| `createBooking()` | clientId, roomId, startTime, endTime, staffId: int | BookingResponse |
| `updateRoomStatus()` | roomId: int, status: String | Room |
| `getPendingBookings()` | branchId: int, date: Date | List\<BookingResponse\> |
| `checkIn()` | bookingId: int | BookingResponse |
| `getActiveRooms()` | branchId: int | List\<Room\> |
| `calculateInvoice()` | bookingId: int | Room_receipt |
| `applyPromotion()` | room_receipt_ID: int | Room_receipt |
| `confirmPayment()` | invoiceId: int, paymentMethod: String, voucherCode: String | Room_receipt |
| `searchBooking()` | keyword: String | List\<BookingResponse\> |
| `cancelBooking()` | bookingId: int | BookingResponse |

### Q11. III.4 — Kịch bản phiên bản 3 UC05 Đặt phòng (39 bước, điểm quan trọng).

Chuỗi gọi hàm chính:
```
ReceptionistHomePage.btnDatPhongClick()
→ SearchFreeRoomForm.btnSearchClick()
→ BookingController.searchFreeRoom(startTime: Date, endTime: Date, branchId: int): List<Room>
→ Room.findByTimeAndBranch(startTime, endTime, branchId): List<Room>
→ [hiển thị danh sách phòng trống]

→ SearchClientForm.btnSearchClick()
→ BookingController.searchClient(keyword: String): List<Client>
→ Client.findByKeyword(keyword): List<Client>

→ ConfirmBookingModal.btnConfirmClick()
→ BookingController.createBooking(clientId, roomId, startTime, endTime, staffId): BookingResponse
→ Room_receipt.updateStatus(roomId, "Chờ nhận")
→ [lưu booking, trả BookingResponse]
→ ConfirmBookingModal hiển thị "Đặt phòng thành công!"
```

### Q12. III.4 — Check-out: 3 Entity được cập nhật trong 1 transaction.

```java
BookingController.confirmPayment(room_receipt_ID, paymentMethod, voucherCode):
  → Room_receipt.updateStatus("Đã thanh toán")
  → Room.updateStatus("Trống")
  → Client.addPoints(base_score)   // cộng điểm tích lũy hội viên
```

3 update này phải atomic — nếu 1 fail thì rollback hết.

---

## PHA IV — KIỂM THỬ

### Q13. Danh sách test case module Đặt phòng.

| TC | Chức năng | Kịch bản |
|----|-----------|---------|
| TC01 | Đặt phòng | Phòng trống, khách tìm thấy → booking tạo thành công |
| TC02 | Đặt phòng | Không có phòng trống theo giờ yêu cầu → thông báo |
| TC03 | Đặt phòng | Khách chưa có trong CSDL → "Đăng ký nhanh" |
| TC04 | Đặt phòng | Đặt phòng trực tuyến (Khách hàng tự đặt) |
| TC05 | Check-in | Phòng trạng thái "Chờ nhận" → check-in thành công |
| TC06 | Check-in | Phòng đang dọn dẹp → không cho check-in |
| TC07 | Check-in | Check-in phòng Super VIP |
| TC08 | Check-out | Thanh toán tiền mặt, không voucher → thành công |
| TC09 | Check-out | Áp dụng voucher hợp lệ → giảm đúng số tiền |
| TC10 | Check-out | Khách hội viên Vàng → giảm đúng tỷ lệ |
| TC11 | Check-out | Voucher không hợp lệ → thông báo lỗi |
| TC12 | Check-out | Thanh toán chuyển khoản |
| TC13 | Hủy phòng | Tìm booking → hủy thành công → phòng về "Trống" |
| TC14 | Hủy phòng | Không tìm thấy booking → thông báo |
| TC15 | Hủy phòng | Booking đã quá thời hạn hủy → thông báo |

Tỷ lệ đạt: **15/15 = 100%**

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **Tên entity booking**: module dùng `Room_receipt` (tên trong code Java là `Booking` class khác) — hóa đơn phòng gắn với phiên sử dụng
- **CalculateTotalAmount**: tính = tiền phòng (giá/giờ × số giờ) + tiền dịch vụ (từ Room_receipt_detail) − giảm giá hạng HV − khuyến mãi
- **addPoints()**: gọi trên `MemberRanking`, không phải `Client` — MemberRanking chứa logic tính điểm
- **Booking Module không gán UC ID** trong tài liệu gốc — không có nhãn "UC05", "UC07", "UC08" trước heading chức năng

---

## DIAGRAM Q&A

### Q14. Biểu đồ UC (I.1) — cấu trúc và UC con.

4 biểu đồ UC chi tiết (1 biểu đồ/chức năng):
- **Đặt phòng**: Actor NV Lễ tân + Khách hàng → UC05; include "Tìm phòng trống", "Tìm thông tin khách hàng", "Xác nhận đặt phòng"
- **Hủy phòng**: extend từ UC05 (điều kiện: muốn hủy sau khi đặt)
- **Check-in**: Actor NV Lễ tân → UC07; include "Xem danh sách chờ nhận"
- **Check-out**: Actor NV Lễ tân → UC08; include "Tính hóa đơn", "Áp dụng khuyến mãi", "Xác nhận thanh toán"

### Q15. Biểu đồ thực thể (II.2) — bao nhiêu lớp, quan hệ đặc biệt.

8 lớp Entity: **Client, Branch, Room, Employee, Room_receipt, Room_receipt_detail, MemberRanking, Promotion**

Quan hệ đặc biệt:
```
Branch "1" *-- "n" Room : composition
Branch "1" o-- "n" Employee : aggregation
Client "1" -- "n" Room_receipt : association
Room "1" -- "n" Room_receipt : association
Room_receipt "1" *-- "n" Room_receipt_detail : composition
Room_receipt "n" -- "n" Promotion : n-n → ApplyPromotion
Client "n" o-- "1" MemberRanking : aggregation
```

### Q16. Biểu đồ lớp phân tích BCE (II.3) — nhiều Boundary nhất trong 5 module.

Module Đặt phòng có **11 Boundary class** (nhiều nhất) vì có nhiều màn hình phức tạp:

```
ReceptionistHomeView, SearchFreeRoomView, SearchClientView, ConfirmView
CheckInView, ConfirmCheckInView
CheckOutView, InvoiceView, PaymentView
SearchBookingView, ConfirmCancelView
```

Lý do nhiều: mỗi bước trong workflow đặt phòng cần 1 màn hình riêng (wizard-style UI).

### Q17. Biểu đồ tuần tự phân tích (II.4) — UC08 Check-out dài nhất.

UC08 Check-out có khoảng **35 bước** trong II.4 — dài nhất module vì:
- Tính tiền (Room_receipt.CalculateTotalAmount)
- Kiểm tra hạng thành viên (MemberRanking.checkMember)
- Áp dụng khuyến mãi nếu có (Promotion.applyPromotion)
- Tính lại tổng (CalculateTotalAmount lần 2)
- Xác nhận TT: Room_receipt.updateStatus + Room.changeStatus + MemberRanking.addPoints

3 Entity được gọi tuần tự trong bước thanh toán.

### Q18. Biểu đồ lớp thực thể (III.1) — điểm đặc biệt.

```
Room_receipt:
  id: int, checkInTime: Date, checkOutTime: Date
  roomTotal: double, serviceTotal: double
  discount: double, grandTotal: double
  paymentMethod: String, status: String
  client: Client, room: Room, employee: Employee

Room_receipt_detail:
  id: int, itemName: String, quantity: int
  unitPrice: double, subtotal: double
  receipt: Room_receipt  ← FK về cha (composition)
```

Bảng ApplyPromotion (bảng trung gian n-n):
```
ApplyPromotion:
  receipt: Room_receipt, promotion: Promotion
  discountApplied: double
```

### Q19. ERD (III.2) — các FK quan trọng.

```
tblRoom_receipt:
  tblClientMa FK → tblClient
  tblRoomMa FK → tblRoom
  tblEmployeeMa FK → tblEmployee

tblRoom_receipt_detail:
  tblRoom_receiptMa FK → tblRoom_receipt

tblApply_promotion:
  tblRoom_receiptMa FK → tblRoom_receipt
  tblPromotionMa FK → tblPromotion
```

### Q20. Biểu đồ lớp thiết kế MVC (III.3.2) — BookingController methods.

```
BookingController (@RestController):
  searchFreeRoom(startTime, endTime, branchId): List<Room>
  searchClient(keyword): List<Client>
  createBooking(clientId, roomId, startTime, endTime, staffId): BookingResponse
  updateRoomStatus(roomId, status): Room
  getPendingBookings(branchId, date): List<BookingResponse>
  checkIn(bookingId): BookingResponse
  getActiveRooms(branchId): List<Room>
  calculateInvoice(bookingId): Room_receipt
  applyPromotion(receiptId): Room_receipt
  confirmPayment(invoiceId, paymentMethod, voucherCode): Room_receipt
  searchBooking(keyword): List<BookingResponse>
  cancelBooking(bookingId): BookingResponse
```

### Q21. Biểu đồ tuần tự thiết kế (III.4) — UC08 Check-out: transaction cuối.

Chuỗi 3 Entity được cập nhật trong confirmPayment():
```
BookingController.confirmPayment(invoiceId, paymentMethod, voucherCode):
  1. Room_receipt.updateStatus("Đã thanh toán")
  2. Room.updateStatus("Trống")
  3. Client.addPoints(grandTotal / 10000)  // 10k = 1 điểm
```

@Transactional: nếu 1 trong 3 fail → rollback hết → phòng không bị "Trống" sai.
