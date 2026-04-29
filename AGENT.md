# HỆ THỐNG QUẢN LÝ CHUỖI NHÀ HÀNG KARAOKE

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Dự án "Hệ thống Quản lý Chuỗi Nhà hàng Karaoke" là một phần mềm quản lý tập trung đa chi nhánh[cite: 8]. Mục tiêu cốt lõi của hệ thống bao gồm:
* Tối ưu hóa quy trình vận hành tại từng chi nhánh, giảm sai sót thủ công trong quản lý phòng, gọi món và thanh toán[cite: 8].
* Đồng bộ dữ liệu giữa các chi nhánh trong thời gian thực, đảm bảo tính nhất quán về thông tin hội viên, tồn kho và doanh thu[cite: 9].
* Nâng cao trải nghiệm khách hàng thông qua các tính năng đặt phòng online, tích điểm và xem lịch sử sử dụng dịch vụ[cite: 10].
* Hỗ trợ ra quyết định chiến lược cho ban lãnh đạo thông qua hệ thống báo cáo doanh thu thực tế[cite: 11].

## 2. QUY TRÌNH PHÁT TRIỂN (SOFTWARE PROCESS)
Dự án áp dụng chặt chẽ phương pháp luận **Unified Process (UP)** và mô hình cải tiến quy trình **CMM**:
* **Unified Process (UP):** Dự án được triển khai qua 4 pha tiêu chuẩn: Khởi tạo (Inception), Khảo sát tỉ mỉ (Elaboration), Xây dựng (Construction) và Chuyển giao (Transition)[cite: 141, 142, 143, 144, 145]. Phương pháp phát triển lặp (Iterative) được áp dụng để chia dự án thành các "mini-project" nhỏ[cite: 42, 43].
* **Capability Maturity Model (CMM):** Tổ chức phát triển cam kết chuyển đổi từ quy trình hỗn loạn (Level 1) lên mức chuẩn hóa (Level 3), áp dụng các kỷ luật như quản lý version (Git), quản lý task (Jira/Trello), và thống nhất Code Convention[cite: 148, 153, 159].

## 3. KIẾN TRÚC HỆ THỐNG (SOFTWARE ARCHITECTURE)
Hệ thống lấy kiến trúc làm trung tâm (Architecture-Centric), được thiết kế theo mô hình **MVC 3 tầng (3-tier architecture)** kết hợp khả năng hoạt động đa chi nhánh[cite: 35, 37, 70]:
* **Presentation Layer (Front-end):** Sử dụng React.js cho Web App (dành cho khách hàng và quản lý) và React Native cho Mobile App (dành cho nhân viên phục vụ)[cite: 37, 38].
* **Business Logic Layer (Back-end):** Sử dụng Node.js/Express để xây dựng API Server xử lý nghiệp vụ[cite: 38].
* **Data Layer:** Sử dụng CSDL quan hệ PostgreSQL làm trung tâm, kết hợp Redis Cache để xử lý dữ liệu thời gian thực[cite: 39]. Mỗi chi nhánh có khả năng hoạt động offline và đồng bộ lên server khi có kết nối mạng[cite: 40].

## 4. TÁC NHÂN HỆ THỐNG (SYSTEM ACTORS)
Hệ thống phục vụ 5 nhóm người dùng chính, kế thừa từ lớp Actor tổng quát là "Thành viên"[cite: 232]:

| Tác nhân | Vai trò và Trách nhiệm |
| :--- | :--- |
| **Khách hàng (Client)** | Đặt phòng online, gọi món, xem lịch sử và quản lý điểm thưởng hội viên qua Web/App[cite: 22, 23, 216, 217]. |
| **Nhân viên lễ tân (Receptionist)** | Xếp phòng, check-in/out, lập hóa đơn, tiếp nhận khách walk-in và kiểm kê hàng tại quầy[cite: 24, 218]. |
| **Nhân viên phục vụ (Service Staff)** | Nhận order, cập nhật trạng thái phục vụ và báo cáo tình trạng tài sản/hàng hóa[cite: 25, 219]. |
| **Quản lý chi nhánh (Branch Manager)** | Giám sát chi nhánh, quản lý nhân viên, theo dõi kho hàng và xem báo cáo cục bộ[cite: 26, 220]. |
| **Chủ doanh nghiệp (Admin)** | Quản lý danh mục chung toàn chuỗi (menu, giá), cấu hình chi nhánh và phân tích báo cáo tổng hợp[cite: 27, 221]. |

## 5. PHÂN HỆ CHỨC NĂNG (SYSTEM MODULES)
Theo quy trình phân tích hướng đối tượng (OOA), hệ thống được chia thành 5 module chính để quản lý Boundary, Control và Entity[cite: 436, 437, 438, 439]:

1.  **Module 1: Xác thực & Thành viên (Auth & Membership)**
    * *Use Cases:* Đăng nhập/Đăng ký, Đổi mật khẩu, Quản lý thông tin cá nhân[cite: 401, 436].
2.  **Module 2: Quản lý Đặt và Trả phòng (Booking & Checkout)**
    * *Use Cases:* Xếp phòng cho khách online/vãng lai, chốt giờ, cộng dồn dịch vụ và xuất hóa đơn[cite: 408, 409, 436, 437].
3.  **Module 3: Dịch vụ & Kho hàng (Services & Inventory)**
    * *Use Cases:* Khách gọi món/dịch vụ, kiểm kê hàng tại quầy, báo cáo tình trạng tài sản/hàng hóa[cite: 437].
4.  **Module 4: Quản trị Cốt lõi & Nhân sự (Core Admin & HR)**
    * *Use Cases:* Quản lý nhân viên chi nhánh, cấu hình hệ thống chi nhánh, thiết lập danh mục chung (Menu, Bảng giá)[cite: 437, 438].
5.  **Module 5: Báo cáo & Thống kê (Reporting & Analytics)**
    * *Use Cases:* Xuất báo cáo số liệu (doanh thu, tỉ lệ lấp đầy) và tổng hợp báo cáo toàn chuỗi[cite: 438, 439].

## 6. MÔ HÌNH THỰC THỂ LÕI (CORE ENTITIES)
Các lớp thực thể lưu trữ dữ liệu (Entity Classes) tạo nên xương sống của CSDL PostgreSQL:
* **Định danh:** `User` (lưu thông tin đăng nhập, phân quyền)[cite: 531]; `Member` (kế thừa từ User, lưu hồ sơ khách hàng, điểm thưởng)[cite: 532]; `Employee` (kế thừa từ User, lưu thông tin ca làm việc)[cite: 425].
* **Vận hành:** `Branch` (Chi nhánh)[cite: 424]; `Room` (Phòng hát)[cite: 202].
* **Giao dịch:** `Booking` (Phiên đặt phòng)[cite: 204]; `Invoice` (Hóa đơn thanh toán)[cite: 205].
* **Hàng hóa & Kho:** `MenuItem` / `Product` (Sản phẩm kinh doanh)[cite: 410]; `Order` & `OrderItem` (Phiếu gọi món)[cite: 411]; `Inventory` (Quản lý tồn kho)[cite: 412].

*** *Tài liệu này đóng vai trò là "Single Source of Truth" (Nguồn chân lý duy nhất) cho các Agent lập trình, kỹ sư phần mềm và chuyên viên phân tích nghiệp vụ khi tham gia vào dự án.*