# BÀI TẬP THỰC HÀNH - HÀNH
## Module: Thanh toán & Báo cáo

**Phạm vi phụ trách:** Hóa đơn thanh toán, Dashboard báo cáo doanh thu, Biểu đồ thống kê
**Trang FE:** `CheckoutPage.tsx`, `ReportsPage.tsx`
**Controller BE:** `InvoiceController` (trong CrudControllers.java), `ReportController.java`
**Bảng DB:** `tblInvoice`

---

## Bài 1 - Trace luồng dữ liệu: Lấy dữ liệu báo cáo Dashboard

**Yêu cầu:** Trace từ lúc trang ReportsPage load đến khi lấy dữ liệu tổng hợp từ API backend. Lưu ý: trang hiện tại dùng dữ liệu hardcode, nhưng backend đã có API hoàn chỉnh.

### Bước 1: File UI React

**File:** `frontend/src/pages/ReportsPage.tsx`

- **Dòng 4-5:** State quản lý loại biểu đồ
```tsx
const [chartType, setChartType] = useState('weekly');
const [modalContent, setModalContent] = useState<'room' | 'fb' | null>(null);
```

- **Dòng 8-42:** Dữ liệu biểu đồ **hardcode** (không gọi API)
```tsx
const chartData = {
    hourly: [
        { label: '12h', value: 4000000 },
        { label: '14h', value: 7000000 },
        // ...
    ],
    weekly: [
        { label: 'Thứ 2', value: 15000000 },
        // ...
    ],
    monthly: [
        { label: 'Th1', value: 300000000 },
        // ...
    ]
};
```

- **Dòng 44:** Lấy dữ liệu theo loại biểu đồ đang chọn
```tsx
const currentData = chartData[chartType as keyof typeof chartData];
```

- **Dòng 94-106:** Metric cards **hardcode**
```tsx
{ label: 'Doanh thu ngày', value: '45,000,000đ', ... },
{ label: 'Tỷ lệ lấp đầy', value: '80%', ... },
{ label: 'Số đơn hàng', value: '120', ... },
{ label: 'Lượt khách', value: '300', ... },
```

- **Dòng 75-79:** Giao dịch gần nhất **hardcode**
```tsx
const transactions = [
    { id: 'HD001', customer: 'Nguyễn Văn A', room: 'VIP 02', amount: '1,305,000đ', status: 'Đã thanh toán' },
    { id: 'HD002', customer: 'Trần Thị B', room: 'P03', amount: '450,000đ', status: 'Đã thanh toán' },
    { id: 'HD003', customer: 'Lê Hoàng C', room: 'P01', amount: '780,000đ', status: 'Chưa thanh toán' },
];
```

### Bước 2: Hàm gọi API (Backend đã có, Frontend cần kết nối)

Endpoint: `GET /api/reports/summary`

Response format:
```json
{
    "rooms": 5,
    "occupiedRooms": 1,
    "customers": 4,
    "menuItems": 10,
    "bookings": 0,
    "employees": 3,
    "revenue": 0
}
```

Để kết nối, cần thêm vào component:
```tsx
const [summary, setSummary] = useState<any>(null);

useEffect(() => {
    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/reports/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSummary(await res.json());
            }
        } catch (e) { /* fallback */ }
    };
    fetchSummary();
}, []);
```

### Bước 3: File Controller nhận request

**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`

- **Dòng 24:** `@RequestMapping("/api/reports")`
- **Dòng 49:** `@GetMapping("/summary")` - endpoint tổng hợp số liệu

### Bước 4: File xử lý logic

**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`

- **Dòng 33-40:** Inject 6 repository
```java
public ReportController(
    RoomRepository rooms,
    CustomerRepository customers,
    MenuItemRepository menuItems,
    BookingRepository bookings,
    InvoiceRepository invoices,
    EmployeeRepository employees
)
```

- **Dòng 65-84:** Hàm `summary()` tính toán số liệu
  - **Dòng 66-69:** Tính doanh thu
  ```java
  BigDecimal revenue = invoices.findAll().stream()
      .filter(invoice -> invoice.getStatus() == InvoiceStatus.PAID)
      .map(invoice -> invoice.getGrandTotal() == null ? BigDecimal.ZERO : invoice.getGrandTotal())
      .reduce(BigDecimal.ZERO, BigDecimal::add);
  ```
  - **Dòng 71-73:** Đếm phòng đang occupied
  ```java
  long occupiedRooms = rooms.findAll().stream()
      .filter(room -> room.getStatus() == RoomStatus.OCCUPIED)
      .count();
  ```
  - **Dòng 75-83:** Trả về Map kết quả
  ```java
  return Map.of(
      "rooms", rooms.count(),
      "occupiedRooms", occupiedRooms,
      "customers", customers.count(),
      "menuItems", menuItems.count(),
      "bookings", bookings.count(),
      "employees", employees.count(),
      "revenue", revenue
  );
  ```

### Bước 5: File Repository thao tác CSDL

**File:** `backend/src/main/java/com/karaoke/backend/repository/InvoiceRepository.java`

```java
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    // Không có custom method, dùng findAll() từ JpaRepository
}
```

Các repository khác cũng được inject:
- `RoomRepository.java` - `findAll()`, `findByStatus()`
- `CustomerRepository.java` - `findAll()` (kế thừa JpaRepository)
- `MenuItemRepository.java` - `findAll()`
- `BookingRepository.java` - `findAll()`, `findByStatus()`
- `EmployeeRepository.java` - `findAll()`

### Bước 6: Entity ánh xạ bảng

**File:** `backend/src/main/java/com/karaoke/backend/domain/Invoice.java`

```java
@Entity
@Table(name = "tblInvoice")        // dòng 18
public class Invoice {
    @Id
    private String id;                      // PK, ví dụ "INV001"

    @ManyToOne
    private Booking booking;                // FK → tblBooking

    private BigDecimal roomTotal;           // tiền giờ hát
    private BigDecimal serviceTotal;        // tiền dịch vụ
    private BigDecimal discount;            // giảm giá
    private BigDecimal grandTotal;          // tổng thanh toán
    private LocalDateTime paidAt;           // thời gian thanh toán

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;           // PAID, UNPAID, CANCELLED
}
```

**Tổng kết flow:**
```
ReportsPage.tsx (trang load)
  → [CHƯA KẾT NỐI API - dùng hardcode]
  → Backend đã có: GET /api/reports/summary
    → ReportController.summary() (dòng 65)
      → InvoiceRepository.findAll() → filter PAID → sum grandTotal
      → RoomRepository.findAll() → filter OCCUPIED → count
      → CustomerRepository.count()
      → MenuItemRepository.count()
      → BookingRepository.count()
      → EmployeeRepository.count()
    ← trả Map {rooms, occupiedRooms, customers, menuItems, bookings, employees, revenue}
```

---

## Bài 2 - Sửa lỗi có chủ đích

### Lỗi QA tạo ra

**File:** `backend/src/main/java/com/karaoke/backend/web/ReportController.java`
**Dòng 67:** Đổi `InvoiceStatus.PAID` thành `InvoiceStatus.UNPAID`

**Trước (đúng):**
```java
.filter(invoice -> invoice.getStatus() == InvoiceStatus.PAID)
```

**Sau (sai):**
```java
.filter(invoice -> invoice.getStatus() == InvoiceStatus.UNPAID)
```

### Log lỗi sẽ hiển thị

**Không có exception.** Hệ thống chạy hoàn toàn bình thường, nhưng kết quả SAI:

- **Trường hợp 1:** Nếu tất cả invoice đều là PAID → filter UNPAID loại bỏ hết → `revenue = 0`
- **Trường hợp 2:** Nếu có invoice UNPAID → revenue = tổng tiền hóa đơn **chưa** thanh toán
- Dashboard hiển thị doanh thu = 0 hoặc sai hoàn toàn

Đây là lỗi logic (logic bug), không phải lỗi runtime → khó phát hiện hơn vì không có crash hay exception.

### Các bước Learner debug

1. Chuẩn bị dữ liệu: gọi `POST /api/invoices` để tạo invoice với status PAID
2. Gọi `GET /api/reports/summary` qua Swagger
3. Nhận kết quả: `"revenue": 0` dù đã có hóa đơn thanh toán
4. Đặt breakpoint tại `ReportController.java` **dòng 66-69**
5. Debug:
   - `invoices.findAll()` trả về danh sách invoice (có cả PAID và UNPAID)
   - Quan sát `.filter(invoice -> invoice.getStatus() == InvoiceStatus.UNPAID)` → chỉ giữ invoice CHƯA thanh toán
   - Nếu tất cả đều PAID → stream rỗng → `reduce` trả `BigDecimal.ZERO`
6. **Nhận ra:** Logic tính doanh thu phải lọc invoice **ĐÃ** thanh toán (PAID), không phải **CHƯA** thanh toán (UNPAID)
7. **Sửa:** Đổi `UNPAID` thành `PAID`

---

## Bài 3 - Tinh chỉnh UI và Vấn đáp

### Task chỉnh sửa UI

**File:** `frontend/src/pages/ReportsPage.tsx`

**Yêu cầu:** Đổi giá trị "Doanh thu ngày" trong metric card

**Dòng 96, sửa thành:**
```tsx
{ label: 'Doanh thu ngày', value: '52,500,000đ', icon: 'payments', colorClass: 'text-primary-container' },
```

**Thay đổi:** `'45,000,000đ'` → `'52,500,000đ'`

### 5 câu hỏi chất vấn

---

**Câu 1:** Trang `ReportsPage` lấy dữ liệu từ đâu? Có gọi API backend không? Phân tích cấu trúc dữ liệu hardcode trong component.

**Đáp án chi tiết:**
- `ReportsPage.tsx` **KHÔNG** gọi API. Tất cả dữ liệu hardcode ngay trong component:
  - **Dòng 8-42:** `chartData` - 3 mảng dữ liệu cho hourly/weekly/monthly
  - **Dòng 46-50:** `roomData` - tỷ trọng hạng phòng cho PieChart
  - **Dòng 52-58:** `fbData` - phân bổ tiêu thụ F&B cho BarChart
  - **Dòng 75-79:** `transactions` - giao dịch gần nhất cho bảng
  - **Dòng 95-100:** Metric cards với giá trị cố định
- Backend đã có `GET /api/reports/summary` nhưng frontend chưa kết nối
- Khi kết nối, cần thay metric cards bằng dữ liệu từ API: `summary.rooms`, `summary.revenue`, v.v.

---

**Câu 2:** Trang `CheckoutPage` có kết nối API không? Hóa đơn được tạo như thế nào ở backend? Chỉ ra endpoint và logic xử lý.

**Đáp án chi tiết:**
- `CheckoutPage.tsx` **hoàn toàn hardcode**, KHÔNG có API call:
  - **Dòng 29-32:** Danh sách dịch vụ hardcode (Heineken, Trái cây, Khô mực)
  - **Dòng 60-61:** Tạm tính `1,450,000đ`, giảm giá `145,000đ` hardcode
  - **Dòng 75-77:** Nút "HOÀN TẤT THANH TOÁN" **không có onClick handler** → click không làm gì

- Backend đã có API tạo hóa đơn:
  - `CrudControllers.java` **dòng 370-404:** `InvoiceController`
  - **Dòng 386:** `@PostMapping` - endpoint `POST /api/invoices`
  - **Dòng 401-403:** `Invoice create(@RequestBody Invoice invoice)` → `repository.save(invoice)`

---

**Câu 3:** `ReportController` inject bao nhiêu repository? Giải thích lý do cần nhiều repository như vậy và mỗi repository dùng để lấy thông tin gì.

**Đáp án chi tiết:**
- `ReportController.java` **dòng 33-40:** Inject **6 repository:**

| Repository | Dùng để | Code tại dòng |
|---|---|---|
| `rooms` | Đếm tổng số phòng, đếm phòng occupied | 71-73, 76 |
| `customers` | Đếm tổng số khách hàng | 77 |
| `menuItems` | Đếm tổng số món trong menu | 78 |
| `bookings` | Đếm tổng số đặt phòng | 79 |
| `invoices` | Tính doanh thu (lọc PAID, sum grandTotal) | 66-69, 80 |
| `employees` | Đếm tổng số nhân viên | 81 |

- Lý do cần nhiều: endpoint `/summary` tổng hợp số liệu từ **nhiều bảng khác nhau** trong 1 response duy nhất, phục vụ Dashboard

---

**Câu 4:** Khi người dùng nhấn nút "HOÀN TẤT THANH TOÁN" trên trang CheckoutPage, điều gì xảy ra? Nếu muốn kết nối backend, cần làm những gì?

**Đáp án chi tiết:**
- `CheckoutPage.tsx` **dòng 75-77:** Nút KHÔNG có event handler
```tsx
<button className="w-full bg-primary-container ...">
    <span className="material-symbols-outlined">receipt_long</span>HOÀN TẤT THANH TOÁN
</button>
```
- Nhấn nút → **KHÔNG xảy ra gì cả**. Đây là giao diện tĩnh (mockup)

- Để kết nối backend, cần:
  1. Thêm `onClick` handler gọi `POST /api/invoices` với body chứa bookingId, roomTotal, serviceTotal, discount, grandTotal, status
  2. Sau khi tạo invoice thành công, gọi `PUT /api/bookings/{id}/status` với status COMPLETED để giải phóng phòng
  3. Cập nhật UI hiển thị thông báo thành công

---

**Câu 5:** Biểu đồ trong `ReportsPage` dùng thư viện gì? Giải thích cách hoạt động khi người dùng thay đổi dropdown (hôm nay / tuần / tháng).

**Đáp án chi tiết:**
- Thư viện: **recharts** (`import` tại dòng 2)
- Các component dùng: `AreaChart`, `BarChart`, `PieChart`, `ResponsiveContainer`

- State quản lý: `const [chartType, setChartType] = useState('weekly')` (dòng 5)
- Dropdown tại **dòng 111-119:**
```tsx
<select value={chartType} onChange={(e) => setChartType(e.target.value)}>
    <option value="hourly">Hôm nay (Theo giờ)</option>
    <option value="weekly">Tuần này (Theo ngày)</option>
    <option value="monthly">Năm nay (Theo tháng)</option>
</select>
```

- Khi user thay đổi dropdown:
  1. `setChartType(newValue)` cập nhật state
  2. Component re-render
  3. **Dòng 44:** `const currentData = chartData[chartType]` lấy mảng dữ liệu mới
  4. `<AreaChart data={currentData}>` nhận data mới → biểu đồ re-render
- Dữ liệu vẫn là **hardcode** trong `chartData` (dòng 8-42), không fetch từ API
