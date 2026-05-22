# BÀI TẬP THỰC HÀNH - TUẤN
## Module: Quản lý phòng & Đặt phòng

**Phạm vi phụ trách:** Hiển thị phòng, Lọc phòng, Đặt phòng, Check-in/Check-out
**Trang FE:** `ReceptionDashboard.tsx`, `BookingPage.tsx`, `BookingManagement.tsx`
**Controller BE:** `RoomController` (trong CrudControllers.java), `BookingController.java`
**Bảng DB:** `tblRoom`, `tblBooking`

---

## Bài 1 - Trace luồng dữ liệu: Hiển thị danh sách phòng trên Dashboard

**Yêu cầu:** Trace từ lúc trang ReceptionDashboard load xong đến khi hiển thị grid phòng hát từ API backend.

### Bước 1: File UI React - trigger load dữ liệu

**File:** `frontend/src/pages/ReceptionDashboard.tsx`

- **Dòng 11-65:** `useEffect` chạy 1 lần khi component mount
```tsx
useEffect(() => {
    const fetchRooms = async () => {
        // gọi API ở đây
    };
    fetchRooms();
}, []);
```

- **Dòng 9:** State lưu danh sách phòng
```tsx
const [rooms, setRooms] = useState<any[]>([]);
```

- **Dòng 141-232:** Render grid phòng hát, mỗi phòng là 1 card với status badge và hover actions

### Bước 2: Hàm gọi API

**File:** `frontend/src/pages/ReceptionDashboard.tsx`

- **Dòng 14-19:** Lấy token từ localStorage, gọi API
```typescript
const token = localStorage.getItem('token');
const res = await fetch('/api/rooms', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

- **Dòng 21-28:** Map dữ liệu từ API sang format UI
```typescript
const data = await res.json();
const mappedRooms = data.map((r: any) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    status: r.status === 'AVAILABLE' ? 'available' : r.status === 'OCCUPIED' ? 'occupied' : 'cleaning',
    time: r.status === 'OCCUPIED' ? '01:23:45' : '',
    customer: null,
    guests: r.capacity || 2
}));
setRooms(mappedRooms);
```

- **Dòng 32-36:** Nếu API fail → log lỗi, hiển thị danh sách rỗng
```typescript
} catch (e) {
    console.error('Failed to fetch rooms:', e);
}
```

### Bước 3: File Controller nhận request

**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java`

- **Dòng 180-181:** Class `RoomController`
```java
@RestController
@RequestMapping("/api/rooms")
```

- **Dòng 189-207:** GET endpoint trả danh sách phòng
```java
@GetMapping
List<Room> list(@RequestParam(required = false) RoomStatus status) {
    return status == null ? repository.findAll() : repository.findByStatus(status);
}
```

- Hỗ trợ filter theo status qua query param: `/api/rooms?status=AVAILABLE`

### Bước 4: File Repository thao tác CSDL

**File:** `backend/src/main/java/com/karaoke/backend/repository/RoomRepository.java`

```java
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByStatus(RoomStatus status);    // dòng 9
}
```

- `findAll()` → `SELECT * FROM tblRoom`
- `findByStatus(AVAILABLE)` → `SELECT * FROM tblRoom WHERE status = 'AVAILABLE'`

### Bước 5: Entity ánh xạ bảng

**File:** `backend/src/main/java/com/karaoke/backend/domain/Room.java`

```java
@Entity
@Table(name = "tblRoom")      // dòng 19
public class Room {
    @Id
    private String id;                     // PK, ví dụ "P01"
    private String name;                   // "VIP 01"
    private String type;                   // "VIP", "Thường", "Deluxe"
    private int capacity;                  // 15
    private BigDecimal hourlyPrice;        // 150000
    @Enumerated(EnumType.STRING)
    private RoomStatus status;             // AVAILABLE, OCCUPIED, RESERVED
    @ManyToOne
    private Branch branch;                 // FK → tblBranch
    private boolean active = true;
}
```

### Bước 6: Enum RoomStatus

**File:** `backend/src/main/java/com/karaoke/backend/domain/RoomStatus.java`

```java
public enum RoomStatus {
    AVAILABLE,    // Trống - xanh lá
    OCCUPIED,     // Đang dùng - đỏ
    RESERVED      // Đặt trước - vàng
}
```

**Mapping sang UI** (`ReceptionDashboard.tsx` dòng 23-25):
```
AVAILABLE → "available" → badge "Trống" (xanh lá)
OCCUPIED  → "occupied"  → badge "Đang hát" (đỏ)
RESERVED  → "cleaning"  → badge "Chờ dọn" (vàng)
```

**Tổng kết flow:**
```
ReceptionDashboard.tsx useEffect (dòng 11)
  → fetch GET /api/rooms (dòng 15)
    → RoomController.list() (dòng 206)
      → RoomRepository.findAll() hoặc findByStatus()
      → SELECT * FROM tblRoom
    ← trả JSON array [{id, name, type, capacity, hourlyPrice, status, branch, active}]
  ← map data, setRooms() (dòng 31)
  ← render grid phòng (dòng 141-232)
```

---

## Bài 2 - Sửa lỗi có chủ đích

### Lỗi QA tạo ra

**File:** `backend/src/main/java/com/karaoke/backend/web/CrudControllers.java`
**Dòng 231:** Xóa annotation `@RequestBody` trong hàm tạo phòng

**Trước (đúng):**
```java
Room create(@RequestBody Room room) {
```

**Sau (sai):**
```java
Room create(Room room) {
```

### Log lỗi sẽ hiển thị

**Trường hợp 1:** Spring không deserialize được body
- Backend: `org.springframework.web.bind.MissingServletRequestPartException: Required request body is missing`
- Frontend: HTTP 400 Bad Request

**Trường hợp 2:** Spring tạo Room rỗng (nếu có default constructor)
- Backend: `DataIntegrityViolationException` vì `id` là `@Id` không được null
- Hoặc: lưu thành công nhưng Room có tất cả field = null → dữ liệu rác trong database
- Frontend: HTTP 500 Internal Server Error

### Các bước Learner debug

1. Mở Swagger UI: `http://localhost:8080/swagger-ui.html`
2. Tìm endpoint `POST /api/rooms` → click "Try it out"
3. Nhập body:
```json
{
  "id": "P06",
  "name": "Deluxe 02",
  "type": "Deluxe",
  "capacity": 18,
  "hourlyPrice": 180000,
  "status": "AVAILABLE",
  "active": true
}
```
4. Click Execute → nhận lỗi 400 hoặc 500
5. Đặt breakpoint tại `CrudControllers.java` **dòng 231**
6. Debug lại: parameter `room` là `null` hoặc có tất cả field = null
7. Kiểm tra annotation: thiếu `@RequestBody` → Spring không biết deserialize JSON body thành object
8. **Sửa:** Thêm lại `@RequestBody` trước `Room room`

---

## Bài 3 - Tinh chỉnh UI và Vấn đáp

### Task chỉnh sửa UI

**File:** `frontend/src/pages/ReceptionDashboard.tsx`

**Yêu cầu:** Đổi màu badge "Trống" từ xanh lá (`status-available`) sang xanh dương (`blue-500`)

**Dòng 156-161, sửa thành:**
```tsx
{room.status === 'available' && (
  <div className="bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
    <span className="font-label-caps text-blue-500">Trống</span>
  </div>
)}
```

**Thay đổi:** Tất cả `status-available` → `blue-500`

### 5 câu hỏi chất vấn

---

**Câu 1:** Trang `ReceptionDashboard` và `RoomManagement` đều hiển thị danh sách phòng, nhưng cách lấy dữ liệu khác nhau như thế nào? Tại sao lại có sự khác biệt này?

**Đáp án chi tiết:**
- `ReceptionDashboard.tsx` dùng `fetch('/api/rooms')` gọi API thật, có header Authorization
- `RoomManagement.tsx` cũng dùng `fetch('/api/rooms')` để lấy danh sách phòng, và `POST/PUT/DELETE` cho các thao tác CRUD
- Cả hai trang đều đã kết nối API, không còn dùng mock data
- `mockData.ts` đã bị xóa khỏi dự án

---

**Câu 2:** Khi người dùng đặt phòng (Booking), trạng thái phòng thay đổi như thế nào? Trace code từ BookingController, chỉ ra từng dòng code thay đổi status.

**Đáp án chi tiết:**
- `BookingController.java` **dòng 96-113:** Hàm `create()` tạo booking mới
  - **Dòng 110:** `room.setStatus(RoomStatus.RESERVED)` - phòng chuyển sang "Đặt trước"
  - **Dòng 111:** `rooms.save(room)` - lưu thay đổi vào DB
- `BookingController.java` **dòng 134-146:** Hàm `updateStatus()` cập nhật trạng thái
  - **Dòng 138-139:** CHECKED_IN → `booking.getRoom().setStatus(RoomStatus.OCCUPIED)` - chuyển "Đang dùng"
  - **Dòng 141-142:** COMPLETED hoặc CANCELLED → `booking.getRoom().setStatus(RoomStatus.AVAILABLE)` - trả về "Trống"
  - **Dòng 144:** `rooms.save(booking.getRoom())` - lưu thay đổi

---

**Câu 3:** Room có quan hệ gì với Branch? Nếu xóa Branch thì Room có bị ảnh hưởng không? Chỉ ra annotation và giải thích.

**Đáp án chi tiết:**
- `Room.java` **dòng 31:** `@ManyToOne private Branch branch;`
- Quan hệ: nhiều Room thuộc về 1 Branch (N:1)
- `Branch.java` dùng `@Id private String id` với giá trị như `"CN001"`
- Về việc xóa: vì KHÔNG có `cascade` annotation trên `@ManyToOne`, JPA sẽ **không** tự động xóa Room khi xóa Branch. Thay vào đó sẽ ném `DataIntegrityViolationException` vì vi phạm khóa ngoại
- Để xóa Branch an toàn, phải xóa hoặc chuyển tất cả Room sang Branch khác trước

---

**Câu 4:** Khi gọi `/api/rooms` cần token trong header. Nếu không gửi token thì sẽ xảy ra chuyện gì? Trace qua security filter.

**Đáp án chi tiết:**
- Request đi qua `TokenAuthenticationFilter.java` **dòng 29-47**
- **Dòng 32:** `getJwtFromRequest(request)` - lấy token từ header `Authorization: Bearer xxx`
- **Dòng 50-55:** Nếu header không có hoặc không bắt đầu bằng `"Bearer "` → trả `null`
- **Dòng 33:** `StringUtils.hasText(jwt)` = false → không set Authentication
- Request chuyển tiếp đến SecurityConfig
- `SecurityConfig.java` **dòng 39:** `.anyRequest().authenticated()` → request không có Authentication → **HTTP 403 Forbidden**
- Frontend nhận 403 → `ReceptionDashboard.tsx` **dòng 32:** fallback `generateMockRooms()` dùng dữ liệu giả

---

**Câu 5:** Enum `RoomStatus` có bao nhiêu giá trị? Giải thích ý nghĩa nghiệp vụ của từng giá trị và trạng thái chuyển đổi giữa chúng.

**Đáp án chi tiết:**
- `RoomStatus.java` có **3 giá trị:** `AVAILABLE`, `OCCUPIED`, `RESERVED`

| Trạng thái | Ý nghĩa nghiệp vụ | Khi nào chuyển đến |
|---|---|---|
| AVAILABLE | Phòng trống, sẵn sàng đón khách | Hủy booking, hoàn tất checkout |
| OCCUPIED | Khách đang sử dụng phòng | Check-in (nhận phòng) |
| RESERVED | Phòng đã được đặt trước | Tạo booking mới |

**Luồng chuyển đổi:**
```
AVAILABLE → RESERVED    (khi tạo Booking)
RESERVED  → OCCUPIED    (khi CHECKED_IN)
OCCUPIED  → AVAILABLE   (khi COMPLETED)
RESERVED  → AVAILABLE   (khi CANCELLED)
```

- Code thực hiện trong `BookingController.java` **dòng 110, 139, 142**
