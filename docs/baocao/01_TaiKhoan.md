# Module 1: Tài khoản & Thành viên
> UC01 · UC02 · UC03 · UC04 · UC20

---

## PHA I — YÊU CẦU (I.1)

### Q1. Module này có bao nhiêu UC? Liệt kê.

5 UC, 2 actor:

| UC | Tên | Actor chính |
|----|-----|-------------|
| UC01 | Đăng nhập | Thành viên (tất cả) |
| UC02 | Đăng ký | Khách hàng |
| UC03 | Đổi mật khẩu | Thành viên (tất cả) |
| UC04 | Quản lý thông tin cá nhân | Khách hàng |
| UC20 | Quản lý tài khoản nhân viên | Chủ doanh nghiệp (Admin) |

### Q2. Quan hệ Include/Extend trong biểu đồ UC module này.

- UC02 Đăng ký **include** Xác minh OTP (bắt buộc gửi và xác minh OTP mỗi lần đăng ký)
- UC03 Đổi mật khẩu: sau khi đổi thành công → **include** Thu hồi toàn bộ LoginSession
- UC20: **include** Tìm kiếm nhân viên (tìm trước khi sửa/xóa)

### Q3. Luồng UC01 Đăng nhập (7 bước).

```
1. Thành viên chọn chức năng Đăng nhập
2. LoginView hiển thị form (ô SĐT, ô mật khẩu, nút Đăng nhập)
3. Thành viên nhập SĐT/Email + mật khẩu, nhấn Đăng nhập
4. LoginView gọi checkLogin(phoneNumber, password)
5. User trả kết quả xác thực
6. LoginView chuyển hướng HomeView, "Đăng nhập thành công"
7. HomeView hiển thị trang chủ tương ứng vai trò
```
Ngoại lệ bước 5: sai mật khẩu → LoginView thông báo lỗi, cho nhập lại.

### Q4. Luồng UC02 Đăng ký (17 bước) — điểm quan trọng.

- Bước 4: `register(fullName, phoneNumber, email, password)` gọi lên AuthController
- Bước 5-6: Client gọi `sendOTP(phoneNumber, REGISTER)` → OTP gửi SMS/email
- Bước 11: `verifyOTP(otpCode)` → OTP xác minh thành công
- Bước 13: `saveUser()` → tài khoản được tạo
- Bước 16-17: tự động đăng nhập, chuyển về HomeView

OTP là bắt buộc — không thể bỏ qua bước xác minh.

---

## PHA II — PHÂN TÍCH

### Q5. II.2 — Các lớp thực thể được trích từ văn xuôi.

| Danh từ trích được | Quyết định | Lý do |
|--------------------|-----------|-------|
| Hệ thống | Loại | Quá chung |
| Giao diện | Loại | Là Boundary |
| Khách hàng | Giữ → lớp **User** | hoTen, soDienThoai, email, matKhau, ngayTao |
| Hạng hội viên | Giữ → lớp **MembershipTier** | tenHang, diemToiThieu, moTa, heSoUuDai |
| Mã OTP | Giữ → lớp **OTP** | maOTP, loai, thoiHanHetHan, daXacMinh |
| Phiên đăng nhập | Giữ → lớp **LoginSession** | tokenPhien, thoiGianDangNhap, thietBi |
| Nhân viên | Giữ → lớp **Employee** | hoTen, vaiTro, chiNhanh, trangThai |
| Danh sách, Lịch sử | Loại | Không phải thực thể |

### Q6. II.2 — Cardinality giữa các thực thể.

- User – MembershipTier: **n-1** (nhiều user cùng 1 hạng)
- User – OTP: **1-n** (mỗi lần đăng ký/đổi SĐT tạo 1 OTP)
- User – LoginSession: **1-n** (đăng nhập trên nhiều thiết bị)
- Employee là lớp riêng, **không kế thừa** từ User ở pha phân tích

### Q7. II.2 — Composition vs Aggregation trong module này.

- User ◆ OTP: **composition** — OTP không tồn tại khi không có User → khi xóa User, xóa theo OTP
- User ◆ LoginSession: **composition** — phiên không tồn tại độc lập
- User ◇ MembershipTier: **aggregation** — MembershipTier là danh mục độc lập, tồn tại dù không có User nào

### Q8. II.3 — Sơ đồ lớp phân tích BCE.

```
Boundary: LoginView, RegisterView, OTPVerifyView, ChangePasswordView, ProfileView, StaffManageView
Control:  AuthController, ProfileController, StaffController
Entity:   User, Client, Employee, MembershipTier, OTP, LoginSession
```

Lưu ý: Tài liệu dùng tên `...View` cho phân tích, `...Page` cho thiết kế.

### Q9. II.4 — Kịch bản phiên bản 2 của UC03 Đổi mật khẩu (8 bước).

```
1. Người dùng chọn chức năng Đổi mật khẩu
2. ChangePasswordView hiển thị form (MK hiện tại, MK mới, Xác nhận MK mới)
3. Người dùng nhập và nhấn Lưu
4. ChangePasswordView gọi changePassword(currentPassword, newPassword)
5. User đổi mật khẩu thành công
6. ChangePasswordView hiển thị "Đổi mật khẩu thành công"
7. ChangePasswordView chuyển về LoginView
8. LoginView hiển thị (tất cả phiên cũ đã bị thu hồi)
```

---

## PHA III — THIẾT KẾ

### Q10. III.1 — Thiết kế lớp thực thể: điểm đặc biệt của module này.

Single-table inheritance: **User, Client, Employee gộp vào 1 bảng `tblUser`**

Kiểu dữ liệu sau bước 2:
```
User:     id: int, fullName: String, phoneNumber: String, email: String,
          password: String, role: String, createdAt: Date
Client:   loyaltyPoints: int, joinedAt: Date (kế thừa User)
Employee: staffRole: String, branch: String, status: String (kế thừa User)
MembershipTier: id: int, tierName: String, minPoints: int, discountRate: double
OTP:      id: int, otpCode: String, type: String, expiresAt: Date, verified: boolean
LoginSession: id: int, sessionToken: String, loginTime: DateTime, device: String
```

Bước 3: Client, Employee generalization từ User (không phải composition).

### Q11. III.2 — Bảng CSDL và convention.

| Bảng | Lưu gì | PK |
|------|--------|----|
| **tblUser** | User + Client + Employee (cột `role` phân biệt) | ma: int (PK) |
| **tblMembershipTier** | Danh mục hạng hội viên | ma: int |
| **tblOTP** | Mã OTP với FK `tblUserMa` | ma: int |
| **tblLoginSession** | Phiên đăng nhập với FK `tblUserMa` | ma: int |

Cột `role` nhận giá trị: `CLIENT` / `EMPLOYEE` / `ADMIN` — phân biệt loại người dùng.  
FK convention: `tbl[TênBảngCha]Ma` (VD: `tblUserMa` là FK trỏ sang tblUser).

### Q12. III.3.1 — Module này có mấy màn hình wireframe?

6 màn hình:
1. **LoginView** — ô SĐT, ô MK, nút Đăng nhập / Quên MK / Đăng ký
2. **RegisterView** — ô Họ tên, SĐT, Email, MK, Xác nhận MK, nút Tiếp tục / Hủy
3. **OTPVerifyView** — 6 ô nhập OTP, nút Xác nhận, đếm ngược "Gửi lại (60s)"
4. **ChangePasswordView** — ô MK hiện tại, MK mới, Xác nhận MK mới, nút Lưu / Hủy
5. **ProfileView** — hiển thị Họ tên, SĐT, Email, Hạng HV, Điểm; nút Chỉnh sửa / Đổi MK
6. **StaffManageView** — ô tìm kiếm, nút Thêm, bảng tblStaff, nút Sửa / Xóa

### Q13. III.3.2 — Bảng chữ ký hàm Controller.

| Hàm | Controller | Input | Output |
|-----|-----------|-------|--------|
| `checkLogin()` | AuthController | username: String, password: String | boolean |
| `register()` | AuthController | fullName, phoneNumber, email, password | User |
| `verifyOTP()` | AuthController | otp: String | boolean |
| `changePassword()` | AuthController | currentPassword, newPassword: String | boolean |
| `getProfile()` | ProfileController | userId: int | User |
| `updateProfile()` | ProfileController | userId: int, fullName, email: String | User |
| `getAllStaff()` | StaffController | — | List\<Employee\> |
| `searchStaff()` | StaffController | keyword: String | List\<Employee\> |
| `saveStaff()` | StaffController | employee: Employee | boolean |
| `updateStaff()` | StaffController | employee: Employee | boolean |
| `deleteStaff()` | StaffController | id: int | boolean |

### Q14. III.4 — Kịch bản phiên bản 3 UC01 Đăng nhập (13 bước).

```
1-3.  Khách hàng truy cập /login, LoginPage formLoad(), render form
4.    Khách hàng nhập SĐT + MK, click [Đăng nhập]
5.    LoginPage.btnLoginClick()
6.    LoginPage gọi AuthController.checkLogin(username, password)
7.    AuthController gọi User.findBySDT(phoneNumber: String): User
8.    User trả về User
9.    AuthController.checkPassword() → BCrypt verify
10.   AuthController trả về true cho LoginPage
11.   LoginPage redirect /home
12-13. LoginPage.showMessage("Đăng nhập thành công")
```

---

## PHA IV — KIỂM THỬ

### Q15. Danh sách test case module Tài khoản.

| TC | Chức năng | Kịch bản |
|----|-----------|---------|
| TC01 | Đăng nhập | Đúng credentials → vào trang chính |
| TC02 | Đăng nhập | Tài khoản không tồn tại → thông báo lỗi |
| TC03 | Đăng nhập | Sai MK 5 lần → khóa tài khoản |
| TC04 | Đăng ký | Đủ thông tin + OTP đúng → tài khoản được tạo |
| TC05 | Đăng ký | SĐT đã tồn tại → thông báo lỗi |
| TC06 | Đăng ký | OTP sai 3 lần → hủy phiên, không tạo tài khoản |
| TC07 | Đổi MK | MK hiện tại đúng → đổi thành công, thu hồi phiên |
| TC08 | Đổi MK | MK hiện tại sai → thông báo lỗi |
| TC09 | Quản lý TTCN | Email hợp lệ → cập nhật thành công |
| TC10 | Quản lý TTCN | Email đã dùng → thông báo lỗi |
| TC11 | Quản lý NV | Thêm nhân viên mới → tạo thành công |

### Q16. CSDL trước TC01 (Đăng nhập thành công).

```
tblMembershipTier: (Đồng, 0đ) (Bạc, 300đ) (Vàng, 1000đ)
tblUser: | ma | phoneNumber   | password(BCrypt) | role   | active |
         | 1  | 0901234567    | $2a$...          | CLIENT | true   |
tblLoginSession: (rỗng)
```
CSDL sau: tblUser không đổi. tblLoginSession thêm 1 dòng mới (sessionToken, loginTime, device).

---

## ĐIỂM ĐẶC BIỆT CẦN NHỚ

- **OTP type**: `REGISTER` (đăng ký) vs `CHANGE_PHONE` (đổi SĐT) — phân biệt bằng cột `type`
- **Thu hồi phiên**: khi đổi MK thành công, gọi `revokeAllSessions()` → xóa tất cả LoginSession của user đó
- **Single-table**: lý do gộp 3 entity vào 1 bảng là tránh JOIN khi xác thực → query đơn giản hơn
- **Tên lớp**: phân tích dùng `...View` (tiếng Việt phân tích), thiết kế dùng `...Page` / `...Form` (React component)

---

## DIAGRAM Q&A

### Q17. Biểu đồ UC (I.1) — liệt kê các UC con và quan hệ Include/Extend.

Trong biểu đồ UC module Tài khoản:
- **UC con của UC02**: "Gửi OTP" (include bắt buộc), "Xác minh OTP" (include)
- **UC con của UC20**: "Tìm kiếm nhân viên" (include trước sửa/xóa)
- UC01, UC03, UC04 không có UC con (đơn giản)

Actors trong biểu đồ UC: **Thành viên** (trừu tượng, cha) ← {Khách hàng, Nhân viên lễ tân, NV phục vụ, QL chi nhánh, Chủ doanh nghiệp}. Thành viên thực hiện UC01 + UC03. Khách hàng thêm UC02 + UC04. Admin thêm UC20.

### Q18. Biểu đồ thực thể (II.2) — có bao nhiêu lớp? Quan hệ giữa chúng.

5 lớp Entity: **User, MembershipTier, OTP, LoginSession, Employee**

```
User "n" o-- "1" MembershipTier : aggregation
User "1" *-- "n" OTP : composition
User "1" *-- "n" LoginSession : composition
Employee : lớp riêng biệt, không kế thừa User ở pha phân tích
```

Chú ý: biểu đồ II.2 **chưa có kiểu dữ liệu** (chỉ tên thuộc tính), **chưa có phương thức**, **chưa có id**.

### Q19. Biểu đồ lớp phân tích BCE (II.3) — cấu trúc 3 tầng.

```
┌─────────────────────────────────────────────────────────────────┐
│ Boundary (6 lớp)                                                │
│ LoginView  RegisterView  OTPVerifyView                          │
│ ChangePasswordView  ProfileView  StaffManageView                │
├─────────────────────────────────────────────────────────────────┤
│ Control (3 lớp)                                                 │
│ AuthController  ProfileController  StaffController              │
├─────────────────────────────────────────────────────────────────┤
│ Entity (6 lớp)                                                  │
│ User  Client  Employee  MembershipTier  OTP  LoginSession       │
└─────────────────────────────────────────────────────────────────┘
```

Quan hệ: Boundary → Control → Entity (mũi tên một chiều). Thông điệp trong sequence diagram II.4: tiếng Việt tự nhiên (chưa có tên hàm Java).

### Q20. Biểu đồ tuần tự phân tích (II.4) — mỗi UC có mấy bước?

| UC | Số bước | Điểm đặc biệt |
|----|---------|---------------|
| UC01 Đăng nhập | 7 | Không có OTP — chỉ checkLogin() |
| UC02 Đăng ký | 17 | Có 2 giai đoạn: nhập form → xác minh OTP |
| UC03 Đổi MK | 8 | Cuối cùng thu hồi tất cả LoginSession |
| UC04 Quản lý TTCN | 10 | getProfile() rồi updateProfile() |
| UC20 Quản lý NV | 18 | getAllStaff() → addStaff() → deleteStaff() |

Participants mỗi sequence: **Actor → Boundary → Entity** (pha phân tích chưa có separate Control participant).

### Q21. Biểu đồ lớp thực thể (III.1) — so với II.2 thêm gì?

Bổ sung so với II.2:
1. **id: int** cho mọi lớp không kế thừa
2. **Kiểu Java cụ thể**: `phoneNumber: String`, `createdAt: Date`, `verified: boolean`, `discountRate: double`
3. **Client, Employee generalization từ User**: mũi tên kế thừa tam giác rỗng
4. **Thuộc tính object**: `Client.membershipTier: MembershipTier`, `OTP.user: User`, `LoginSession.user: User`

Biểu đồ III.1 vẫn **không có phương thức** (phương thức sẽ xuất hiện ở III.3.2).

### Q22. ERD (III.2) — sự khác biệt so với biểu đồ thực thể II.2.

| | II.2 (thực thể phân tích) | III.2 (ERD thiết kế) |
|--|--------------------------|----------------------|
| Tên | Tên lớp tiếng Anh | Tên bảng `tbl*` |
| Cột | Tên thuộc tính | Tên cột + kiểu SQL |
| Quan hệ | UML (composition/aggregation) | FK (1-n với mũi tên) |
| Đặc biệt | — | Cột `role` (CLIENT/EMPLOYEE/ADMIN) trong tblUser |

ERD đặc biệt nhất của module này: **1 bảng tblUser gộp 3 entity** (User + Client + Employee). Đây là kết quả của quyết định Single-Table Inheritance.

### Q23. Biểu đồ lớp thiết kế MVC (III.3.2) — cấu trúc.

```
Boundary (React, 6 component):
  LoginPage, RegisterPage, OTPVerifyPage,
  ChangePasswordPage, ProfilePage, StaffManagePage
  → mỗi component chỉ có render()

Control (Spring Boot @RestController, 3 class):
  AuthController: POST /api/auth/login, POST /api/auth/register, POST /api/auth/verify-otp
  ProfileController: GET/PUT /api/profile/{id}
  StaffController: GET/POST/PUT/DELETE /api/staff

Entity (JPA @Entity, 4 class có annotation):
  User, MembershipTier, Otp, LoginSession
  → có @Table, @Id, @Column annotation
```

So với II.3: thêm kiểu dữ liệu Java, tên hàm tiếng Anh, thêm DAO concept (JpaRepository).

### Q24. Biểu đồ tuần tự thiết kế (III.4) — UC03 Đổi mật khẩu có điểm đặc biệt gì?

Bước đặc biệt cuối chuỗi (bước 14-15):
```
AuthController → User.revokeAllSessions(): void
→ Xóa tất cả LoginSession của user đó
→ Người dùng phải đăng nhập lại trên mọi thiết bị
```

Đây là **security requirement** — khi đổi mật khẩu, phiên cũ không còn hợp lệ.

Participants III.4: **Actor → LoginPage → AuthController → UserRepository → Entity** (5 participant, nhiều hơn II.4).
