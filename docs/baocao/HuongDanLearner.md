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

## Lịch học 8 ngày

| Ngày | Nội dung | Bạn cần làm |
|------|----------|-------------|
| **0** | Cài đặt | Hoàn thành **Bài tập 0** ở trên. Chạy được dự án, chụp screenshot. |
| **1** | Đọc hiểu code | Đọc **Bài 1** trong file của bạn. Mở IDE, tìm từng file, từng dòng code. Ghi chú. |
| **2** | Đọc hiểu (tiếp) | Trace lại flow bằng lời nói (không nhìn code). Hỏi QA. |
| **3** | Sửa lỗi | Chạy chức năng trên nhánh → thấy lỗi → debug → sửa. |
| **4** | Sửa lỗi (tiếp) | Giải thích cho QA tại sao lỗi xảyra. |
| **5** | Sửa UI | Đọc **Bài 3**, sửa text/màu. Chạy thử. |
| **6** | Vấn đáp module | QA hỏi 5 câu. Trả lời bằng cách chỉ ra code. |
| **7** | Vấn đáp liên module | QA hỏi câu hỏi chung. Ôn toàn bộ. |
| **8** | Tổng duyệt | Thuyết trình 5 phút. Trả lời câu hỏi ngẫu nhiên. |

---

## Công cụ hỗ trợ

### Swagger UI - Test API
- Mở: http://localhost:8080/swagger-ui.html
- API auth (`/api/auth/**`) không cần token
- API khác cần header: `Authorization: Bearer dev-token-USR001`

### H2 Console - Xem database (chế độ dev không Docker)
- Mở: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:karaoke`, User: `sa`, Password: trống

### psql - Xem database (Docker)
```bash
docker compose exec postgres psql -U karaoke_admin -d karaoke
# SELECT * FROM tbl_user;
# \q
```

### DevTools - Debug frontend
- Chrome: **F12**
- **tab Network:** Xem request/response API
- **tab Console:** Xem lỗi JavaScript

---

## Quy tắc

- Hoàn thành **Bài tập 0** trước khi bắt đầu bất kỳ bài nào khác
- **Đọc kỹ** file bài tập trước khi hỏi QA
- **Không sửa** file ngoài module của mình (trừ Bài 0)
- **Không commit** khi chưa được QA đồng ý
- Khi gặp lỗi → **chụp screenshot** Console/Network trước khi hỏi
