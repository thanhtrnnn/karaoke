# Module 5: Nhân sự & Báo cáo Thống kê
> UC11 (Quản lý NV) · UC13 (Báo cáo chi nhánh) · UC14 (Xem thông tin KH) · UC21 (Tổng hợp báo cáo)

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

4 UC, 2 actor:

| UC | Tên | Actor chính |
|----|-----|-------------|
| UC11 | Quản lý nhân viên chi nhánh | Quản lý chi nhánh |
| UC13 | Báo cáo số liệu chi nhánh | Quản lý chi nhánh |
| UC14 | Xem thông tin khách hàng chi nhánh | Quản lý chi nhánh |
| UC21 | Tổng hợp báo cáo toàn chuỗi | Chủ doanh nghiệp |

### Q2. UC13 và UC21 khác nhau như thế nào?

| | UC13 | UC21 |
|--|------|------|
| Actor | Quản lý chi nhánh | Chủ doanh nghiệp |
| Phạm vi | 1 chi nhánh mình quản lý | Toàn chuỗi (tất cả chi nhánh) |
| Nội dung | Doanh thu, lượt khách, order của chi nhánh | Tổng hợp, so sánh hiệu suất, xếp hạng chi nhánh |
| Giao diện | BranchReportPage, ReportChartPanel | ChainReportPage, ComparisonPanel |

### Q3. UC11 – Quản lý nhân viên bao gồm những chức năng gì?

- Xem danh sách nhân viên chi nhánh
- Phân ca làm việc (ShiftAssignForm) → CaLamViec
- Chấm công tự động khi phân ca → khởi tạo ChamCong
- Đánh giá hiệu suất (EvaluationForm) → DanhGiaNhanVien
- Khen thưởng / Kỷ luật → QuyetDinh

---

## PHA II — PHÂN TÍCH

### Q4. II.2 — Các lớp thực thể được trích từ văn xuôi.

| Lớp thực thể | Thuộc tính sơ bộ |
|--------------|-----------------|
| **Employee** | hoTen, vaiTro, chiNhanh, trangThai |
| **ChiNhanh** | tenChiNhanh, diaChi |
| **CaLamViec** | loaiCa, ngay, gioVao, gioRa |
| **ChamCong** | ngay, gioThucVao, gioThucRa, trangThai |
| **DanhGiaNhanVien** | diemHieuSuat, nhanXet, kyDanhGia |
| **QuyetDinh** | loai (KhenThuong/KyLuat), lyDo, ngay |
| **KhachHang** | hoTen, sdt, diemTichLuy, hangHoiVien |
| **HoaDon** | ngayTao, tongTien, trangThai |
| **BaoCao** | kyBaoCao, tongDoanhThu, luotKhach |

Lưu ý: `KhachHang` trong HR là actor gián tiếp — dữ liệu tra cứu trong UC14, không tương tác trực tiếp với module.

### Q5. II.2 — Cardinality chính.

- Employee – ChiNhanh: **n-1** (nhiều NV thuộc 1 chi nhánh)
- Employee – CaLamViec: **1-n** (1 NV có nhiều ca)
- CaLamViec – ChamCong: **1-1** (mỗi ca tạo 1 bản ghi chấm công)
- Employee – DanhGiaNhanVien: **1-n** (nhiều lần đánh giá)
- Employee – QuyetDinh: **1-n** (nhiều quyết định)
- HoaDon → BaoCao: aggregate (báo cáo tổng hợp dữ liệu từ nhiều hóa đơn)

### Q6. II.3 — Sơ đồ lớp phân tích BCE.

**UC11 (Quản lý NV):**
```
Boundary: LoginPage, StaffHomePage, StaffManagementPage, ShiftAssignForm, EvaluationForm
Control:  StaffController
Entity:   Employee, ChiNhanh, CaLamViec, ChamCong, DanhGiaNhanVien, QuyetDinh
```
**UC13 (Báo cáo chi nhánh):**
```
Boundary: BranchReportPage, ReportChartPanel
Control:  ReportController
Entity:   HoaDon, BaoCao
```
**UC14 (Xem thông tin KH):**
```
Boundary: CustomerInfoPage, CustomerHistoryPanel
Control:  CustomerController (tra cứu)
Entity:   KhachHang, HoaDon
```
**UC21 (Tổng hợp báo cáo):**
```
Boundary: AdminHomePage, ChainReportPage, ComparisonPanel
Control:  ReportController
Entity:   BaoCao, ChiNhanh
```

### Q7. II.4 — Kịch bản phiên bản 2 UC11 Quản lý nhân viên (Phân ca).

```
1.  QL đăng nhập → StaffHomePage
2.  QL click "Quản lý nhân viên" → StaffManagementPage gọi Employee.getStaffByBranch()
3.  StaffManagementPage hiển thị danh sách NV
4.  QL chọn NV, click "Phân ca" → ShiftAssignForm hiển thị
5.  QL chọn loại ca, ngày, giờ vào/ra → ShiftAssignForm gọi CaLamViec.checkDuplicate()
6.  CaLamViec trả về "không trùng"
7.  ShiftAssignForm gọi CaLamViec.assignShift() → đồng thời khởi tạo ChamCong
8.  Thông báo "Phân ca thành công", quay về StaffManagementPage
```

Ngoại lệ bước 6: NV đã có ca trùng giờ → thông báo lỗi, không lưu.

### Q8. II.4 — Kịch bản phiên bản 2 UC13 Báo cáo chi nhánh.

```
1.  QL click "Báo cáo số liệu" → BranchReportPage hiển thị
2.  QL chọn kỳ báo cáo (ngày/tuần/tháng) và ngày cụ thể, ấn Xem
3.  BranchReportPage gọi HoaDon.getRevenueByPeriod() → dữ liệu doanh thu
4.  BranchReportPage gọi BaoCao.createReport() → đối tượng báo cáo
5.  BranchReportPage hiển thị số liệu và gọi ReportChartPanel vẽ biểu đồ
6.  QL ấn "Xuất file" → BaoCao.exportFile() → tải về
```

---

## PHA III — THIẾT KẾ

### Q9. III.2 — Bảng CSDL module Nhân sự.

| Bảng | Entity | FK |
|------|--------|----|
| tblEmployee | Employee | tblChiNhanhMa |
| tblChiNhanh | ChiNhanh | — |
| tblCaLamViec | CaLamViec | tblEmployeeMa |
| tblChamCong | ChamCong | tblCaLamViecMa |
| tblDanhGiaNhanVien | DanhGiaNhanVien | tblEmployeeMa |
| tblQuyetDinh | QuyetDinh | tblEmployeeMa |
| tblBaoCao | BaoCao | tblChiNhanhMa |

Bảng `tblKhachHang` và `tblHoaDon` là của module khác — HR chỉ đọc (read-only), không ghi.

### Q10. III.3.2 — Bảng chữ ký hàm Controller.

| Hàm | Controller | Input | Output |
|-----|-----------|-------|--------|
| `getStaffByBranch()` | StaffController | branchId: int | List\<Employee\> |
| `checkDuplicate()` | StaffController | employeeId, date, startTime, endTime | boolean |
| `assignShift()` | StaffController | employeeId, date, shiftType, start, end | CaLamViec |
| `saveEvaluation()` | StaffController | employeeId, score, comment, period | DanhGiaNhanVien |
| `saveDecision()` | StaffController | employeeId, type, reason | QuyetDinh |
| `getRevenueReport()` | ReportController | branchId, startDate, endDate | BaoCao |
| `exportReport()` | ReportController | reportId: int | File |
| `getChainReport()` | ReportController | startDate, endDate | List\<BaoCao\> |
| `searchCustomer()` | CustomerController | keyword, branchId: int | List\<KhachHang\> |
| `getCustomerHistory()` | CustomerController | customerId: int | List\<HoaDon\> |

### Q11. III.3.1 — Màn hình BranchReportPage.

```
┌──────────────────────────────────────────────┐
│  Báo cáo số liệu chi nhánh — Quận 1         │
│                                              │
│  Kỳ: ( ) Ngày  (●) Tuần  ( ) Tháng          │
│  Từ: [30/05/2026]  Đến: [05/06/2026]        │
│  [Xem báo cáo]    [Xuất Excel]              │
│                                              │
│  Tổng doanh thu:  12.500.000đ               │
│  Lượt khách:      48                         │
│  Tổng order:      127 món                   │
│                                              │
│  [Biểu đồ doanh thu theo ngày — ReportChartPanel]
│                                              │
│  +----------+----------+----------+          │
│  | Ngày     | Doanh thu| Lượt KH  |          │
│  |----------|----------|----------|          │
│  | 30/05    | 1.800.000| 7        |          │
│  | 31/05    | 2.100.000| 9        |          │
│  +----------+----------+----------+          │
└──────────────────────────────────────────────┘
```

---

## PHA IV — KIỂM THỬ

### Q12. Các loại test case quan trọng module HR.

| Nhóm | Kịch bản |
|------|---------|
| **Phân ca** | NV chưa có ca → phân ca thành công |
| **Phân ca** | NV đã có ca trùng giờ → từ chối |
| **Chấm công** | Ca được phân → ChamCong tự tạo kèm |
| **Đánh giá** | Lưu đánh giá hiệu suất → DanhGiaNhanVien ghi nhận |
| **Khen thưởng** | Lưu quyết định khen → QuyetDinh loại = KHEN_THUONG |
| **Báo cáo CN** | Chọn kỳ tuần → dữ liệu đúng kỳ, biểu đồ hiển thị |
| **Báo cáo CN** | Xuất file → file Excel download |
| **Xem KH** | Tìm theo SĐT → kết quả đúng chi nhánh |
| **Tổng hợp** | Admin xem báo cáo toàn chuỗi → tất cả chi nhánh có trong bảng |
| **Tổng hợp** | Biểu đồ so sánh chi nhánh → ComparisonPanel hiển thị |

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **UC11 gồm 4 sub-chức năng**: phân ca, chấm công, đánh giá, khen thưởng/kỷ luật — không phải chỉ CRUD nhân viên
- **ChamCong tự động**: khi `assignShift()` → tự khởi tạo ChamCong (pending) cho ca đó
- **Module HR không ghi sang module khác**: UC14 chỉ READ tblKhachHang, UC13 chỉ READ tblHoaDon — không có FK ngược
- **Lỗi đã biết**: Pha III thiết kế giao diện HR bị nhầm "Quản lý order" và "Quản lý menu" thay cho UC14 — đây là copy-paste error, đúng phải là "c) Xem thông tin khách hàng chi nhánh (UC14)"
- **UC21 cross-module**: tổng hợp dữ liệu từ tất cả chi nhánh → cần `JOIN` hoặc aggregate query phức tạp
- **ReportChartPanel**: không phải Boundary độc lập mà là component được gọi bởi BranchReportPage và ChainReportPage

---

## DIAGRAM Q&A

### Q13. Biểu đồ UC (I.1) — 4 biểu đồ chi tiết.

- **UC11**: QL chi nhánh → include "Xem danh sách NV", "Phân ca", "Chấm công", "Đánh giá", "Khen thưởng/Kỷ luật"
- **UC13**: QL chi nhánh → include "Chọn kỳ", "Xem biểu đồ", "Xuất file"
- **UC14**: QL chi nhánh → include "Tìm khách hàng", "Xem lịch sử"; Actor gián tiếp: Khách hàng (dữ liệu, không tương tác)
- **UC21**: Chủ doanh nghiệp → include "Chọn kỳ", "Tổng hợp tất cả chi nhánh", "So sánh", "Xuất file"

### Q14. Biểu đồ thực thể (II.2) — 9 lớp, phân theo nhóm.

9 lớp Entity:

**Nhóm nhân sự**: Employee, ChiNhanh, CaLamViec, ChamCong, DanhGiaNhanVien, QuyetDinh
**Nhóm báo cáo**: HoaDon, BaoCao
**Nhóm KH (tra cứu)**: KhachHang

```
ChiNhanh "1" -- "n" Employee : aggregation
Employee "1" -- "n" CaLamViec : association
CaLamViec "1" *-- "1" ChamCong : composition
Employee "1" *-- "n" DanhGiaNhanVien : composition
Employee "1" *-- "n" QuyetDinh : composition
HoaDon "n" -- "1" BaoCao : dependency (báo cáo tổng hợp từ nhiều HĐ)
KhachHang "1" -- "n" HoaDon : association (ngoại lai)
```

### Q15. Biểu đồ lớp phân tích BCE (II.3) — phân chia theo UC.

```
[UC11] LoginPage, StaffHomePage, StaffManagementPage, ShiftAssignForm, EvaluationForm
       → StaffController → Employee, CaLamViec, ChamCong, DanhGiaNhanVien, QuyetDinh

[UC13] BranchReportPage, ReportChartPanel
       → ReportController → HoaDon, BaoCao

[UC14] CustomerInfoPage, CustomerHistoryPanel
       → CustomerController (read-only) → KhachHang, HoaDon

[UC21] AdminHomePage, ChainReportPage, ComparisonPanel
       → ReportController → BaoCao, ChiNhanh
```

Lưu ý: **CustomerController ở đây chỉ READ** — không write sang bảng KhachHang.

### Q16. Biểu đồ tuần tự phân tích (II.4) — UC11 Phân ca: tạo ChamCong đồng thời.

Điểm đặc biệt bước 7:
```
ShiftAssignForm → CaLamViec.assignShift()
  → đồng thời: khởi tạo ChamCong (pending)
  → CaLamViec trả kết quả thành công
```

`ChamCong` được tạo tự động khi phân ca — không cần thao tác riêng. Khi NV thực sự vào làm, hệ thống update `gioThucVao` vào bản ghi ChamCong đó.

### Q17. Biểu đồ lớp thực thể (III.1) — CaLamViec và ChamCong.

```
CaLamViec:
  id: int, shiftDate: Date, shiftType: String
  startTime: Time, endTime: Time
  employee: Employee

ChamCong:
  id: int, actualStartTime: Time, actualEndTime: Time
  status: String (ON_TIME / LATE / ABSENT)
  shift: CaLamViec (composition: xóa ca → xóa chấm công)
```

`CaLamViec *-- ChamCong` (composition 1-1): mỗi ca có đúng 1 bản ghi chấm công.

### Q18. ERD (III.2) — chain FK nhân sự.

```
tblChiNhanh ← tblEmployee (tblChiNhanhMa FK)
tblEmployee ← tblCaLamViec (tblEmployeeMa FK)
tblCaLamViec ← tblChamCong (tblCaLamViecMa FK)
tblEmployee ← tblDanhGiaNhanVien (tblEmployeeMa FK)
tblEmployee ← tblQuyetDinh (tblEmployeeMa FK)
```

Module HR **không có FK sang** tblKhachHang hay tblHoaDon — chỉ dùng JOIN query đọc dữ liệu.

### Q19. Biểu đồ lớp thiết kế MVC (III.3.2) — 2 Controller chính.

```
StaffController (@RestController /api/staff):
  getStaffByBranch(branchId): List<Employee>
  assignShift(employeeId, date, type, start, end): CaLamViec
  checkDuplicate(employeeId, date, start, end): boolean
  saveEvaluation(employeeId, score, comment): DanhGiaNhanVien
  saveDecision(employeeId, type, reason): QuyetDinh

ReportController (@RestController /api/reports):
  getRevenueReport(branchId, start, end): BaoCao
  exportReport(reportId): File
  getChainReport(start, end): List<BaoCao>
  getNotifications(): NotificationResponse  ← cảnh báo tồn kho thấp, order chờ
```

`getNotifications()` là endpoint đặc biệt — tổng hợp 3 loại cảnh báo: stock ≤ 10, order PENDING, phòng OCCUPIED.

### Q20. Biểu đồ tuần tự thiết kế (III.4) — UC21 Tổng hợp báo cáo toàn chuỗi.

```
ChainReportPage.btnTongHopClick(startDate, endDate)
→ ReportController.getChainReport(start: Date, end: Date): List<BaoCao>
  → BranchRepository.findAll(): List<Branch>
  → for each branch:
      HoaDonRepository.sumByBranchAndPeriod(branchId, start, end): BigDecimal
      BaoCao = new BaoCao(branch, revenue, period)
      BaoCaoRepository.save(baoCao)
  → return List<BaoCao>
→ ChainReportPage gọi ComparisonPanel.render(baoCaoList)
→ ComparisonPanel hiển thị biểu đồ so sánh + bảng xếp hạng chi nhánh
```

Đây là **query phức tạp nhất** trong hệ thống — loop qua tất cả chi nhánh, aggregate theo kỳ.
