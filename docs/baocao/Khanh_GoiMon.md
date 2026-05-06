# BÀI TẬP THỰC HÀNH - KHÁNH
## Module: Gọi món (Order Service)

**Phạm vi phụ trách:** Hiển thị menu, Giỏ hàng, Tạo order, Quản lý trạng thái order
**Trang FE:** `OrderPage.tsx`, `OrderManagement.tsx`
**Controller BE:** `OrderController.java`
**Bảng DB:** `tblOrder`, `tblOrderItem`, `tblProduct`

---

## Bài 1 - Trace luồng dữ liệu: Tạo order gọi món qua API

**Yêu cầu:** Trace từ lúc người dùng chọn món và nhấn "Gửi order" đến khi dữ liệu được lưu vào CSDL. Lưu ý: trang `OrderPage` hiện tại dùng mock data, nhưng backend đã có API hoàn chỉnh.

### Bước 1: File UI React - giao diện gọi món

**File:** `frontend/src/pages/OrderPage.tsx`

- **Dòng 2:** Import dữ liệu mock
```tsx
import { mockMenu } from '../data/mockData';
```

- **Dòng 16-25:** State giỏ hàng và hàm thêm vào cart
```tsx
const [cart, setCart] = useState<any[]>([]);

const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
        setCart([...cart, { ...product, qty: 1 }]);
    }
};
```

- **Dòng 27-35:** Hàm cập nhật số lượng
```tsx
const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
        if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
    }));
};
```

- **Dòng 41:** Tính tổng tiền
```tsx
const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
```

- **Dòng 126-137:** Nút "Gửi order" - **hiện tại chỉ alert, chưa gọi API**
```tsx
<button onClick={() => {
    if (cart.length === 0) alert('Giỏ hàng đang trống!');
    else {
        alert('Đã gửi Order xuống bếp/bar thành công!');
        setCart([]);
    }
}}>
    Gửi order
</button>
```

### Bước 2: Hàm gọi API (Backend đã có, Frontend cần kết nối)

Endpoint cần gọi: `POST /api/orders`

Body format:
```json
{
  "roomId": "P01",
  "items": [
    {"menuItemId": "SP001", "quantity": 3},
    {"menuItemId": "SP010", "quantity": 1}
  ]
}
```

Để kết nối, cần sửa nút "Gửi order" thành:
```tsx
const handleSendOrder = async () => {
    if (cart.length === 0) { alert('Giỏ hàng đang trống!'); return; }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                roomId: 'P01',
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.qty
                }))
            })
        });
        if (!res.ok) throw new Error('Tạo order thất bại');
        alert('Đã gửi order thành công!');
        setCart([]);
    } catch (err: any) {
        alert(err.message);
    }
};
```

### Bước 3: File Controller nhận request

**File:** `backend/src/main/java/com/karaoke/backend/web/OrderController.java`

- **Dòng 37:** `@RequestMapping("/api/orders")`
- **Dòng 73:** `@PostMapping` - tạo order mới
- **Dòng 103-126:** Hàm `create()` xử lý toàn bộ logic

### Bước 4: File xử lý logic (trong Controller)

**File:** `backend/src/main/java/com/karaoke/backend/web/OrderController.java`

**Dòng 103-126:** Hàm `create(@Valid @RequestBody CreateOrderRequest request)`

- **Dòng 104-105:** Tìm phòng
```java
Room room = rooms.findById(request.roomId())
    .orElseThrow(() -> new EntityNotFoundException("Room not found: " + request.roomId()));
```

- **Dòng 106-111:** Tạo ServiceOrder mới
```java
ServiceOrder order = new ServiceOrder();
order.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
order.setRoom(room);
order.setOrderedAt(LocalDateTime.now());
order.setStatus(OrderStatus.PENDING);
order.setItems(new ArrayList<>());
```

- **Dòng 113-124:** Loop qua từng item trong order
```java
for (CreateOrderItemRequest itemRequest : request.items()) {
    // Tìm MenuItem
    MenuItem menuItem = menuItems.findById(itemRequest.menuItemId())
            .orElseThrow(() -> new EntityNotFoundException("Menu item not found: " + itemRequest.menuItemId()));

    // Kiểm tra tồn kho
    if (menuItem.getStock() < itemRequest.quantity()) {
        throw new IllegalArgumentException("Not enough stock for " + menuItem.getName());
    }

    // Trừ tồn kho
    menuItem.setStock(menuItem.getStock() - itemRequest.quantity());
    menuItems.save(menuItem);

    // Tạo ServiceOrderItem
    ServiceOrderItem item = new ServiceOrderItem(null, order, menuItem, itemRequest.quantity(), menuItem.getPrice());
    order.getItems().add(item);
}
```

- **Dòng 125:** Lưu order vào database
```java
return OrderResponse.from(orders.save(order));
```

### Bước 5: File Repository thao tác CSDL

**File:** `backend/src/main/java/com/karaoke/backend/repository/ServiceOrderRepository.java`

```java
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, String> {
    @Override
    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
    List<ServiceOrder> findAll();                              // dòng 11-12

    @EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
    List<ServiceOrder> findByStatus(OrderStatus status);       // dòng 14-15
}
```

**File:** `backend/src/main/java/com/karaoke/backend/repository/MenuItemRepository.java`
- `findById()` → query `SELECT * FROM tblProduct WHERE id = ?`
- `save()` → UPDATE `tblProduct` SET stock = ? WHERE id = ?

### Bước 6: Entity ánh xạ bảng

**File:** `backend/src/main/java/com/karaoke/backend/domain/ServiceOrder.java`

```java
@Entity
@Table(name = "tblOrder")          // dòng 22
public class ServiceOrder {
    @Id
    private String id;                          // PK, ví dụ "ORD-A1B2C3D4"

    @ManyToOne
    private Room room;                          // FK → tblRoom

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceOrderItem> items;       // danh sách món trong order

    private LocalDateTime orderedAt;            // thời gian đặt

    @Enumerated(EnumType.STRING)
    private OrderStatus status;                 // PENDING, PREPARING, SERVED
}
```

**File:** `backend/src/main/java/com/karaoke/backend/domain/ServiceOrderItem.java`

```java
@Entity
@Table(name = "tblOrderItem")       // dòng 19
public class ServiceOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                            // PK tự tăng

    @JsonIgnore
    @ManyToOne
    private ServiceOrder order;                 // FK → tblOrder (ẩn trong JSON)

    @ManyToOne
    private MenuItem menuItem;                  // FK → tblProduct

    private int quantity;                       // số lượng
    private BigDecimal unitPrice;               // giá tại thời điểm đặt
}
```

**File:** `backend/src/main/java/com/karaoke/backend/domain/MenuItem.java`

```java
@Entity
@Table(name = "tblProduct")         // dòng 15
public class MenuItem {
    @Id
    private String id;                        // PK, ví dụ "SP001"
    private String name;                      // "Bia Tiger"
    private String category;                  // "Đồ uống", "Đồ ăn", "Trái cây"
    private BigDecimal price;                 // 30000
    private int stock;                        // 45 (tồn kho)
    private String image;                     // "/images/beer.png"
    private boolean active = true;
}
```

**Tổng kết flow:**
```
OrderPage.tsx (nút "Gửi order")
  → fetch POST /api/orders {roomId, items[{menuItemId, quantity}]}
    → OrderController.create() (dòng 103)
      → RoomRepository.findById(roomId)           // tìm phòng
      → MenuItemRepository.findById(menuItemId)   // tìm món
      → Kiểm tra stock >= quantity                // kiểm tra tồn kho
      → MenuItem.setStock(stock - quantity)        // trừ tồn kho
      → ServiceOrderRepository.save(order)         // lưu order + items
    ← trả JSON {id, roomId, roomName, orderedAt, status, items[]}
  ← alert thành công, xóa giỏ hàng
```

---

## Bài 2 - Sửa lỗi có chủ đích

### Lỗi QA tạo ra

**File:** `backend/src/main/java/com/karaoke/backend/web/OrderController.java`
**Dòng 116:** Đổi phép so sánh tồn kho từ `<` thành `>`

**Trước (đúng):**
```java
if (menuItem.getStock() < itemRequest.quantity()) {
    throw new IllegalArgumentException("Not enough stock for " + menuItem.getName());
}
```

**Sau (sai):**
```java
if (menuItem.getStock() > itemRequest.quantity()) {
    throw new IllegalArgumentException("Not enough stock for " + menuItem.getName());
}
```

### Log lỗi sẽ hiển thị

**Trường hợp 1: Đặt hàng bình thường (stock ĐỦ)**
- Ví dụ: Bia Tiger stock = 45, order 3 chai
- `45 > 3` = `true` → throw `"Not enough stock for Bia Tiger"`
- Backend: HTTP 400, message: `"Not enough stock for Bia Tiger"`
- Frontend: Hiển thị lỗi, KHÔNG cho đặt dù tồn kho đủ

**Trường hợp 2: Đặt hàng quá số lượng (stock KHÔNG ĐỦ)**
- Ví dụ: Chivas 18 stock = 5, order 10 chai
- `5 > 10` = `false` → cho phép order
- `menuItem.setStock(5 - 10)` → stock = **-5** (âm!)
- Lưu thành công nhưng dữ liệu tồn kho bị sai

### Các bước Learner debug

1. Mở Swagger UI: `http://localhost:8080/swagger-ui.html`
2. Gọi `POST /api/orders` với body:
```json
{
  "roomId": "P01",
  "items": [{"menuItemId": "SP001", "quantity": 3}]
}
```
3. Nhận lỗi: `"Not enough stock for Bia Tiger"` dù SP001 có stock = 45
4. Đặt breakpoint tại `OrderController.java` **dòng 116**
5. Debug: `menuItem.getStock()` = 45, `itemRequest.quantity()` = 3
6. `45 > 3` = `true` → ném exception
7. **Nhận ra:** Phép so sánh bị đảo. Logic đúng là: "nếu tồn kho **NHỎ HƠN** số lượng đặt → báo hết hàng"
8. **Sửa:** Đổi `>` thành `<`
9. Kiểm tra thêm: gọi với `menuItemId = "SP005"` (Chivas, stock=5), quantity=10 → phải throw exception

---

## Bài 3 - Tinh chỉnh UI và Vấn đáp

### Task chỉnh sửa UI

**File:** `frontend/src/pages/OrderPage.tsx`

**Yêu cầu:** Đổi text và màu sắc nút "Gửi order" thành "Gửi xuống bếp" với màu xanh lá

**Dòng 133-136, sửa thành:**
```tsx
<button
    onClick={() => {
        if (cart.length === 0) alert('Giỏ hàng đang trống!');
        else { alert('Đã gửi Order xuống bếp/bar thành công!'); setCart([]); }
    }}
    className="w-full py-3 bg-status-available text-white rounded-lg font-body-md font-semibold hover:bg-green-600 transition-colors"
>
    Gửi xuống bếp
</button>
```

**Thay đổi:**
- Text: `"Gửi order"` → `"Gửi xuống bếp"`
- Màu: `bg-primary-container text-on-primary-container` → `bg-status-available text-white`
- Hover: `hover:bg-primary` → `hover:bg-green-600`

### 5 câu hỏi chất vấn

---

**Câu 1:** Trang `OrderPage` hiện tại lấy dữ liệu menu từ đâu? Dữ liệu mock nằm ở file nào? Khi nào cần kết nối API backend?

**Đáp án chi tiết:**
- `OrderPage.tsx` **dòng 2:** `import { mockMenu } from '../data/mockData'`
- `mockData.ts` **dòng 27-38:** Mảng `mockMenu` gồm 10 sản phẩm:
```typescript
export const mockMenu = [
    { id: 'SP001', name: 'Bia Tiger', cat: 'Đồ uống', price: 30000, stock: 45, ... },
    { id: 'SP002', name: 'Bia Heineken', cat: 'Đồ uống', price: 35000, stock: 32, ... },
    // ... tổng cộng 10 món
];
```
- Backend đã có `GET /api/menu-items` (`MenuItemController.java` dòng 260-278) trả dữ liệu thật
- Cần kết nối API khi muốn dữ liệu đồng bộ với database (tồn kho thay đổi realtime sau mỗi order)

---

**Câu 2:** Khi tạo order, hệ thống kiểm tra tồn kho như thế nào? Nếu không đủ thì phản hồi gì cho người dùng? Chỉ ra toàn bộ chuỗi xử lý từ controller đến exception handler.

**Đáp án chi tiết:**
- `OrderController.java` **dòng 116-118:**
```java
if (menuItem.getStock() < itemRequest.quantity()) {
    throw new IllegalArgumentException("Not enough stock for " + menuItem.getName());
}
```
- `ApiExceptionHandler.java` **dòng 21-23:** Bắt `IllegalArgumentException` → trả HTTP 400
```java
@ExceptionHandler(IllegalArgumentException.class)
ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) {
    return error(HttpStatus.BAD_REQUEST, ex.getMessage());
}
```
- Response body: `{"timestamp":"...", "status":400, "error":"Bad Request", "message":"Not enough stock for Bia Tiger"}`

---

**Câu 3:** `ServiceOrder` và `ServiceOrderItem` có quan hệ gì? Giải thích `cascade` và `orphanRemoval`. Tại sao `@JsonIgnore` cần thiết trên `ServiceOrderItem.order`?

**Đáp án chi tiết:**
- `ServiceOrder.java` **dòng 30-31:**
```java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ServiceOrderItem> items;
```
- **`cascade = CascadeType.ALL`:** Khi save/xóa ServiceOrder, tất cả ServiceOrderItem cũng được save/xóa theo
- **`orphanRemoval = true`:** Khi xóa 1 item khỏi list `items`, bản ghi đó cũng bị xóa trong DB
- `ServiceOrderItem.java` **dòng 24-25:**
```java
@JsonIgnore
@ManyToOne
private ServiceOrder order;
```
- **`@JsonIgnore`:** Nếu không có, khi serialize ServiceOrder → JSON sẽ lặp vô hạn: Order → Items → Order → Items → ... StackOverflowError

---

**Câu 4:** Trang `OrderManagement` và `OrderPage` khác nhau về mục đích sử dụng như thế nào? Mỗi trang hiển thị thông tin gì?

**Đáp án chi tiết:**
- **`OrderPage.tsx`** (trang GỌI MÓN cho khách/nhân viên):
  - Hiển thị danh sách sản phẩm từ `mockMenu` (dòng 10)
  - Cho phép tìm kiếm (dòng 5), lọc theo category (dòng 64-73)
  - Có giỏ hàng (dòng 102-138), nút thêm/xóa/sửa số lượng
  - Nút "Gửi order" tạo order mới

- **`OrderManagement.tsx`** (trang QUẢN LÝ cho bếp/bar):
  - Hiển thị danh sách order đã tạo từ `mockOrders` (dòng 11)
  - Lọc theo phòng (dòng 9), trạng thái (dòng 40-50), ngày (dòng 54-60)
  - Có nút "Xong" (dòng 92-97) để đánh dấu hoàn thành: `handleComplete` đổi status thành "Đã phục vụ"
  - Hiển thị luồng: Chờ xử lý → Đang làm → Đã phục vụ (dòng 104)

---

**Câu 5:** `@EntityGraph` trong `ServiceOrderRepository` có tác dụng gì? Nếu không có nó thì hiệu suất sẽ như thế nào?

**Đáp án chi tiết:**
- `ServiceOrderRepository.java` **dòng 11-12:**
```java
@EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
List<ServiceOrder> findAll();
```
- **Tác dụng:** Load EAGER tất cả quan hệ trong 1 câu query JOIN duy nhất
- **Nếu KHÔNG có `@EntityGraph`:** JPA dùng LAZY loading mặc định
  - 1 query lấy danh sách orders
  - N query lấy room cho mỗi order (N+1)
  - N query lấy items cho mỗi order
  - N query lấy menuItem cho mỗi item
  - Tổng: 1 + 3N query (với N orders) → rất chậm khi có nhiều order
- **Với `@EntityGraph`:** 1 query JOIN duy nhất → hiệu suất tốt hơn nhiều
