# BÀI TẬP THỰC HÀNH - TRUNG
## Module: Xác thực (Authentication)

**Phạm vi phụ trách:** Đăng nhập, Đăng ký, Mã hóa mật khẩu, Token xác thực
**Trang FE:** `LoginPage.tsx`, `RegisterPage.tsx`
**Controller BE:** `AuthController.java`
**Bảng DB:** `tblUser`

---

## Bài 1 - Trace luồng dữ liệu: Đăng nhập

**Yêu cầu:** Trace từ lúc người dùng nhấn nút "ĐĂNG NHẬP" trên giao diện cho đến khi hệ thống trả token về client.

### Bước 1: File UI React chứa nút bấm

**File:** `frontend/src/pages/LoginPage.tsx`

- **Dòng 85-89:** Nút submit form "ĐĂNG NHẬP"
```tsx
<button className="w-full flex justify-center items-center py-4 px-4 bg-primary-container ..." type="submit">
  ĐĂNG NHẬP
  <span className="material-symbols-outlined ml-2 text-[18px]">login</span>
</button>
```

- **Dòng 60:** Form gắn sự kiện onSubmit
```tsx
<form className="space-y-6" onSubmit={handleLogin}>
```

- **Dòng 8-33:** Hàm `handleLogin` xử lý khi submit form

### Bước 2: Hàm gọi API

**File:** `frontend/src/pages/LoginPage.tsx`

- **Dòng 16-20:** Gửi POST request đến backend
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usernameOrEmail: username, password }),
});
```

- **Dòng 22-23:** Kiểm tra response, nếu fail thì throw lỗi
```typescript
if (!response.ok) {
  throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
}
```

- **Dòng 27-28:** Lưu token và user info vào localStorage
```typescript
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data));
```

- **Dòng 29:** Chuyển hướng về trang chủ
```typescript
navigate('/');
```

### Bước 3: File Controller nhận request

**File:** `backend/src/main/java/com/karaoke/backend/web/AuthController.java`

- **Dòng 25:** `@RequestMapping("/api/auth")` - base path cho tất cả endpoint auth
- **Dòng 79:** `@PostMapping("/login")` - ánh xạ POST `/api/auth/login`
- **Dòng 102-110:** Hàm `login()` xử lý request
```java
AuthResponse login(@Valid @RequestBody LoginRequest request) {
    UserAccount user = users.findByUsername(request.usernameOrEmail())
            .or(() -> users.findByEmail(request.usernameOrEmail()))
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
        throw new IllegalArgumentException("Invalid username or password");
    }
    return AuthResponse.from(user);
}
```

- **Dòng 151:** Record `LoginRequest` định nghĩa cấu trúc body
```java
record LoginRequest(@NotBlank String usernameOrEmail, @NotBlank String password) {}
```

### Bước 4: File xử lý logic (Controller xử lý trực tiếp)

**File:** `backend/src/main/java/com/karaoke/backend/web/AuthController.java`

Vì module này không có Service layer riêng, logic xử lý nằm trực tiếp trong Controller:

- **Dòng 103-104:** Tìm user theo username hoặc email
```java
users.findByUsername(request.usernameOrEmail())
    .or(() -> users.findByEmail(request.usernameOrEmail()))
```

- **Dòng 105:** Nếu không tìm thấy → throw exception
```java
.orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
```

- **Dòng 106-107:** Kiểm tra mật khẩu bằng BCrypt
```java
if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
    throw new IllegalArgumentException("Invalid username or password");
}
```

- **Dòng 162-164:** Tạo response với token
```java
static AuthResponse from(UserAccount user) {
    String token = "dev-token-" + user.getId();
    return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), token);
}
```

### Bước 5: File Repository thao tác CSDL

**File:** `backend/src/main/java/com/karaoke/backend/repository/UserAccountRepository.java`

```java
public interface UserAccountRepository extends JpaRepository<UserAccount, String> {
    Optional<UserAccount> findByUsername(String username);   // dòng 8
    Optional<UserAccount> findByEmail(String email);         // dòng 9
    boolean existsByUsername(String username);                // dòng 10
    boolean existsByEmail(String email);                     // dòng 11
}
```

- `findByUsername` → query `SELECT * FROM tblUser WHERE username = ?`
- `findByEmail` → query `SELECT * FROM tblUser WHERE email = ?`

### Bước 6: Entity ánh xạ bảng

**File:** `backend/src/main/java/com/karaoke/backend/domain/UserAccount.java`

```java
@Entity
@Table(name = "tblUser")    // dòng 18
public class UserAccount {
    @Id
    private String id;                    // PK
    @Column(nullable = false, unique = true)
    private String username;              // unique
    @Column(nullable = false, unique = true)
    private String email;                 // unique
    @Column(nullable = false)
    private String passwordHash;          // BCrypt hash
    @Enumerated(EnumType.STRING)
    private UserRole role;                // ADMIN, CLIENT, RECEPTIONIST...
    private boolean active = true;
}
```

### Bước 7: Bảo mật - Security Filter

**File:** `backend/src/main/java/com/karaoke/backend/config/SecurityConfig.java`

- **Dòng 29-30:** `/api/auth/**` được permitAll (không cần token)
```java
.requestMatchers("/api/auth/**").permitAll()
```

**File:** `backend/src/main/java/com/karaoke/backend/config/TokenAuthenticationFilter.java`

- **Dòng 33-34:** Kiểm tra token prefix
```java
if (StringUtils.hasText(jwt) && jwt.startsWith("dev-token-")) {
    String userId = jwt.substring("dev-token-".length());
```

- **Dòng 35-37:** Tìm user từ token → set Authentication vào SecurityContext
```java
userRepository.findById(userId).ifPresent(user -> {
    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
    );
```

**Tổng kết flow:**
```
LoginPage.tsx (dòng 16)
  → fetch POST /api/auth/login
    → AuthController.login() (dòng 102)
      → UserAccountRepository.findByUsername() (dòng 103)
      → passwordEncoder.matches() (dòng 106)
      → AuthResponse.from() tạo token "dev-token-{id}" (dòng 162)
    ← trả JSON {id, username, email, role, token}
  ← lưu localStorage, navigate('/')
```

---

## Bài 2 - Sửa lỗi có chủ đích

### Lỗi QA tạo ra

**File:** `backend/src/main/java/com/karaoke/backend/web/AuthController.java`
**Dòng 106:** Hoán đổi 2 tham số trong `passwordEncoder.matches()`

**Trước (đúng):**
```java
if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
```

**Sau (sai):**
```java
if (!passwordEncoder.matches(user.getPasswordHash(), request.password())) {
```

### Log lỗi sẽ hiển thị

**Backend:**
- Không có exception rõ ràng trong console
- `BCryptPasswordEncoder.matches()` sẽ trả về `false` vì tham số thứ nhất (expected) phải là plaintext password, nhưng ở đây lại nhận BCrypt hash

**Frontend:**
- Response status: `400 Bad Request`
- Message: `"Invalid username or password"` (dòng 107 AuthController)
- Hiển thị trên UI: `"Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."` (dòng 23 LoginPage)

**Hành vi:** Người dùng nhập đúng `admin` / `admin123` nhưng luôn bị từ chối đăng nhập.

### Các bước Learner debug

1. Mở trình duyệt, truy cập trang đăng nhập
2. Mở DevTools (F12) → tab **Network**
3. Nhập `admin` / `admin123` → nhấn ĐĂNG NHẬP
4. Quan sát request `POST /api/auth/login` → Status: **400 Bad Request**
5. Click vào request → tab **Response**: `{"status":400, "message":"Invalid username or password"}`
6. Mở IDE, đặt breakpoint tại `AuthController.java` **dòng 103-107**
7. Chạy lại request, khi dừng tại breakpoint:
   - Kiểm tra `request.password()` = `"admin123"` (plaintext)
   - Kiểm tra `user.getPasswordHash()` = `"$2a$10$..."` (BCrypt hash)
8. Bước qua dòng 106: `passwordEncoder.matches("$2a$10$...", "admin123")` → trả về `false`
9. **Nhận ra:** Tham số bị đảo. `matches(plaintext, hashed)` mới đúng
10. **Sửa:** Đổi lại thành `passwordEncoder.matches(request.password(), user.getPasswordHash())`

---

## Bài 3 - Tinh chỉnh UI và Vấn đáp

### Task chỉnh sửa UI

**File:** `frontend/src/pages/LoginPage.tsx`

**Yêu cầu:** Đổi text nút đăng nhập và icon

**Dòng 85-89, sửa thành:**
```tsx
<button className="w-full flex justify-center items-center py-4 px-4 bg-primary-container text-on-primary-container font-label-caps rounded-lg hover:bg-primary hover:shadow-lg hover:shadow-primary-container/20 transition-all duration-300 transform active:scale-[0.98]" type="submit">
  ĐĂNG NHẬP HỆ THỐNG
  <span className="material-symbols-outlined ml-2 text-[18px]">lock</span>
</button>
```

**Thay đổi:**
- Text: `"ĐĂNG NHẬP"` → `"ĐĂNG NHẬP HỆ THỐNG"`
- Icon: `login` → `lock`

### 5 câu hỏi chất vấn

---

**Câu 1:** Khi người dùng nhập sai mật khẩu, hệ thống phản hồi như thế nào? Truy vết từ backend đến frontend, chỉ ra file và dòng code cụ thể.

**Đáp án chi tiết:**
- `AuthController.java` **dòng 106-107:** `passwordEncoder.matches()` trả `false` → throw `IllegalArgumentException("Invalid username or password")`
- Exception được bắt bởi `ApiExceptionHandler.java` **dòng 21-23:**
```java
@ExceptionHandler(IllegalArgumentException.class)
ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) {
    return error(HttpStatus.BAD_REQUEST, ex.getMessage());
}
```
- Trả về HTTP 400 với body: `{"timestamp":"...", "status":400, "error":"Bad Request", "message":"Invalid username or password"}`
- Tại frontend `LoginPage.tsx` **dòng 22-23:** `if (!response.ok)` → throw Error
- **Dòng 30-32:** `setError(err.message)` hiển thị lỗi đỏ trên UI

---

**Câu 2:** Token trong hệ thống này được tạo như thế nào? Đây có phải JWT thật không? Tại sao lại thiết kế như vậy?

**Đáp án chi tiết:**
- `AuthController.java` **dòng 163:** `String token = "dev-token-" + user.getId();`
- Đây **KHÔNG** phải JWT thật, chỉ là string concatenation đơn giản
- `TokenAuthenticationFilter.java` **dòng 33-34:** Kiểm tra prefix `"dev-token-"` → cắt substring lấy userId
- Lý do thiết kế: dự án dùng cho mục đích học tập/demo, JWT thật cần thêm thư viện như `io.jsonwebtoken` và cấu hình secret key phức tạp hơn

---

**Câu 3:** Tại sao `/api/auth/login` và `/api/auth/register` không cần token mà vẫn truy cập được? Nếu bỏ cấu hình này thì会发生 gì?

**Đáp án chi tiết:**
- `SecurityConfig.java` **dòng 29-30:**
```java
.requestMatchers("/api/auth/**").permitAll()
```
- Và **dòng 39:** `.anyRequest().authenticated()` - mọi request khác đều cần token
- Nếu bỏ dòng `permitAll()` cho `/api/auth/**`: người dùng không thể đăng nhập/đăng ký vì chưa có token, tạo ra vòng lặp vô lý (cần token để lấy token)

---

**Câu 4:** Mật khẩu được mã hóa bằng thuật toán nào? Chỉ ra 2 vị trí trong code: một chỗ mã khi đăng ký, một chỗ giải mã khi đăng nhập.

**Đáp án chi tiết:**
- Thuật toán: **BCrypt** (mã hóa một chiều, không thể giải mã)
- `SecurityConfig.java` **dòng 58-59:** `new BCryptPasswordEncoder()` - tạo bean
- **Khi đăng ký** - `AuthController.java` **dòng 71:** `passwordEncoder.encode(request.password())` - mã hóa plaintext → BCrypt hash
- **Khi đăng nhập** - `AuthController.java` **dòng 106:** `passwordEncoder.matches(request.password(), user.getPasswordHash())` - so sánh plaintext với hash (KHÔNG giải mã)

---

**Câu 5:** Nếu người dùng nhập email thay vì username để đăng nhập, hệ thống xử lý ra sao? Chỉ ra code và thứ tự ưu tiên tìm kiếm.

**Đáp án chi tiết:**
- `AuthController.java` **dòng 103-104:**
```java
users.findByUsername(request.usernameOrEmail())
    .or(() -> users.findByEmail(request.usernameOrEmail()))
```
- Thứ tự: **thử username TRƯỚC** → nếu không thấy → **thử email SAU**
- `UserAccountRepository.java` **dòng 8-9:** cả hai method đều query database
- Nếu cả hai đều không tìm thấy → `.orElseThrow()` **dòng 105** → throw exception
- Lưu ý: nếu có user trùng username và email của user khác, hệ thống sẽ ưu tiên user có username khớp trước
