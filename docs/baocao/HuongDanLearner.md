# HƯỚNG DẪN HỌC CHO LEARNER
## Hệ thống Quản lý Quán Karaoke - Famtaoke

---

## Bạn là ai?

| Họ tên | Module phụ trách | File bài tập |
|--------|-----------------|-------------|
| **Trung** | Xác thực (Authentication) | [Trung_XacThuc.md](Trung_XacThuc.md) |
| **Tuấn** | Quản lý phòng & Đặt phòng | [Tuan_QuanLyPhong.md](Tuan_QuanLyPhong.md) |
| **Khánh** | Gọi món (Order Service) | [Khanh_GoiMon.md](Khanh_GoiMon.md) |
| **Hành** | Thanh toán & Báo cáo | [Hanh_ThanhToanBaoCao.md](Hanh_ThanhToanBaoCao.md) |

**Xem tổng quan phân chia:** [BaiTap_4Learners.md](BaiTap_4Learners.md)

---

## Bài tập 0 - Chạy dự án (Tất cả)

> Trước khi bắt đầu bất kỳ bài tập nào, bạn PHẢI chạy được dự án trên máy mình.

### Bước 1: Clone dự án

```bash
git clone https://github.com/thanhtrnnn/karaoke.git
cd karaoke
```

### Bước 2: Checkout nhánh bài tập của bạn

```bash
# Trung:
git checkout bai-tap/trung-xac-thuc

# Tuấn:
git checkout bai-tap/tuan-quan-ly-phong

# Khánh:
git checkout bai-tap/khanh-goi-mon

# Hành:
git checkout bai-tap/hanh-thanh-toan-bao-cao
```

### Bước 3: Chạy bằng Docker

```bash
docker compose up -d --build
```

Đợi build xong (lần đầu 3-5 phút). Khi thấy 4 container chạy:

```
docker compose ps
```

Phải thấy cả 4 service đều `Up` hoặc `healthy`.

### Bước 4: Kiểm tra

1. Mở trình duyệt → http://localhost:6969 → thấy trang đăng nhập
2. Đăng nhập: `admin` / `admin123`
3. Mở http://localhost:8080/swagger-ui.html → thấy danh sách API
4. Click "Tất cả phòng" (hoặc bất kỳ trang nào trong sidebar) → xem dữ liệu hiển thị

### Bước 5: Chụp screenshot

Chụp lại kết quả thành công, gửi cho QA xác nhận.

### Không chạy được?

Xem chi tiết tại: [DEPLOYMENT.md](../../DEPLOYMENT.md)

| Lỗi | Giải pháp |
|-----|-----------|
| `docker: command not found` | Cài Docker Desktop: https://docker.com/products/docker-desktop |
| `port already allocated` | Tắt process đang dùng port, hoặc đổi port trong `docker-compose.yml` |
| Build chậm | Bình thường, lần đầu tải dependency. Các lần sau nhanh hơn |
| Frontend trắng | Kiểm tra `docker compose logs frontend` |

---

## Bạn cần làm gì?

Sau khi hoàn thành Bài tập 0, mỗi file bài tập có **3 bài**:

### Bài 1 - Trace luồng dữ liệu
> Hiểu code chạy từ đâu đến đâu

- Đọc danh sách file + dòng code được chỉ ra
- Mở từng file trên IDE, tìm đúng dòng đó
- Đọc và hiểu tại sao code lại viết như vậy
- **Mục tiêu:** Trả lời được "Khi user nhấn nút X, code chạy qua những đâu?"

### Bài 2 - Sửa lỗi có chủ đích
> QA đã giấu 1 lỗi trong code, bạn phải tìm và sửa

- Chạy thử chức năng trên nhánh của bạn → thấy lỗi
- Dùng DevTools / Debugger tìm nguyên nhân
- Sửa code → chạy lại → hết lỗi
- **Mục tiêu:** Tìm và sửa lỗi trong < 45 phút

### Bài 3 - Tinh chỉnh UI + Vấn đáp
> Sửa giao diện nhỏ + trả lời câu hỏi chất vấn

- Sửa text/màu như hướng dẫn (chỉ 1-2 dòng code)
- Trả lời 5 câu hỏi bằng cách CHỈ RA file + dòng code cụ thể
- **Mục tiêu:** Trả lời đúng >= 3/5 câu

---

## Lịch học 8 ngày (3-3.5 giờ/ngày)

> **Lưu ý:** Mỗi ngày có 2-4 hoạt động, bao gồm cả hoạt động TOÀN HỆ THỐNG mà TẤT CẢ learner đều phải làm (không chỉ học module riêng).

| Ngày | Chủ đề | Hoạt động | Thời lượng |
|------|--------|-----------|------------|
| **0** | Cài đặt & Kiến trúc | Chạy dự án + docker-compose + duyệt giao diện + DevTools Network | 2.5h |
| **1** | Entity, Controller, API | Đọc 12 Entities + CrudControllers + Swagger thực tế + controller riêng module + Exception Handling | 3.5h |
| **2** | Security, Auth & Frontend | SecurityConfig + test Security qua Swagger + trace auth flow + App.tsx + API pattern + tìm trang hardcode | 3.5h |
| **3** | Công cụ Chuyên sâu | Swagger CRUD đầy đủ + DevTools debug + pgAdmin xem data + Docker networking | 3h |
| **4** | Sửa lỗi Module riêng | QA tạo lỗi + debug 8 bước + giải thích lỗi + hiểu cross-module impact | 3h |
| **5** | Xuyên module + Lỗi hệ thống | Trace luồng đầy đủ (đăng nhập → thanh toán) + sửa lỗi cross-module + Docker networking | 3.5h |
| **6** | UI & Frontend + Vấn đáp | Sửa UI + hiểu Tailwind/Recharts/Zustand + vấn đáp module riêng (5 câu + 2 câu ngoài đề) | 3h |
| **7** | Vấn đáp Tổng hợp + Thuyết trình | 10 câu liên module + 2 bài công cụ + 3 câu ngẫu nhiên + thuyết trình 15 phút/người | 3.5h |

### Chi tiết từng ngày

#### Ngày 0 — Cài đặt & Hiểu kiến trúc (Tất cả) — 2.5h
1. **Chạy dự án** (60p): Hoàn thành Bài tập 0 ở trên. Chạy được dự án, chụp 4 screenshot (login, dashboard, Swagger, pgAdmin)
2. **Đọc docker-compose.yml** (30p): Ve sơ đồ kiến trúc trên giấy, hiểu 5 services + ports + depends_on + healthcheck
3. **Duyệt toàn bộ giao diện** (30p): Click 13 trang trong Sidebar, ghi nhận trang nào có dữ liệu/thông
4. **DevTools Network** (30p): F12 → tab Network, click mỗi trang, quan sát API calls (endpoint nào, status code, response)

**Checkpoint:** Ve được sơ đồ kiến trúc hệ thống, biết được 5 services và port của từng service.

#### Ngày 1 — Backend: Entity, Controller, API (Tất cả + riêng module) — 3.5h
1. **Đọc TOÀN BỘ 12 Entities** (60p): Ve ERD trên giấy, ghi chú @ManyToOne/@OneToMany, CascadeType, @JsonIgnore
2. **Đọc CrudControllers.java** (45p): 8 controllers trong 1 file, nhận biết CRUD pattern, controller nào có filter đặc biệt
3. **Swagger UI thực tế** (60p): Test 7 thao tác (GET rooms, POST customers, POST orders, GET reports...), ghi nhận endpoint nào cần token. Dùng SwaggerAuthorize để test với token
4. **Đọc controller RIÊNG MODULE** (30p): Trung→AuthController, Tuan→BookingController, Khanh→OrderController, Hanh→ReportController
5. **Hiểu Exception Handling** (15p): Gọi API sai tham số (GET /api/rooms/INVALID), quan sát HTTP 404/400 response

**Checkpoint:** Ve được ERD hoàn chỉnh, dùng Swagger tạo được order, trả lời được "endpoint nào cần token".

#### Ngày 2 — Security, Auth & Frontend Patterns (Tất cả) — 3.5h
1. **Đọc SecurityConfig + TokenFilter** (45p): CSRF disable, STATELESS, permitAll, filter chain, `dev-token-{userId}` format
2. **Test Security qua Swagger** (30p): Không token→403, sai token→403, đúng token→200, auth endpoint→không cần token
3. **Trace luồng auth đầy đủ** (30p): DevTools Network, đăng nhập admin/admin123, quan sát request POST /api/auth/login, sau đó mọi request đều có header Authorization
4. **Đọc App.tsx + component chung** (45p): Routing, ProtectedRoute, Sidebar, TopAppBar, MainLayout, uiStore (Zustand)
5. **So sánh cách gọi API** (30p): ReceptionDashboard vs OrderPage, pattern `fetch('/api/...', { headers: { Authorization } })`, Vite proxy vs nginx proxy
6. **Tìm trang chưa kết nối API** (15p): CheckoutPage (hardcode), MembershipPage (hardcode), ReportsPage (biểu đồ hardcode)

**Checkpoint:** Trả lời được "khi request đến backend, nó đi qua những bước nào trước khi đến Controller?"

#### Ngày 3 — Thực hành Công cụ Chuyên sâu (Tất cả) — 3h
1. **Swagger — Test CRUD đầy đủ** (75p): CRUD cycle cho Rooms, Customers, MenuItems, Bookings (POST→GET→PUT status CHECKED_IN→GET lại xem room status đổi?), Orders (POST→GET→PUT PREPARING→PUT SERVED), Invoices (POST→GET→PUT pay)
2. **DevTools — Debug frontend** (45p): Network tab (request/response/headers/timing), Console (xóa token → reload → redirect? sai token → 403?), Application (localStorage)
3. **pgAdmin — Xem dữ liệu** (30p): Dùng Query Tool xem bảng tblRoom, tblBooking, tblOrder, tblInvoice. So sánh dữ liệu với Swagger response
4. **Docker networking** (30p): `docker compose exec backend ping postgres`, `docker compose exec frontend ping backend`, hiểu tại sao dùng tên service thay vì localhost

**Checkpoint:** Tạo được 1 booking hoàn chỉnh qua Swagger, kiểm tra được trong pgAdmin, xem được trong DevTools Network tab.

#### Ngày 4 — Sửa lỗi Module riêng (Riêng module) — 3h
1. **QA tạo lỗi** (trước khi học)
2. **Tìm & sửa lỗi** (120p): 8 bước debug: (1) Xác định hiện tượng → (2) DevTools xem request/response → (3) Swagger test API trực tiếp → (4) Breakpoint trong IDE → (5) Debug từng bước → (6) Tìm dòng code gây lỗi → (7) Sửa lỗi → (8) Test lại
3. **Giải thích lỗi cho QA** (30p): Hiện tượng, nguyên nhân gốc (dòng nào, tại sao), cách sửa, tại sao lỗi này khó phát hiện
4. **Hiểu cross-module impact** (30p): Sau khi sửa lỗi, trace xem lỗi đó ảnh hưởng đến những trang/module nào khác

**Checkpoint:** Sửa lỗi trong < 45 phút, giải thích được nguyên nhân gốc.

#### Ngày 5 — Trace xuyên module + Sửa lỗi hệ thống (Tất cả) — 3.5h
1. **Trace luồng xuyên module** (60p): EVERY learner phải trace luồng "Khách hàng đến quán karaoke, gọi món, và thanh toán":
   - Đăng nhập → Đặt phòng → Check-in → Gọi món → Thanh toán
   - Ve sơ đồ trên giấy, mỗi bước là 1 hộp, mũi tên chỉ hướng
2. **Sửa lỗi hệ thống** (90p): QA tạo 1 lỗi CROSS-MODULE (không thuộc module riêng của ai), 4 learner cùng tìm và sửa. Bước: Phát hiện → Trace request → Tìm dòng code thiếu → Sửa → Test toàn bộ luồng
3. **Hiểu Docker networking** (30p): `depends_on`, `healthcheck`, `docker compose exec backend env | grep SPRING`

**Checkpoint:** Vẽ được luồng dữ liệu đầy đủ từ đăng nhập đến thanh toán, biết mỗi bước đi qua file nào.

#### Ngày 6 — UI tweak + Hiểu Frontend Patterns (Riêng module + Tất cả) — 3h
1. **Sửa UI module riêng** (30p): Đổi text/màu như hướng dẫn trong Bài 3, chụp screenshot trước/sau
2. **Hiểu Tailwind CSS** (30p): flex, padding, custom color tokens (`bg-primary-container`), responsive breakpoints (`md:hidden`)
3. **Hiểu Recharts** (30p): useState chartType, `currentData = chartData[chartType]`, AreaChart re-render, dropdown onChange
4. **Hiểu Zustand** (15p): uiStore global state vs useState local state, thử toggle sidebar ở 2 trang khác nhau
5. **Vấn đáp module riêng** (45p): 5 câu từ file bài tập + QA hỏi thêm 2 câu ngoài đề

**Checkpoint:** Sửa UI thành công, giải thích được Tailwind/Recharts/Zustand hoạt động thế nào.

#### Ngày 7 — Vấn đáp Tổng hợp + Tổng duyệt (Tất cả) — 3.5h
1. **Vấn đáp liên module** (60p): 10 câu bắt buộc cho TẤT CẢ learner (xem BaiTap_4Learners.md)
2. **Vấn đáp công cụ** (20p): Dùng Swagger tạo booking, dùng DevTools xem headers
3. **Câu hỏi ngẫu nhiên liên module** (45p): QA hỏi mỗi learner 3 câu về module KHÔNG phải của mình
4. **Thuyết trình module** (60p): Mỗi learner 15 phút (3p giới thiệu + 5p trace code + 3p demo thật + 2p bài học + 2p Q&A)
5. **Đánh giá cuối cùng** (15p): Module riêng 40% + Toàn hệ thống 30% + Công cụ 15% + Debug 15%

**Checkpoint:** Mỗi learner trả lời đúng >= 4/5 câu riêng module, >= 7/10 câu liên module.

---

## Công cụ hỗ trợ

### Swagger UI - Test API
- Mở: http://localhost:8080/swagger-ui.html
- API auth (`/api/auth/**`) không cần token
- API khác cần header: `Authorization: Bearer dev-token-USR001`
- Dùng nút "Authorize" ở góc phải trên cùng để nhập token 1 lần

### pgAdmin - Xem database
- Mở: http://localhost:5050
- Email: `admin@karaoke.local`, Password: `admin123`
- Kết nối: Host = `postgres`, Port = `5432`, Database = `karaoke`, User = `karaoke_admin`, Password = `Secur3Passw0rd!`
- Xem bảng: Servers → Karaoke DB → Databases → karaoke → Schemas → public → Tables

### DevTools - Debug frontend
- Chrome: **F12**
- **tab Network:** Xem request/response API (endpoint, status, headers, body, timing)
- **tab Console:** Xem lỗi JavaScript, thử `localStorage.removeItem('token')` rồi reload
- **tab Application:** Xem localStorage (token, user), cookies

---

## Quy tắc

- Hoàn thành **Bài tập 0** trước khi bắt đầu bất kỳ bài nào khác
- **Đọc kỹ** file bài tập trước khi hỏi QA
- **Không sửa** file ngoài module của mình (trừ Bài 0 và Bài tập toàn hệ thống)
- **Không commit** khi chưa được QA đồng ý
- Khi gặp lỗi → **chụp screenshot** Console/Network trước khi hỏi
