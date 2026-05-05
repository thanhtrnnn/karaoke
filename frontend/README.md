# Midnight Elegance - Frontend Architecture

Tài liệu này mô tả chi tiết kiến trúc tổng thể, cấu trúc thư mục và nguyên lý hoạt động của luồng Frontend trong dự án **Midnight Elegance - Hệ thống quản lý Karaoke**. 

Toàn bộ Source Code được xây dựng bằng **React 18**, **TypeScript**, **Vite** và **Tailwind CSS**, định hướng theo mô hình SPA (Single Page Application) với hiệu năng cao và khả năng mở rộng tốt.

---

## 1. Cấu trúc thư mục (Directory Structure)

Thư mục `src/` được quy hoạch theo chuẩn Best Practice của React, phân tách rõ ràng giữa UI (Giao diện), Logic (Xử lý) và Data (Dữ liệu).

```text
frontend/src/
├── assets/          # Chứa tài nguyên tĩnh (Static files) như Logo, hình nền (hero.png), SVG.
├── components/      # Chứa các UI Component dùng chung (Reusable).
│   ├── BottomNavBar.tsx # Thanh điều hướng phụ cho giao diện Mobile.
│   ├── Sidebar.tsx      # Thanh Menu điều hướng chính (Bên trái màn hình).
│   └── TopAppBar.tsx    # Thanh Header (Tìm kiếm, Thông báo, Profile, Toggle Theme).
├── data/            # Chứa dữ liệu giả lập (Mock Data) dùng cho giai đoạn Prototype.
│   └── mockData.ts      # Toàn bộ database tĩnh (Phòng, Khách hàng, Menu, Hoá đơn).
├── layouts/         # Cấu trúc khung (Layout Wrappers) bọc ngoài các trang.
│   ├── AuthLayout.tsx   # Khung giao diện trống dành riêng cho Đăng nhập/Đăng ký.
│   └── MainLayout.tsx   # Khung giao diện chính (bao gồm Sidebar + TopAppBar + Content).
├── pages/           # Chứa 19 màn hình chức năng của hệ thống (Views/Screens).
├── store/           # Quản lý trạng thái toàn cục (Global State) của ứng dụng.
│   └── uiStore.ts       # Sử dụng Zustand để quản lý trạng thái Đóng/Mở Sidebar.
├── App.tsx          # Cấu hình Routing (Định tuyến) tổng cho toàn bộ ứng dụng.
├── index.css        # File CSS gốc cấu hình Design Tokens (Biến màu) cho Tailwind.
└── main.tsx         # Điểm khởi chạy (Entry Point) của React DOM.
```

---

## 2. Nguyên lý hoạt động và Luồng dữ liệu (Data & Execution Flow)

### Điểm khởi chạy: `main.tsx` & `App.tsx`
Hệ thống bắt đầu render từ `main.tsx`. File này sẽ mount Component `<App />` vào DOM. 
Tại `App.tsx`, dự án sử dụng `react-router-dom` v6 để quản lý luồng điều hướng (Routing). Có 2 cơ chế quan trọng được cấu hình tại đây:
- **ScrollToTop:** Tự động reset thanh cuộn về vị trí cao nhất (Top = 0) mỗi khi chuyển trang, khắc phục điểm yếu lưu vị trí cuộn mặc định của trình duyệt trong kiến trúc SPA.
- **Phân luồng Layout:** Hệ thống chia làm 2 nhánh chính: `AuthLayout` (không có menu điều hướng, chỉ hiện Form) và `MainLayout` (có hệ thống menu bao quanh, dùng thẻ `<Outlet />` để render nội dung động ở giữa).
- **Fallback 404:** Một Route `*` chặn cuối cùng để hứng mọi URL không hợp lệ và hiển thị giao diện báo lỗi chuyên nghiệp.

### Luồng Giao diện & Component (UI Flow)
Khi người dùng truy cập một chức năng (Ví dụ: `/rooms`), luồng xử lý như sau:
1. `MainLayout` được gọi. Nó render `<Sidebar />` và `<TopAppBar />`.
2. Nội dung của thẻ `<Outlet />` được thay thế bằng Component `<RoomManagement />` (nằm trong thư mục `pages/`).
3. Trong `RoomManagement.tsx`, Component sẽ khởi tạo Local State (`useState`) bằng cách lấy dữ liệu mồi từ `data/mockData.ts`.
4. Mọi tương tác của người dùng (Thêm/Sửa/Xóa, Tìm kiếm, Lọc) đều tương tác trực tiếp lên Local State này, giúp giao diện phản hồi (Re-render) ngay lập tức theo cơ chế Reactivity.

### Luồng Quản lý State toàn cục (Zustand)
Thay vì sử dụng Redux quá cồng kềnh cho một nhu cầu đơn giản, dự án sử dụng **Zustand** tại `store/uiStore.ts`. 
Mục đích chính của Store này là lưu trữ trạng thái `isSidebarOpen` (dành cho chế độ Mobile). Nhờ đó, nút Menu ở `TopAppBar` có thể ra lệnh mở `Sidebar` mà không cần phải truyền Props phức tạp (Prop-drilling) qua nhiều tầng Component.

### Luồng chuẩn bị cho Backend (API Integration)
Thiết kế hiện tại đã tách biệt hoàn toàn Data layer (`mockData.ts`) khỏi View layer (`pages/`). Khi tiến hành tích hợp Backend (NodeJS/Express), Developer chỉ cần:
1. Khởi tạo một thư mục `services/` hoặc `api/` chứa cấu hình Axios.
2. Xóa các biến nhập từ `mockData` ở trong các file Page.
3. Sử dụng `useEffect` (hoặc lý tưởng nhất là `React Query`) để gọi API lấy dữ liệu thực tế từ Database gán vào các State.

---

## 3. Hệ thống Design System & Styling

Hệ thống được thiết kế chặt chẽ theo Concept **"Midnight Elegance"**.

- **Biến CSS & Tailwind:** Tại file `index.css`, chúng ta không can thiệp CSS thuần, mà sử dụng cơ chế `@layer base` để tiêm (inject) các biến màu (CSS Variables) theo chuẩn Material Design 3 (vd: `--color-primary-container`, `--color-surface`).
- **Lợi ích:** Tailwind CSS trong file `tailwind.config.cjs` được map trực tiếp vào các biến CSS này. Nhờ đó, ứng dụng có thể chuyển đổi mượt mà giữa Light Mode và Dark Mode (Midnight) chỉ bằng cách đổi class `.dark` ở thẻ gốc (`<html>`). Không cần thiết lập thủ công các class `dark:bg-xyz` dài dòng trên từng thẻ HTML.
- **UI Nhất quán:** Các thành phần dễ bị phá vỡ giao diện trên các trình duyệt khác nhau (như thẻ `<select>`, thanh cuộn) đều đã được chuẩn hóa lại thông qua các lớp Utility đặc thù (`appearance-none`, `bg-none`) để đảm bảo Icon custom luôn hiển thị chính xác.

---

## 4. Hướng dẫn khởi chạy dự án

**Cài đặt thư viện:**
```bash
npm install
```

**Chạy môi trường phát triển (Development):**
```bash
npm run dev
```

**Build để đưa lên Production:**
```bash
npm run build
```
