# Module 3: Dịch vụ & Sản phẩm
> UC06 (Gọi món) · UC10 (Báo cáo hàng hóa) · UC12 (Quản lý kho) · UC15 (Quản lý menu)

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

4 UC, 2 actor chính:

| UC | Tên | Actor chính |
|----|-----|-------------|
| UC06 | Gọi món / Quản lý order | Khách hàng + NV Phục vụ |
| UC10 | Báo cáo tình trạng hàng hóa | NV Phục vụ |
| UC12 | Quản lý kho | Quản lý chi nhánh |
| UC15 | Quản lý menu | Quản lý chi nhánh |

### Q2. UC06 – Gọi món có 2 actor. Tại sao cùng 1 UC?

Khách hàng đặt món qua app trong phòng; NV Phục vụ nhận order miệng và nhập thay. Nghiệp vụ giống nhau (tạo Order → cập nhật Room_receipt), chỉ khác giao diện tiếp cận → cùng 1 UC, 2 luồng actor.

---

## PHA II — PHÂN TÍCH

### Q3. II.2 — Các lớp thực thể được trích từ văn xuôi.

| Lớp thực thể | Ghi chú |
|--------------|---------|
| **Employee** | NV phục vụ + QL chi nhánh — dùng chung 1 lớp |
| **Order** | Đơn hàng gọi món, liên kết Room_receipt |
| **Order_detail** | Chi tiết order — bảng trung gian Order × Product |
| **Room_receipt** | Hóa đơn phòng (ngoại lai từ module Booking) |
| **Room** | Phòng đang hoạt động |
| **Facility** | Tài sản/cơ sở vật chất trong phòng |
| **Damage_report** | Báo cáo hỏng hóc tài sản |
| **Damage_detail** | Bảng trung gian Damage_report × Facility |
| **Product** | Sản phẩm trong menu + kho |
| **Provider** | Nhà cung cấp |
| **Import_receipt** | Phiếu nhập kho |
| **Import_detail** | Bảng trung gian Import_receipt × Product |

### Q4. II.2 — Cardinality: 3 quan hệ n-n tạo ra 3 bảng trung gian.

| Quan hệ n-n | Bảng trung gian |
|-------------|----------------|
| Order × Product | **Order_detail** |
| Damage_report × Facility | **Damage_detail** |
| Import_receipt × Product | **Import_detail** |

Tất cả đều là **composition** từ cha (Order, Damage_report, Import_receipt) sang bảng trung gian, và **aggregation** từ bảng trung gian sang entity con (Product, Facility).

### Q5. II.3 — Sơ đồ lớp phân tích BCE.

```
Boundary: StaffHomeView, SearchRoomView, CreateOrderView, ConfirmOrderView
          DamageReportView, ConfirmReportView
          ManagerHomeView, MenuView, EditMenuView
          WarehouseManageView, SearchProviderView, ImportReceiptView
Control:  OrderController, MenuController, InventoryController (ngầm hiểu)
Entity:   Employee, Order, Order_detail, Room_receipt, Room, Facility,
          Damage_report, Damage_detail, Product, Provider, Import_receipt, Import_detail
```

### Q6. II.4 — Kịch bản phiên bản 2 UC06 Gọi món.

```
1.  NV đăng nhập → StaffHomeView hiển thị
2.  NV click "Quản lý order" → SearchRoomView hiển thị danh sách phòng đang hoạt động
3.  NV nhập số phòng, ấn Tìm → Room.searchActiveRoom()
4.  NV click phòng tương ứng, ấn "Tạo order" → CreateOrderView hiển thị
5.  NV tìm kiếm sản phẩm → Product.searchProduct()
6.  NV thêm từng món vào giỏ, ấn Lưu → ConfirmOrderView
7.  ConfirmOrderView gọi Order.addOrder() → lưu order vào CSDL
8.  Order gọi Room_receipt.updateServiceFee() → cập nhật tiền dịch vụ vào hóa đơn phòng
9.  ConfirmOrderView thông báo tạo order thành công
10. Quay về StaffHomeView
```

### Q7. II.4 — Kịch bản phiên bản 2 UC10 Báo cáo hàng hóa.

```
1.  NV đăng nhập → StaffHomeView, click "Báo cáo tình trạng hàng"
2.  SearchRoomView hiển thị phòng đang trong ca phục vụ
3.  NV click chọn phòng, ấn "Tạo báo cáo" → DamageReportView
4.  Hệ thống hiển thị danh sách tài sản trong phòng (Facility)
5.  NV nhập số lượng hỏng cho từng tài sản, ấn Lưu
6.  Hệ thống gọi DamageReport.addDamageReport()
7.  ConfirmReportView hiển thị "Báo cáo hoàn tất", NV ấn xác nhận
```

---

## PHA III — THIẾT KẾ

### Q8. III.2 — Bảng CSDL module Dịch vụ.

| Bảng | Entity | FK |
|------|--------|----|
| tblProduct | Product | — |
| tblOrder | Order | tblRoomMa, tblEmployeeMa |
| tblOrder_detail | Order_detail (n-n) | tblOrderMa, tblProductMa |
| tblFacility | Facility | tblRoomMa |
| tblDamage_report | Damage_report | tblRoomMa, tblEmployeeMa |
| tblDamage_detail | Damage_detail (n-n) | tblDamage_reportMa, tblFacilityMa |
| tblProvider | Provider | — |
| tblImport_receipt | Import_receipt | tblProviderMa, tblEmployeeMa |
| tblImport_detail | Import_detail (n-n) | tblImport_receiptMa, tblProductMa |

### Q9. III.3.2 — Bảng chữ ký hàm Controller module Dịch vụ.

| Hàm | Controller | Input | Output |
|-----|-----------|-------|--------|
| `searchActiveRoom()` | OrderController | branchId: int | List\<Room\> |
| `searchProduct()` | OrderController | keyword: String | List\<Product\> |
| `createOrder()` | OrderController | roomId, items: List, staffId: int | Order |
| `searchPendingRoom()` | OrderController | branchId: int | List\<Room\> |
| `searchFacility()` | OrderController | roomId: int | List\<Facility\> |
| `addDamageReport()` | OrderController | roomId, damages: List | DamageReport |
| `getAllProducts()` | MenuController | — | List\<Product\> |
| `updateProduct()` | MenuController | product: Product | Product |
| `addProduct()` | MenuController | product: Product | Product |
| `deleteProduct()` | MenuController | id: int | boolean |
| `searchProvider()` | InventoryController | keyword: String | List\<Provider\> |
| `createImportReceipt()` | InventoryController | providerId, items, staffId | ImportReceipt |

### Q10. III.3.1 — Wireframe đặc biệt: CreateOrderView.

```
┌──────────────────────────────────────────────┐
│  Tạo order — Phòng VIP 01                    │
│                                              │
│  Tìm sản phẩm: [____________] [Tìm]          │
│                                              │
│  +--------+--------+-------+--------+        │
│  | Mã     | Tên    | Giá   | Thêm   |        │
│  | SP001  | Bia TG | 35k   | [+]    |        │
│  | SP002  | Chivas | 850k  | [+]    |        │
│  +--------+--------+-------+--------+        │
│                                              │
│  Giỏ hàng:                                   │
│  Bia Tiger x2 = 70.000đ                      │
│  Khoai tây x1 = 45.000đ                      │
│  Tổng: 115.000đ                              │
│                                              │
│  [Hủy]              [Lưu order]              │
└──────────────────────────────────────────────┘
```

---

## PHA IV — KIỂM THỬ

### Q11. Các loại test case quan trọng module Dịch vụ.

| Nhóm | Kịch bản |
|------|---------|
| **Gọi món** | Tạo order thành công → Order lưu, Room_receipt.serviceTotal cập nhật |
| **Gọi món** | Sản phẩm hết stock → thông báo lỗi |
| **Gọi món** | Tìm phòng không tồn tại → thông báo |
| **Báo cáo HH** | Tạo báo cáo hỏng hóc → Damage_report + Damage_detail được lưu |
| **Quản lý menu** | Thêm sản phẩm mới → Product tạo thành công |
| **Quản lý menu** | Sửa giá sản phẩm → Product cập nhật |
| **Quản lý menu** | Xóa sản phẩm đang trong order active → thông báo lỗi |
| **Quản lý kho** | Tạo phiếu nhập kho → Import_receipt + Import_detail, stock Product tăng |
| **Quản lý kho** | Nhà cung cấp không tồn tại → thông báo |

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **3 bảng trung gian**: Order_detail, Damage_detail, Import_detail — đây là điểm khác biệt lớn nhất của module này
- **updateServiceFee()**: khi tạo Order, Room_receipt phải cập nhật tổng tiền dịch vụ ngay lập tức
- **Stock management**: khi tạo Order, stock Product giảm ngay; khi nhập kho (Import_receipt), stock tăng
- **Module không gán UC ID** trong tài liệu gốc — heading dùng tên chức năng, không có nhãn UC06/UC10/UC12/UC15
- **ERD module Services** có nhiều lớp nhất (12 entity) — cẩn thận khi vẽ biểu đồ

---

## DIAGRAM Q&A

### Q12. Biểu đồ UC (I.1) — 4 biểu đồ chi tiết.

- **UC06 Gọi món**: NV Phục vụ + Khách hàng → include "Tìm phòng active", "Tìm sản phẩm", "Tạo order"
- **UC10 Báo cáo HH**: NV Phục vụ → include "Chọn phòng", "Báo cáo tài sản hỏng"
- **UC15 Quản lý menu**: QL chi nhánh → include "Tìm sản phẩm", "Thêm/Sửa/Xóa sản phẩm"
- **UC12 Quản lý kho**: QL chi nhánh → include "Tìm nhà cung cấp", "Tạo phiếu nhập"

### Q13. Biểu đồ thực thể (II.2) — 3 quan hệ n-n.

Module Services có nhiều entity nhất (12 lớp) và **3 quan hệ n-n** tạo 3 bảng trung gian:

```
Order "1" *-- "n" Order_detail : composition
Order_detail "n" o-- "1" Product : aggregation

Damage_report "1" *-- "n" Damage_detail : composition
Damage_detail "n" o-- "1" Facility : aggregation

Import_receipt "1" *-- "n" Import_detail : composition
Import_detail "n" o-- "1" Product : aggregation
```

Pattern: **cha composition trung gian, trung gian aggregation con**.

### Q14. Biểu đồ lớp phân tích BCE (II.3) — phân chia theo UC.

```
[UC06] StaffHomeView → OrderController → Order, Order_detail, Product, Room, Room_receipt
[UC10] DamageReportView → OrderController → Damage_report, Damage_detail, Facility
[UC15] MenuView, EditMenuView → MenuController → Product
[UC12] WarehouseManageView, ImportReceiptView → InventoryController → Import_receipt, Import_detail, Provider
```

Lưu ý: `Product` được dùng bởi cả UC06 (gọi món), UC15 (quản lý menu) và UC12 (nhập kho) — 3 UC cùng truy cập 1 Entity.

### Q15. Biểu đồ tuần tự phân tích (II.4) — UC06 Gọi món: Room_receipt được cập nhật.

Điểm đặc biệt trong II.4 UC06:
```
ConfirmOrderView → Order.addOrder() [lưu order]
Order → Room_receipt.updateServiceFee() [cập nhật tiền DV vào HĐ phòng]
```

Bước 2 là **cross-entity call**: Order gọi Room_receipt — thể hiện sự phụ thuộc liên module (Order thuộc Services, Room_receipt thuộc Booking).

### Q16. Biểu đồ lớp thực thể (III.1) — các bảng trung gian có kiểu Java.

```
Order_detail:
  id: int, quantity: int, unitPrice: double, subtotal: double
  order: Order (FK composition)
  product: Product (FK aggregation)

Damage_detail:
  id: int, quantity: int, description: String
  report: Damage_report (FK composition)
  facility: Facility (FK aggregation)

Import_detail:
  id: int, quantity: int, unitCost: double, subtotal: double
  receipt: Import_receipt (FK composition)
  product: Product (FK aggregation)
```

### Q17. ERD (III.2) — Product bị tham chiếu bởi 3 bảng.

```
tblOrder_detail: tblOrderMa + tblProductMa
tblImport_detail: tblImport_receiptMa + tblProductMa
(tblProduct được FK từ 2 bảng detail)
```

Đây là lý do **Product.stock** phải được quản lý cẩn thận: giảm khi Order, tăng khi Import.

### Q18. Biểu đồ lớp thiết kế MVC (III.3.2) — Entity quan trọng nhất: Order.

```
Order (@Entity, tblOrder):
  id: String, orderedAt: LocalDateTime, status: OrderStatus
  room: Room (@ManyToOne)
  items: List<OrderDetail> (@OneToMany, cascade=ALL, orphanRemoval=true)

OrderDetail (@Entity, tblOrderItem):
  id: Long (auto), quantity: int, unitPrice: BigDecimal
  order: Order (@ManyToOne, @JsonIgnore)  ← tránh infinite recursion
  product: Product (@ManyToOne)
```

@JsonIgnore trên OrderDetail.order là bắt buộc để tránh vòng lặp serialize.

### Q19. Biểu đồ tuần tự thiết kế (III.4) — UC12 Quản lý kho: stock tăng khi nhập.

```
InventoryController.createImportReceipt(providerId, items, staffId):
  1. Provider.findById(providerId) → Provider
  2. ImportReceipt = new ImportReceipt(provider, staff, now)
  3. for each item in items:
     - Product.findById(item.productId) → Product
     - product.setStock(product.getStock() + item.quantity)
     - Product.save(product)
     - ImportDetail = new ImportDetail(receipt, product, quantity, cost)
     - ImportDetail.save()
  4. ImportReceipt.save() → return ImportReceipt
```

Stock tăng ngay khi tạo phiếu nhập (đối xứng với giảm khi createOrder).
