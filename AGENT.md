# HỆ THỐNG QUẢN LÝ CHUỖI NHÀ HÀNG KARAOKE

> Xem thêm: [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) để biết cấu trúc thư mục chi tiết.

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Dự án "Hệ thống Quản lý Chuỗi Nhà hàng Karaoke" là một phần mềm quản lý tập trung đa chi nhánh. Mục tiêu cốt lõi:
* Tối ưu hóa quy trình vận hành tại từng chi nhánh, giảm sai sót thủ công trong quản lý phòng, gọi món và thanh toán.
* Đồng bộ dữ liệu giữa các chi nhánh trong thời gian thực, đảm bảo tính nhất quán về thông tin hội viên, tồn kho và doanh thu.
* Nâng cao trải nghiệm khách hàng thông qua các tính năng đặt phòng online, tích điểm và xem lịch sử sử dụng dịch vụ.
* Hỗ trợ ra quyết định chiến lược cho ban lãnh đạo thông qua hệ thống báo cáo doanh thu thực tế.

## 2. QUY TRÌNH PHÁT TRIỂN (SOFTWARE PROCESS)
Dự án áp dụng chặt chẽ phương pháp luận **Unified Process (UP)** và mô hình cải tiến quy trình **CMM**:
* **Unified Process (UP):** Dự án được triển khai qua 4 pha tiêu chuẩn: Khởi tạo (Inception), Khảo sát tỉ mỉ (Elaboration), Xây dựng (Construction) và Chuyển giao (Transition). Phương pháp phát triển lặp (Iterative) được áp dụng để chia dự án thành các "mini-project" nhỏ.
* **Capability Maturity Model (CMM):** Tổ chức phát triển cam kết chuyển đổi từ quy trình hỗn loạn (Level 1) lên mức chuẩn hóa (Level 3), áp dụng các kỷ luật như quản lý version (Git), quản lý task (Jira/Trello), và thống nhất Code Convention.

## 3. CÔNG NGHỆ (TECH STACK)

| Tầng | Công nghệ | Vai trò |
|------|-----------|---------|
| **Frontend (Web)** | React.js | Web App cho khách hàng và quản lý |
| **Frontend (Mobile)** | React Native | App cho nhân viên phục vụ |
| **Backend** | Java / Spring Boot | REST API Server xử lý nghiệp vụ |
| **Database** | PostgreSQL | CSDL quan hệ chính |
| **Cache** | Redis | Xử lý dữ liệu thời gian thực |
| **ORM** | Spring Data JPA / Hibernate | Truy vấn CSDL |
| **Version Control** | Git | Quản lý mã nguồn |
| **Build Tool** | Maven / Gradle | Quản lý dependency và build |
| **Task Management** | Jira / Trello | Quản lý công việc |
| **Diagram** | PlantUML | Vẽ biểu đồ UML trong tài liệu |

## 4. KIẾN TRÚC HỆ THỐNG (SOFTWARE ARCHITECTURE)
Hệ thống lấy kiến trúc làm trung tâm (Architecture-Centric), được thiết kế theo mô hình **MVC 3 tầng (3-tier architecture)** kết hợp khả năng hoạt động đa chi nhánh:
* **Presentation Layer (Front-end):** Sử dụng React.js cho Web App (dành cho khách hàng và quản lý) và React Native cho Mobile App (dành cho nhân viên phục vụ).
* **Business Logic Layer (Back-end):** Sử dụng Java / Spring Boot để xây dựng REST API Server xử lý nghiệp vụ, kết hợp Spring Data JPA / Hibernate cho ORM.
* **Data Layer:** Sử dụng CSDL quan hệ PostgreSQL làm trung tâm, kết hợp Redis Cache để xử lý dữ liệu thời gian thực. Mỗi chi nhánh có khả năng hoạt động offline và đồng bộ lên server khi có kết nối mạng.

## 5. TÁC NHÂN HỆ THỐNG (SYSTEM ACTORS)
Hệ thống phục vụ 5 nhóm người dùng chính, kế thừa từ lớp Actor tổng quát là "Thành viên":

| Tác nhân | Vai trò và Trách nhiệm |
| :--- | :--- |
| **Khách hàng (Client)** | Đặt phòng online, gọi món, xem lịch sử và quản lý điểm thưởng hội viên qua Web/App. |
| **Nhân viên lễ tân (Receptionist)** | Xếp phòng, check-in/out, lập hóa đơn, tiếp nhận khách walk-in và kiểm kê hàng tại quầy. |
| **Nhân viên phục vụ (Service Staff)** | Nhận order, cập nhật trạng thái phục vụ và báo cáo tình trạng tài sản/hàng hóa. |
| **Quản lý chi nhánh (Branch Manager)** | Giám sát chi nhánh, quản lý nhân viên, theo dõi kho hàng và xem báo cáo cục bộ. |
| **Chủ doanh nghiệp (Admin)** | Quản lý danh mục chung toàn chuỗi (menu, giá), cấu hình chi nhánh và phân tích báo cáo tổng hợp. |

## 6. PHÂN HỆ CHỨC NĂNG (SYSTEM MODULES)
Hệ thống được chia thành 5 module chính. Xem [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) cho cấu trúc thư mục chi tiết.

### Module 1: Xác thực & Thành viên (Auth & Membership)
- UC01: Đăng nhập
- UC02: Đăng ký
- UC03: Đổi mật khẩu
- UC04: Quản lý thông tin cá nhân

### Module 2: Quản lý Đặt và Trả phòng (Booking & Checkout)
- UC05: Đặt phòng
- UC07: Quản lý đặt phòng
- UC08: Quản lý trả phòng

### Module 3: Dịch vụ & Kho hàng (Services & Inventory)
- UC06: Tương tác dịch vụ (Gọi món)
- UC09: Kiểm kê hàng tại quầy
- UC10: Quản lý order
- UC11: Báo cáo tình trạng hàng hóa
- UC13: Quản lý kho

### Module 4: Quản trị Cốt lõi & Nhân sự (Core Admin & HR)
- UC12: Quản lý nhân viên chi nhánh
- UC16: Quản lý hệ thống chi nhánh
- UC17: Quản lý danh mục chung
- UC20: Quản lý phòng hát
- UC21: Quản lý tài khoản nhân viên

### Module 5: Báo cáo & Thống kê (Reporting & Analytics)
- UC14: Báo cáo số liệu chi nhánh
- UC15: Xem thông tin khách hàng chi nhánh
- UC18: Quản lý khách hàng toàn hệ thống
- UC19: Quản lý hạng hội viên
- UC22: Tổng hợp báo cáo toàn chuỗi

## 7. MÔ HÌNH THỰC THỂ LÕI (CORE ENTITIES)
Các lớp thực thể lưu trữ dữ liệu (Entity Classes) tạo nên xương sống của CSDL PostgreSQL:
* **Định danh:** `User` (lưu thông tin đăng nhập, phân quyền); `Member` (kế thừa từ User, lưu hồ sơ khách hàng, điểm thưởng); `Employee` (kế thừa từ User, lưu thông tin ca làm việc).
* **Vận hành:** `Branch` (Chi nhánh); `Room` (Phòng hát).
* **Giao dịch:** `Booking` (Phiên đặt phòng); `Invoice` (Hóa đơn thanh toán).
* **Hàng hóa & Kho:** `MenuItem` / `Product` (Sản phẩm kinh doanh); `Order` & `OrderItem` (Phiếu gọi món); `Inventory` (Quản lý tồn kho).

## 8. QUY ƯỚC PHÁT TRIỂN (CONVENTIONS)

### Quy ước code
- Ngôn ngữ backend: Java (Spring Boot)
- Ngôn ngữ frontend: JavaScript/TypeScript (React.js, React Native)
- Backend: Spring Boot với Spring Data JPA / Hibernate
- API: RESTful API
- CSDL: PostgreSQL, đặt tên bảng dạng `tblTenBang`
- Build: Maven hoặc Gradle

### Quy ước tài liệu
- Ngôn ngữ tài liệu: 100% tiếng Việt
- Định dạng biểu đồ: PlantUML (file `.puml`)
- Tài liệu tuân theo quy trình Unified Process (UP)
- Sử dụng skill `cnpm` trong Claude Code để tự động sinh tài liệu UP

### Quy ước Git
- Quản lý version bằng Git
- Branch: `main` (sản phẩm), `develop` (phát triển), `feature/*` (tính năng)
- Commit message: tiếng Anh, ngắn gọn, mô tả rõ thay đổi

### Quy ước đặt tên
- Thư mục module: `{STT}_{ten_module_khong_dau}` (VD: `01_tai_khoan_va_thanh_vien`)
- File PlantUML: `diagram.puml` trong thư mục con
- File mô tả: `README.md` trong mỗi thư mục
- UC tổng quan: `phan_ra_uc{STT}_{ten_uc}.puml`

---

*Tài liệu này đóng vai trò là "Single Source of Truth" (Nguồn chân lý duy nhất) cho các Agent lập trình, kỹ sư phần mềm và chuyên viên phân tích nghiệp vụ khi tham gia vào dự án.*
