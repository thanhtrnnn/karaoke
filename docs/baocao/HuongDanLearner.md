# HƯỚNG DẪN HỌC CHO LEARNER
## Hệ thống Quản lý Quán Karaoke - 8 ngày

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

## Bạn cần làm gì?

Mỗi file bài tập có **3 bài**, đánh số rõ ràng:

### Bài 1 - Trace luồng dữ liệu
> Hiểu code chạy từ đâu đến đâu

- Đọc danh sách file + dòng code được chỉ ra
- Mở từng file trên IDE, tìm đúng dòng đó
- Đọc và hiểu tại sao code lại viết như vậy
- **Mục tiêu:** Trả lời được "Khi user nhấn nút X, code chạy qua những đâu?"

### Bài 2 - Sửa lỗi có chủ đích
> QA đã giấu 1 lỗi trong code, bạn phải tìm và sửa

- QA sẽ tạo lỗi trước khi bạn bắt đầu
- Chạy thử chức năng → thấy lỗi
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
| **1** | Đọc hiểu code | Đọc **Bài 1** trong file của bạn. Mở IDE, tìm từng file, từng dòng code được chỉ ra. Ghi chú những gì chưa hiểu. |
| **2** | Đọc hiểu code (tiếp) | Trace lại flow bằng lời nói (không nhìn code). Hỏi QA những phần chưa hiểu. |
| **3** | Sửa lỗi | QA tạo lỗi. Bạn mở chức năng → thấy lỗi → debug → sửa. Ghi lại quá trình debug. |
| **4** | Sửa lỗi (tiếp) | Nếu chưa sửa xong → tiếp tục. Nếu xong → giải thích cho QA tại sao lỗi đó xảy ra. |
| **5** | Sửa UI | Đọc **Bài 3**, sửa text/màu như hướng dẫn. Chạy thử xem giao diện thay đổi đúng chưa. |
| **6** | Vấn đáp module | QA hỏi 5 câu trong **Bài 3**. Bạn trả lời bằng cách chỉ ra file + dòng code. Ôn lại câu sai. |
| **7** | Vấn đáp liên module | QA hỏi câu hỏi chung (trong [BaiTap_4Learners.md](BaiTap_4Learners.md)). Ôn toàn bộ. |
| **8** | Tổng duyệt | Thuyết trình 5 phút về module của bạn. Trả lời câu hỏi chất vấn ngẫu nhiên. |

---

## Khi gặp vấn đề

| Tình huống | Giải quyết |
|-----------|-----------|
| Không chạy được dự án | Xem hướng dẫn setup trong [README.md](../../README.md) |
| Không tìm thấy file | Xem bảng "File cần đọc" trong file bài tập của bạn |
| Không hiểu code | Đọc comment trong code → hỏi QA → ghi chú lại |
| Không biết debug | Xem phần "Công cụ hỗ trợ" bên dưới |
| Lỗi không giống bài tập mô tả | Chụp screenshot Console/Network → hỏi QA |

---

## Công cụ hỗ trợ

### Swagger UI - Test API trực tiếp
- Mở: http://localhost:8080/swagger-ui.html
- Chọn endpoint → "Try it out" → nhập body → "Execute"
- API auth (`/api/auth/**`) không cần token
- API khác cần header: `Authorization: Bearer dev-token-USR001`

### H2 Console - Xem database
- Mở: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:karaoke`
- User: `sa`, Password: (trống)
- Nhập SQL trực tiếp để query, ví dụ: `SELECT * FROM tblUser`

### DevTools - Debug frontend
- Chrome: **F12**
- **tab Network:** Xem request/response API
- **tab Console:** Xem lỗi JavaScript
- **tab Sources:** Đặt breakpoint trong file `.tsx`

### IDE - Debug backend
- IntelliJ: Click dòng số bên trái → tạo breakpoint → Run > Debug
- VS Code + Java Extension: Tương tự
- Khi breakpoint dừng: hover chuột vào biến để xem giá trị

---

## Quy tắc

- **Đọc kỹ** file bài tập trước khi hỏi QA
- **Không sửa** file ngoài module của mình
- **Không commit** khi chưa được QA đồng ý
- **Ghi chú** những gì chưa hiểu để hỏi
- Khi gặp lỗi → **chụp screenshot** trước khi hỏi
