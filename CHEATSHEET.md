# CHEATSHEET VẤN ĐÁP — Hệ thống Quản lý Chuỗi Karaoke Famtaoke
> Tài liệu UP (mọi pha theo skill cnpm) · OOP codebase · Câu hỏi + câu trả lời

---

## PHẦN 1: TỔNG QUAN DỰ ÁN

### Q1. Hệ thống này giải quyết bài toán gì?

Quản lý tập trung chuỗi nhà hàng karaoke nhiều chi nhánh. Trước đây mỗi chi nhánh quản lý độc lập (Excel, sổ tay) → thiếu nhất quán, chủ doanh nghiệp không có báo cáo tổng hợp. Hệ thống cung cấp một nền tảng web để quản lý đặt phòng, gọi món, kho hàng, nhân sự và báo cáo cho toàn chuỗi.

### Q2. Hệ thống có bao nhiêu actor? Liệt kê và vai trò.

5 actor cụ thể + 2 actor trừu tượng:

| Actor | Loại | Vai trò |
|-------|------|---------|
| Khách hàng | Cụ thể | Đặt phòng trực tuyến, gọi món, quản lý tài khoản cá nhân |
| Nhân viên lễ tân | Cụ thể | Đặt phòng tại quầy, check-in, check-out, thanh toán |
| Nhân viên phục vụ | Cụ thể | Nhận và xử lý order gọi món, báo cáo hàng hóa |
| Quản lý chi nhánh | Cụ thể | Quản lý nhân sự, kho, menu, phòng hát, xem báo cáo chi nhánh |
| Chủ doanh nghiệp | Cụ thể | Quản lý toàn chuỗi, xem báo cáo tổng hợp |
| Thành viên | Trừu tượng | Cha của tất cả actor (login, đổi mật khẩu) |
| Nhân viên | Trừu tượng | Cha của NV lễ tân + NV phục vụ |

### Q3. Có bao nhiêu Use Case? Phân bổ theo module.

20 UC (UC01–UC21, bỏ UC09):

| Module | UC | Tên |
|--------|----|-----|
| Tài khoản | UC01–04, UC20 | Đăng nhập, Đăng ký, Đổi MK, Quản lý TTCN, Quản lý tài khoản NV |
| Đặt phòng | UC05, UC07, UC08 | Đặt phòng, Check-in (QL đặt phòng), Check-out (QL trả phòng) |
| Dịch vụ | UC06, UC10, UC12, UC15 | Gọi món/Quản lý order, Báo cáo hàng hóa, Quản lý kho, Quản lý menu |
| Quản trị cốt lõi | UC16–19 | Quản lý chi nhánh, Quản lý KH, Quản lý hạng HV, Quản lý phòng hát |
| Nhân sự | UC11, UC13, UC14, UC21 | Quản lý NV, Báo cáo chi nhánh, Xem thông tin KH, Tổng hợp báo cáo |

### Q4. Tại sao bỏ UC09?

UC09 (Kiểm kê hàng tại quầy) bị loại — chức năng này được tích hợp vào UC10 (Báo cáo tình trạng hàng hóa) và UC12 (Quản lý kho).

---

## PHẦN 2: PHA I — REQUIREMENTS (I.1 Mô hình nghiệp vụ UML)

### Q5. I.1 gồm những gì?

Pha I của mỗi module gồm:
- **Biểu đồ UC tổng quan module** — actor + UC + quan hệ Include/Extend/Generalization
- **Mô tả từng UC** — bảng 2 cột: Use Case / Actor / Tiền điều kiện / Hậu điều kiện / Mô tả ngắn

Biểu đồ UC module là biểu đồ con của biểu đồ UC toàn hệ thống, giữ nguyên mã UC (UC01, UC02...) không đổi alias.

### Q6. 3 loại quan hệ trong biểu đồ UC.

| Quan hệ | Ký hiệu PlantUML | Ý nghĩa | Ví dụ trong dự án |
|---------|-----------------|---------|------------------|
| **Include** | `UC1 ..> UC2 : <<include>>` | UC cha **bắt buộc** gọi UC con mỗi lần | UC01 Đăng nhập include Xác thực thông tin |
| **Extend** | `UC2 ..> UC1 : <<extend>>` | UC con **tuỳ chọn** mở rộng UC cha khi có điều kiện | UC05 extend Hủy phòng trực tuyến |
| **Generalization** | `UC_con <\|-- UC_cha` | UC con kế thừa hành vi UC cha | "Tìm theo tên" + "Tìm theo mã" là con của "Tìm kiếm" |

Quy tắc PlantUML bắt buộc: `left to right direction`, `skinparam linetype ortho`, UC con trong cùng package không chồng chéo.

### Q7. Mô tả luồng UC01 – Đăng nhập (theo format kịch bản I.1).

**Actor:** Thành viên (Khách hàng / NV / Admin)  
**Tiền điều kiện:** Tài khoản đã tồn tại trong hệ thống  
**Hậu điều kiện:** Phiên đăng nhập được tạo, chuyển vào trang chính tương ứng vai trò  

Luồng chính: Thành viên mở trang đăng nhập → nhập username/email + mật khẩu → nhấn Đăng nhập → hệ thống kiểm tra credentials → tạo LoginSession → chuyển trang chính.  
Ngoại lệ: sai mật khẩu → thông báo lỗi, cho nhập lại; vượt N lần → khóa tài khoản tạm thời.

### Q8. UC05 – Đặt phòng có 2 luồng actor. Mô tả.

**Luồng 1 — Khách hàng trực tuyến:** Khách đăng nhập → chọn chi nhánh → chọn loại phòng → chọn khung giờ → hệ thống kiểm tra phòng trống → xác nhận đặt → ghi Booking (PENDING) → cập nhật Room (RESERVED).

**Luồng 2 — Lễ tân tại quầy:** Lễ tân tìm/tạo tài khoản khách → chọn phòng trống → chọn giờ → tạo Booking (CONFIRMED trực tiếp) → Room (RESERVED).

### Q9. UC06 – Gọi món có mấy actor? Tại sao cùng 1 UC?

2 actor: **Khách hàng** (đặt món qua app trong phòng) và **NV phục vụ** (nhận order miệng, nhập thay khách). Cùng 1 UC vì nghiệp vụ giống nhau — hệ thống xử lý giống nhau, chỉ khác giao diện tiếp cận.

### Q10. Biểu đồ UC toàn hệ thống (tab XÁC ĐỊNH YÊU CẦU mục 3.3) khác biểu đồ UC module (I.1) như thế nào?

| | UC toàn hệ thống (3.3) | UC module (I.1) |
|--|----------------------|----------------|
| Phạm vi | Tất cả 20 UC, tất cả 7 actor | Chỉ UC của 1 module + actor liên quan |
| Mức độ | Tổng quan, không có Include/Extend chi tiết | Chi tiết, đầy đủ Include/Extend/Generalization |
| Vị trí | Tab XÁC ĐỊNH YÊU CẦU | Tab từng module |

---

## PHẦN 3: PHA II — PHÂN TÍCH

### Q11. II.1 – Mô hình hóa chức năng: cấu trúc bảng gồm gì?

Mỗi UC có 1 bảng 2 cột với 6 trường bắt buộc theo thứ tự:

| Trường | Yêu cầu |
|--------|---------|
| **Use case** | Tên UC |
| **Actor** | Tên actor thực hiện |
| **Tiền điều kiện** | Điều kiện phải đúng TRƯỚC khi UC bắt đầu |
| **Hậu điều kiện** | Trạng thái hệ thống SAU khi UC thành công |
| **Kịch bản chính** | Danh sách đánh số, mỗi bước nguyên tử; khi hệ thống hiển thị danh sách → **dùng HTML table inline** (KHÔNG dùng bullet) với dữ liệu mẫu thực tế |
| **Ngoại lệ** | Đánh số theo bước rẽ nhánh (VD: bước 6 fail → 6. / 6.1 / 6.2 ...) |

### Q12. II.1 – Tại sao phải dùng HTML table trong kịch bản? Cho ví dụ.

Quy tắc: khi hệ thống **hiển thị dữ liệu có cấu trúc** (danh sách phòng, danh sách order, kết quả tìm kiếm...) phải dùng HTML table inline — không được dùng bullet liệt kê tên cột.

❌ SAI: `6. Hệ thống hiển thị danh sách phòng: Mã, Tên, Giá, Loại`

✅ ĐÚNG:
```
6. Hệ thống hiển thị danh sách phòng:
<table><tr><th>Mã</th><th>Tên</th><th>Giá/giờ</th><th>Loại</th></tr>
<tr><td>P01</td><td>VIP 01</td><td>200.000</td><td>VIP</td></tr>
<tr><td>P04</td><td>Phòng 04</td><td>120.000</td><td>Thường</td></tr></table>
```
Mã xuất hiện trong bảng (P01) phải được dùng lại chính xác ở bước sau ("Lễ tân chọn dòng P01").

### Q13. II.2 – Mô hình hóa lớp: 5 bước noun extraction.

**Bước 1:** Viết lại toàn bộ luồng hoạt động module thành đoạn văn xuôi liên tục.

**Bước 2+3:** Liệt kê từng danh từ + đánh giá:
- **Loại** (lý do): "hệ thống" → quá chung; "danh sách" → không phải thực thể; "giao diện" → là Boundary, không phải Entity
- **Giữ thành lớp Entity**: ghi tên lớp + thuộc tính sơ bộ (VD: `Booking: ngày đặt, trạng thái`)
- **Giữ thành thuộc tính**: ghi rõ thuộc tính của lớp nào

**Bước 4:** Xác định cardinality giữa các thực thể:
- **1-1**: có thể gộp lại hoặc giữ riêng
- **1-n**: giữ nguyên (VD: Branch – Room: 1-n)
- **n-n**: phải đề xuất **lớp trung gian** (VD: Client – Room là n-n → Booking ở giữa)

**Bước 5:** Bổ sung quan hệ mới phát sinh (composition, aggregation).

**Biểu đồ thực thể II.2**: chỉ có tên lớp, thuộc tính sơ bộ, quan hệ — **CHƯA có phương thức, CHƯA có kiểu dữ liệu cụ thể**.

### Q14. II.2 – Phân biệt Composition và Aggregation.

| | Composition (◆) | Aggregation (◇) |
|--|----------------|----------------|
| Phụ thuộc | Con KHÔNG tồn tại độc lập | Con có thể tồn tại độc lập |
| Khi xóa cha | Con bị xóa theo | Con vẫn còn |
| Ví dụ | Order ◆ OrderDetail | OrderDetail ◇ Product |
| PlantUML | `Order "1" *-- "n" OrderDetail` | `OrderDetail "n" o-- "1" Product` |

Quy tắc với n-n qua lớp trung gian: Lớp cha `composition` với trung gian; trung gian `aggregation` với lớp con.

### Q15. II.3 – Sơ đồ lớp phân tích (BCE) gồm những gì?

Sơ đồ lớp II.3 thêm 2 tầng so với II.2:
- **Boundary**: lớp giao tiếp với actor (LoginPage, RegisterPage, OrderPage...)
- **Control**: lớp xử lý nghiệp vụ (AuthController, BookingController...)
- **Entity**: lớp dữ liệu từ II.2 (User, Room, Booking...)

**Ngôn ngữ**: tiếng Việt tự nhiên cho tên phương thức — `kiemTraMatKhau()`, `timPhongTrong()` — CHƯA có kiểu dữ liệu Java cụ thể, CHƯA có DAO.

Ví dụ module Tài khoản:
```
Boundary: LoginPage, RegisterPage, OTPVerifyPage, ChangePasswordPage, ProfilePage, StaffManagePage
Control:  AuthController, ProfileController, StaffController
Entity:   User, Client, Employee, OTP, LoginSession, MembershipTier
```

### Q16. II.4 – Biểu đồ tuần tự phân tích: kịch bản phiên bản 2 là gì?

Diễn giải tuần tự bằng **tiếng Việt tự nhiên**, thứ tự tương tác Actor → Boundary → Control → Entity. Thông điệp là mô tả hành vi, chưa có tên hàm Java:

```
1. Thành viên nhập username/email và mật khẩu vào LoginPage
2. LoginPage gửi thông tin đăng nhập sang AuthController
3. AuthController gọi User để kiểm tra username/email
4. User trả về bản ghi người dùng cho AuthController
5. AuthController kiểm tra mật khẩu có khớp không
6. Nếu khớp: AuthController yêu cầu LoginSession tạo phiên mới
7. AuthController trả kết quả thành công về LoginPage
8. LoginPage hiển thị trang chính tương ứng vai trò
```

Participants xếp theo thứ tự: **Actor → Boundary → Control → Entity**. Dùng `alt` cho ngoại lệ.

### Q17. II.3 khác II.2 và III.3.2 ở điểm nào?

| | II.2 (Thực thể) | II.3 (Phân tích BCE) | III.3.2 (Thiết kế) |
|--|----------------|---------------------|------------------|
| Lớp có | Entity | Boundary + Control + Entity | Boundary + DAO + Entity |
| Phương thức | Không | Tiếng Việt sơ bộ | Tên hàm Java + kiểu |
| Kiểu dữ liệu | Không | Không | Java đầy đủ (String, int...) |
| DAO | Không | Không | Có (RoomDAO, UserDAO...) |

---

## PHẦN 4: PHA III — THIẾT KẾ

### Q18. III.1 – Thiết kế lớp thực thể: 4 bước bắt buộc.

Input: biểu đồ thực thể từ II.2.

**Bước 1:** Thêm thuộc tính `id: int` cho các lớp không kế thừa từ lớp khác.

**Bước 2:** Bổ sung **kiểu dữ liệu Java** cụ thể cho tất cả thuộc tính:
```
User: id: int, username: String, email: String, passwordHash: String, role: String
Room: id: int, name: String, hourlyPrice: double, status: String, capacity: int
Booking: id: int, startTime: Date, endTime: Date, guestCount: int, status: String
```

**Bước 3:** Chuyển `association` → `composition` hoặc `aggregation`:
- `Booking "1" *-- "n" OrderDetail` (composition: OrderDetail không tồn tại không có Booking)
- `OrderDetail "n" o-- "1" Product` (aggregation: Product tồn tại độc lập)

**Bước 4:** Bổ sung **thuộc tính kiểu đối tượng**:
```
Booking: client: Client, room: Room, dsOrder: Order[]
Order:   room: Room, dsOrderDetail: OrderDetail[]
```

### Q19. III.2 – Thiết kế CSDL: convention đặt tên bảng và cột.

- **Tên bảng**: tiền tố `tbl` + tên entity (VD: `tblUser`, `tblRoom`, `tblBooking`, `tblOrder`)
- **Khóa chính (PK)**: `tbl[Tên]Ma` — kiểu int auto-increment hoặc String manual
- **Khóa ngoại (FK)**: `tbl[TênBảngCha]Ma` — là cột FK trỏ sang bảng cha
- **Quan hệ n-n**: bảng trung gian `tbl[A][B]` với 2 FK (VD: `tblOrderDetail`: FK `tblOrderMa` + `tblProductMa`)

Các bảng chính trong hệ thống karaoke:

| Bảng | Entity | PK |
|------|--------|----|
| tblUser | User / Client / Employee (gộp single-table) | String id |
| tblBranch | Branch | String id |
| tblRoom | Room | String id |
| tblRoomType | RoomType | String id |
| tblBooking | Booking | String id |
| tblProduct | Product (MenuItem) | String id |
| tblOrder | Order | String id |
| tblOrderDetail | OrderDetail | Long id (auto) |
| tblRoomReceipt | RoomReceipt (Invoice) | String id |
| tblMembershipTier | MembershipTier | String id |
| tblOTP | Otp | Long id |
| tblLoginSession | LoginSession | Long id |

### Q20. III.2 – Tại sao tblUser gộp User + Client + Employee (Single-Table Inheritance)?

User, Client, Employee có nhiều thuộc tính chung (id, email, password, role). Gộp vào 1 bảng `tblUser` với cột `role` (CLIENT / EMPLOYEE / ADMIN) để phân biệt loại. Thuộc tính riêng (điểm tích lũy của Client, chi nhánh của Employee) để NULL với các loại không áp dụng. Lợi ích: không cần JOIN phức tạp khi xác thực, truy vấn đơn giản.

### Q21. III.3.1 – Wireframe: format nào? Ví dụ màn hình đặt phòng.

Dùng ASCII box diagram, mô tả đầy đủ các thành phần UI. Ví dụ màn hình tạo booking:

```
┌──────────────────────────────────────────────┐
│  Đặt phòng mới                               │
│                                              │
│  Khách hàng: [____________________▼]         │
│  Chi nhánh:  [____________________▼]         │
│  Phòng:      [____________________▼]         │
│  Bắt đầu:    [2026-06-02  19:00  ]           │
│  Kết thúc:   [2026-06-02  21:00  ]           │
│  Số khách:   [___]                           │
│                                              │
│           [Hủy]    [Đặt phòng]               │
└──────────────────────────────────────────────┘
```

Số màn hình wireframe phải ≥ số UC trong module (mỗi UC cần ít nhất 1 màn hình).

### Q22. III.3.2 – Sơ đồ lớp thiết kế (MVC): thành phần và ví dụ.

Dự án dùng **React + Spring Boot MVC** nên kiến trúc:
```
Boundary (React Component) → Control (@RestController) → Entity (@Entity JPA)
```

Mỗi `@RestController` thay thế cho cả Control lẫn DAO (Spring Data JPA tự generate SQL). Tên hàm theo RESTful CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`.

Boundary là React component — tên theo hậu tố:

| Hậu tố | Ví dụ | Loại |
|--------|-------|------|
| `Page` | `BookingPage` | Trang gắn route |
| `Form` | `OrderForm` | Vùng nhập liệu |
| `Table` | `RoomListTable` | Bảng dữ liệu |
| `Modal` | `CheckoutModal` | Hộp thoại |
| `Card` | `RoomCard` | Ô trong danh sách |

Ví dụ module Đặt phòng:
```
Boundary: BookingPage, BookingForm, BookingManagement, BookingTable
Control:  BookingController (getAll, create, updateStatus)
Entity:   Booking, Client, Room
```

### Q23. III.3.2 – Bảng chữ ký hàm Controller: ví dụ từ BookingController.

| Phương thức | HTTP | Endpoint | Input (Request) | Output |
|------------|------|----------|-----------------|--------|
| `list()` | GET | `/api/bookings` | `?status=CONFIRMED` | `List<Booking>` |
| `create()` | POST | `/api/bookings` | `CreateBookingRequest(clientId, roomId, startTime, endTime, guestCount)` | `Booking` |
| `updateStatus()` | PUT | `/api/bookings/{id}/status` | `UpdateStatusRequest(status: CHECKED_IN)` | `Booking` |

### Q24. III.4 – Biểu đồ tuần tự thiết kế: kịch bản phiên bản 3.

Dùng **tên hàm Java đầy đủ + kiểu dữ liệu**, thông điệp là method calls thực tế:

```
1.  LoginPage.handleSubmit(username: String, password: String)
2.  LoginPage → POST /api/auth/login (fetch)
3.  AuthController.login(request: LoginRequest): AuthResponse
4.  AuthController → UserRepository.findByUsername(username: String): Optional<User>
5.  AuthController → BCryptPasswordEncoder.matches(raw: String, hash: String): boolean
6.  [alt thành công]
7.    AuthController → LoginSessionRepository.save(session: LoginSession): LoginSession
8.    AuthController return AuthResponse.from(user): AuthResponse
9.    LoginPage: localStorage.setItem("token", token)
10. [alt thất bại]
11.   AuthController throw IllegalArgumentException("Sai mật khẩu")
12.   ApiExceptionHandler → 400 Bad Request { message: "Sai mật khẩu" }
```

Participants: **Actor → Boundary → Control → Repository → Entity**

### Q25. III.4 – Khác biệt ngôn ngữ giữa phân tích (II.4) và thiết kế (III.4).

| | II.4 Phân tích | III.4 Thiết kế |
|--|---------------|---------------|
| Thông điệp | Tiếng Việt tự nhiên | Tên hàm Java + kiểu dữ liệu |
| VD | "LoginPage gửi thông tin sang AuthController" | `AuthController.login(req: LoginRequest): AuthResponse` |
| Participants | Actor, Boundary, Control, Entity | Actor, Boundary, Controller, Repository, Entity |
| Ngoại lệ | "Nếu sai mật khẩu: hệ thống thông báo lỗi" | `throw IllegalArgumentException("Sai mật khẩu")` |

---

## PHẦN 5: PHA IV — KIỂM THỬ

### Q26. IV – Kế hoạch kiểm thử có 4 mục theo skill cnpm.

**4a. Bảng Test Case tổng hợp** — liệt kê ngắn gọn:

| TT | Module | Test case |
|----|--------|-----------|
| 1 | Tài khoản | Đăng nhập đúng credentials → vào trang chính |
| 2 | Tài khoản | Đăng nhập sai mật khẩu → thông báo lỗi |
| 3 | Đặt phòng | Đặt phòng trống → Booking tạo thành công |
| 4 | Đặt phòng | Đặt phòng đã OCCUPIED → từ chối, thông báo lỗi |
| ... | | |

**4b. Trạng thái CSDL trước test** — dữ liệu mẫu đủ để chạy TC:
```
tblUser
| id     | username | passwordHash | role   |
|--------|----------|-------------|--------|
| USR001 | admin    | $2a$...     | ADMIN  |

tblRoom
| id  | name  | status    | hourlyPrice |
|-----|-------|-----------|-------------|
| P01 | VIP 01| AVAILABLE | 200000      |
```

**4c. Kịch bản thực hiện + Kết quả mong đợi**:

| Kịch bản | Kết quả mong đợi |
|----------|-----------------|
| 1. Mở `/login` | Hiển thị form đăng nhập |
| 2. Nhập username="admin", password="admin123" → nhấn Đăng nhập | Redirect `/`, hiển thị Dashboard |
| 3. LocalStorage.token = "dev-token-USR001" | Token được lưu |

**4d. Trạng thái CSDL sau test**:
```
tblLoginSession (sau test)
| id | userId | createdAt           |
|----|--------|---------------------|
| 1  | USR001 | 2026-06-02T19:00:00 | ← hàng mới
```

### Q27. Test case cần phủ những gì?

- **Happy path**: đầu vào hợp lệ → thành công
- **Failure path**: đầu vào sai → thông báo lỗi đúng
- **Edge case**: input rỗng, giá trị biên (0, -1, max length), trùng lặp (username đã tồn tại, đặt phòng đã có người)
- **Mỗi UC cần ≥1 TC thành công + ≥1 TC thất bại**

---

## PHẦN 6: OOP — CODEBASE KARAOKE

### Q28. 4 tính chất OOP thể hiện trong codebase.

**1. Encapsulation (Đóng gói)**
- Tất cả field Entity là `private`, truy cập qua getter/setter (Lombok `@Data`)
- `User.passwordHash` chỉ được encode khi tạo, verify khi login — không expose raw

**2. Inheritance (Kế thừa)**
- `TokenAuthenticationFilter extends OncePerRequestFilter`
- Mọi repository `extends JpaRepository<Entity, IdType>` — kế thừa 30+ CRUD method
- Tài liệu: User ← {Client, Employee} (single-table inheritance, `role` phân biệt)

**3. Polymorphism (Đa hình)**
- `ApiExceptionHandler`: 3 `@ExceptionHandler` method khác nhau cùng gọi private `error()` — dispatch theo runtime type của exception
- `JpaRepository.save()` hoạt động đúng với mọi Entity type
- `PasswordEncoder` interface → Spring inject `BCryptPasswordEncoder` runtime

**4. Abstraction (Trừu tượng hóa)**
- `JpaRepository<T, ID>` interface — ẩn SQL hoàn toàn, gọi `findById()`, `save()`
- `PasswordEncoder` interface — code không phụ thuộc BCrypt implementation
- React `ProtectedRoute` — ẩn logic check token, chỉ wrap route

### Q29. Repository Pattern — giải thích và ví dụ.

Tách biệt business logic khỏi data access. Spring Data JPA tự generate implementation từ interface:

```java
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByStatus(BookingStatus status);  // method naming → SELECT WHERE status=?
    List<Booking> findByRoomId(String roomId);
}
```

Trong Controller không cần biết SQL — chỉ gọi `bookings.save(booking)`, `bookings.findByStatus(CONFIRMED)`.

### Q30. @Transactional — ví dụ BookingController.create().

```java
@Transactional
Booking create(CreateBookingRequest req) {
    Client client = clients.findById(req.clientId())...;  // 1
    Room room = rooms.findById(req.roomId())...;           // 2
    Booking booking = new Booking(...);                    // 3
    return bookings.save(booking);                         // 4
}
```

Nếu bước 4 fail → rollback toàn bộ: không có booking orphan trong DB. Tương tự `updateStatus()`: check-in booking + room OCCUPIED là 1 transaction — không thể booking CHECKED_IN mà phòng vẫn AVAILABLE.

### Q31. @JsonIgnore trên OrderDetail.order — tại sao?

`Order @OneToMany → items[]`, mỗi `OrderDetail @ManyToOne → order`. Khi Jackson serialize:
```
Order → items → OrderDetail → order → Order → items → ... → StackOverflowError
```
`@JsonIgnore` trên `OrderDetail.order` ngắt vòng lặp khi serialize về phía OrderDetail.

### Q32. N+1 Query Problem và cách dự án xử lý.

N+1: load 10 Order → N query cho room, N query cho items, N cho branch... → 31+ queries.

`@EntityGraph` fetch tất cả trong 1 JOIN:
```java
@EntityGraph(attributePaths = {"room", "room.branch", "items", "items.menuItem"})
List<Order> findAll();
```

### Q33. Java Records cho DTO — tại sao?

Records (Java 16+) là immutable value objects — tự generate constructor, getters, equals/hashCode/toString:
```java
record RegisterRequest(
    @NotBlank String username,
    @Email String email,
    @NotBlank @Size(min = 6) String password,
    UserRole role
) {}
```
Ngắn gọn hơn class thông thường 60-70%. Không thể thay đổi sau tạo → thread-safe.

### Q34. Luồng xác thực đầy đủ (Auth Flow).

```
1. POST /api/auth/login { username, password }
2. AuthController: UserRepository.findByUsername() → User
3. BCryptPasswordEncoder.matches(raw, hash) → true/false
4. Nếu true: return AuthResponse { token: "dev-token-USR001" }
5. Frontend: localStorage.setItem("token", "dev-token-USR001")
6. Request sau: Header "Authorization: Bearer dev-token-USR001"
7. TokenAuthenticationFilter.doFilterInternal():
   - Extract "dev-token-USR001" từ header
   - Strip "dev-token-" → userId = "USR001"
   - UserRepository.findById("USR001") → User
   - Set SecurityContextHolder (authentication)
8. SecurityConfig kiểm tra role cho endpoint
```

### Q35. Tại sao Dev-Token thay vì JWT?

Dev-Token đơn giản: `dev-token-<ID>` chứa user ID plain text, server chỉ lookup DB. Không cần JWT library, signing keys, expiration handling.

**Nhược điểm**: không secure — ai biết ID là giả mạo được. Production: JWT signed (secret key) + expiration (access 15 phút + refresh 7 ngày).

### Q36. SecurityConfig — các quyết định thiết kế.

```java
.csrf(disable)                    // REST API stateless → không cần CSRF
.sessionManagement(STATELESS)     // Không lưu session → scale được
.authorizeHttpRequests(auth ->
    .requestMatchers("/api/auth/**").permitAll()     // Login/Register công khai
    .requestMatchers("/api/reports/**").hasRole("ADMIN")  // Báo cáo chỉ admin
    .anyRequest().authenticated())                  // Còn lại cần đăng nhập
```

### Q37. Enum và State Machine trong dự án.

| Enum | Luồng trạng thái |
|------|----------------|
| `BookingStatus` | PENDING → CONFIRMED → CHECKED_IN → COMPLETED \| CANCELLED |
| `OrderStatus` | PENDING → PREPARING → SERVED \| CANCELLED |
| `RoomStatus` | AVAILABLE ↔ RESERVED ↔ OCCUPIED → CLEANING → AVAILABLE |
| `InvoiceStatus` | DRAFT → PAID \| CANCELLED |

Tại sao dùng enum thay String: compile-time safety (không assign "TYOP"), switch exhaustiveness, IDE auto-complete.

### Q38. Tại sao BigDecimal thay double cho tiền?

`double` có floating-point error: `0.1 + 0.2 = 0.30000000000000004`. Với tiền tài chính, sai số không chấp nhận được. `BigDecimal` là arbitrary-precision decimal, không có rounding error.

---

## PHẦN 7: CÂU HỎI KHÓ / BẪY

### Q39. Tại sao dùng React (HTML) không dùng JFrame?

Hệ thống nhiều chi nhánh, nhiều địa điểm → web-based là tự nhiên. JFrame (desktop) phải cài đặt trên từng máy, khó update. React: truy cập từ bất kỳ trình duyệt, deploy 1 lần, cross-platform.

### Q40. Tài liệu dùng tên tiếng Việt (Pha II) vs tiếng Anh (Pha III) — tại sao?

Theo skill cnpm:
- **Pha II (Phân tích)**: ngôn ngữ tự nhiên tiếng Việt — để domain expert không biết code có thể đọc hiểu
- **Pha III (Thiết kế)**: tên hàm + kiểu dữ liệu tiếng Anh Java — để lập trình viên implement trực tiếp

### Q41. Nếu thầy hỏi phần tài liệu thiếu/sai — trả lời thế nào?

Thừa nhận thẳng thắn: "Chúng em đã phát hiện trong audit: [vấn đề]. Nguyên nhân: [giải thích]. Hướng sửa: [fix]. Tuy nhiên do thời gian chưa cập nhật lên Docs."

**Vấn đề đã biết:**
- Booking/Services không gán UC ID trong tài liệu module
- Core dùng "Use Case 16" thay vì "UC16" (sai format)
- Section 3.3 (Biểu đồ UC toàn hệ thống) trong tab XÁC ĐỊNH YÊU CẦU còn thiếu
- HR Pha III có 2 chức năng thuộc services bị nhầm (Quản lý order, Quản lý menu thay vì UC14)

### Q42. Điểm mạnh và hạn chế của hệ thống.

**Điểm mạnh**: Tài liệu UP đầy đủ 4 pha cho 5 module · Codebase chạy được · Docker Compose 1 lệnh · Swagger UI đầy đủ · DataSeeder với dữ liệu thực tế.

**Hạn chế**: Dev-Token không production-ready · UC numbering chưa nhất quán · Một số Pha III/IV chưa đầy đủ · Không có role-based UI.

---

## PHẦN 8: SỐ LIỆU NHANH

| Hạng mục | Con số |
|----------|--------|
| Actor cụ thể | 5 |
| Actor trừu tượng | 2 |
| Use Case | 20 (UC01–UC21, bỏ UC09) |
| Module | 5 |
| Entity Java (domain/) | ~16 |
| Bảng DB (tbl*) | ~12–14 |
| Controller class | 12 (4 file riêng + 8 trong CrudControllers.java) |
| Docker services | 5 (frontend, backend, postgres, redis, pgadmin) |
| Port frontend | 6969 |
| Port backend | 8080 |
| Port DB | 5432 |
| Admin login | admin / admin123 / dev-token-USR001 |

---

## PHẦN 9: DEMO FLOW (15 PHÚT)

```
1. [2p] localhost:6969 → Login → Dashboard Lễ tân (giải thích màu phòng)
2. [2p] Đặt phòng → BookingPage → chọn khách/phòng/giờ → tạo
3. [2p] Gọi món → OrderPage → chọn phòng → add items → gửi
4. [1p] QL Order → PENDING → PREPARING → SERVED
5. [1p] Thanh toán → Checkout → Invoice PAID → phòng AVAILABLE
6. [2p] Dashboard Quản lý → thống kê, biểu đồ, cảnh báo
7. [2p] Swagger UI → Authorize dev-token → test GET + POST
8. [3p] Hỏi đáp (F12 Network tab → show API calls thực tế)
```

**Mẹo**: Mở F12 Network tab trước demo để show request/response trực quan khi trả lời câu hỏi kỹ thuật.
