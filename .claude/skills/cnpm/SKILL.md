---
name: cnpm
description: >
  Tự động tạo tài liệu phần mềm chuẩn Unified Process (UP) theo giáo trình Nhập môn
  Công nghệ Phần mềm. Kích hoạt skill này bất cứ khi nào người dùng đề cập đến:
  viết tài liệu UP, làm báo cáo CNPM, đặc tả use-case, phân tích thiết kế hệ thống
  theo module, vẽ biểu đồ lớp / tuần tự / ERD, viết kịch bản chuẩn & ngoại lệ,
  thiết kế CSDL theo UP, wireframe giao diện, viết test case hộp đen, hoặc bất kỳ
  yêu cầu nào liên quan đến 5 workflows / 4 pha của Unified Process. Luôn dùng skill
  này kể cả khi người dùng chỉ nói "làm phần requirements", "viết analysis cho module X",
  hay "sinh test case cho chức năng Y".
---

# UP Documentation Skill

Tạo tài liệu triển khai dự án phần mềm chuẩn **Unified Process (UP)** theo giáo trình
**Nhập môn Công nghệ Phần mềm**. 100% tiếng Việt. Biểu đồ UML dùng PlantUML.

---

## Nguyên tắc cốt lõi (BẮT BUỘC tuân thủ)

1. **Hướng Use-case:** Mọi phân tích, thiết kế đều xuất phát từ Use-case.
2. **BCE:** Luôn phân rã theo Boundary – Control – Entity.
3. **Phân biệt ngôn ngữ theo pha (NGHIÊM NGẶT):**
   - **Pha Phân tích:** Thông điệp sequence diagram = tiếng Việt tự nhiên (VD: `kiểm tra thông tin()`)
   - **Pha Thiết kế:** Thông điệp = tên hàm tiếng Anh đầy đủ (VD: `checkLogin(user: String): Boolean`)
4. **Văn bản:** 100% tiếng Việt (trừ tên hàm/biến ở pha Thiết kế).
5. **UML:** PlantUML trong code block plantuml.

---

## Luồng tổng thể

```
GIAI ĐOẠN 1 – Requirements TOÀN HỆ THỐNG
     → Bảng thuật ngữ
     → Mô hình nghiệp vụ bằng ngôn ngữ tự nhiên (2.1 → 2.6)
     → Mô hình nghiệp vụ bằng UML (3.1 → 3.3)
     ↓
GIAI ĐOẠN 2 – Đề xuất phân chia MODULE → chờ xác nhận
     ↓
GIAI ĐOẠN 3 – Với mỗi module (theo yêu cầu người dùng):
     Pha 1 – Requirements module:  [1] UC chi tiết  [2] Kịch bản
     Pha 2 – Analysis:             [3] Thực thể     [4] Lớp BCE   [5] Tuần tự PT
     Pha 3 – Design:               [6] Lớp TT TK   [7] ERD       [8] UI + Lớp TK   [9] Tuần tự TK
     Pha 4 – Test:                 [10] Test Plan + Test Case
```

---

## Hướng dẫn thực thi

### BƯỚC 0 – PLAN (BẮT BUỘC, luôn làm trước mọi thứ)

**Trước khi viết bất kỳ nội dung tài liệu nào**, phân tích yêu cầu của người dùng và sinh một **plan dưới dạng file `.md`** để user review và xác nhận.

Plan phải:
- **Xác định scope** dựa trên yêu cầu: toàn hệ thống, một module cụ thể, hay chỉ một vài mục.
- **Liệt kê từng mục sẽ viết** kèm thông tin quan trọng nhất đã suy luận được (không viết nội dung thật, chỉ tóm tắt những gì sẽ có).
- **Đặt câu hỏi làm rõ** nếu còn thiếu thông tin đầu vào quan trọng.

**Cấu trúc file plan:**

```markdown
# Plan tài liệu – [Tên hệ thống / Module / Phạm vi]

## Phạm vi
[Mô tả ngắn: viết toàn bộ / module X / chỉ mục Y, Z]

## Thông tin đầu vào đã có
- Tên hệ thống: ...
- Actor xác định được: ...
- Module / chức năng: ...
- Ngôn ngữ lập trình dự kiến (ảnh hưởng kiểu dữ liệu ở mục 6, 7): ...

## Câu hỏi cần làm rõ (nếu có)
- [ ] ...

## Danh sách mục sẽ viết

### [Tên giai đoạn / pha]
| Mục | Tên | Nội dung chính sẽ có |
|-----|-----|----------------------|
| 1 | Biểu đồ UC chi tiết | Actor: [A, B]; UC chính: [X]; UC con include: [a, b]; UC extend: [c] |
| 2 | Kịch bản chuẩn | UC [X]: [N] bước, ngoại lệ tại bước [3, 10, 24] |
| 3 | Thực thể phân tích | Lớp dự kiến: [A, B, C, D]; quan hệ n-n: [A–B] |
| 4 | Lớp BCE | Boundary: [Frm1, Frm2]; Entity: [A, B, C] |
| 5 | Tuần tự PT | [N] biểu đồ cho [N] UC |
| 6 | Lớp thực thể TK | Bổ sung kiểu dữ liệu Java; PK/FK; composition/aggregation |
| 7 | ERD | [N] bảng; bảng trung gian: [...] |
| 8 | Wireframe + Lớp TK | [N] màn hình; DAO cho: [A, B, C] |
| 9 | Tuần tự TK | [N] biểu đồ |
| 10 | Test Case | [N] TC; CSDL mẫu: [N] bảng |
```

Sau khi sinh plan, **chờ user xác nhận hoặc điều chỉnh** trước khi viết bất kỳ nội dung thật nào. Nếu user chỉ muốn làm một vài mục, chỉ giữ lại những mục đó trong plan rồi xác nhận lại.

---

### Giai đoạn 1 – Requirements toàn hệ thống
Đọc `references/requirements-system.md` và thực hiện đầy đủ.

Sau khi hoàn thành, **BẮT BUỘC** sinh đề xuất phân module theo mẫu:

```
Dựa trên các use-case đã xác định, mình đề xuất chia hệ thống thành [N] module:

| STT | Tên module | Phụ trách Use-case | Mô tả ngắn |
|-----|-----------|-------------------|------------|
| 1   | [Tên]     | UC01, UC02, ...   | ...        |
| 2   | [Tên]     | UC03, UC04, ...   | ...        |

Bạn có đồng ý với cách phân chia này không? Hay muốn điều chỉnh?
```

Chỉ tiếp tục khi người dùng xác nhận.

### Giai đoạn 3 – Triển khai từng module
Hỏi người dùng muốn bắt đầu với module nào.
Đọc `references/module-phases.md` và thực hiện đúng các mục đã được xác nhận trong plan.
Sau mỗi pha, hỏi: *"Pha [X] đã hoàn thành. Bạn có muốn điều chỉnh gì không trước khi sang pha tiếp theo?"*

---

## Định dạng đầu ra chung

- Tiêu đề mỗi mục: `## [Số]. [Tên mục] – Module: [Tên module]`
- Bảng Markdown chuẩn, có header rõ ràng.
- PlantUML đặt trong code block plantuml.
- Wireframe dùng ASCII box diagram (xem ví dụ trong `references/module-phases.md`).
