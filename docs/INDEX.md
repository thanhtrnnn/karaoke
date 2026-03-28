# Tài Liệu Dự Án - Hệ Thống Quản Lý Chuỗi Nhà Hàng Karaoke

## Cấu Trúc Thư Mục

```
docs/
├── README.md (bạn đang đọc)
├── biểu_đồ_5_modules.md - Tổng quan 5 modules chính
├── requirements_karaoke.md - Yêu cầu dự án chi tiết
│
├── modules/ - Biểu đồ cho từng module
│   ├── 01_tai_khoan_va_thanh_vien/
│   │   ├── README.md
│   │   ├── usecase/
│   │   │   ├── README.md
│   │   │   └── diagram.puml
│   │   ├── entity/
│   │   │   ├── README.md
│   │   │   └── diagram.puml
│   │   ├── sequence/
│   │   │   ├── README.md
│   │   │   └── diagram.puml
│   │   ├── activity/
│   │   │   ├── README.md
│   │   │   └── diagram.puml
│   │   └── bce/
│   │       ├── README.md
│   │       └── diagram.puml
│   │
│   ├── 02_quan_ly_dat_va_tra_phong/ (cấu trúc tương tự)
│   ├── 03_dich_vu_va_kho_hang/ (cấu trúc tương tự)
│   ├── 04_quan_tri_cot_loi_va_nhan_su/ (cấu trúc tương tự)
│   └── 05_bao_cao_va_thong_ke/ (cấu trúc tương tự)
│
└── usecase/ - Biểu đồ Use Case tổng quan
    ├── README.md - Danh sách tất cả 22 UC
    ├── tong_quan.puml - Biểu đồ UC tổng quan
    ├── phan_ra_uc01_dang_nhap.puml
    ├── phan_ra_uc02_dang_ky.puml
    ├── phan_ra_uc03_doi_mat_khau.puml
    ├── phan_ra_uc04_quan_ly_ttcn.puml
    ├── phan_ra_uc05_dat_phong.puml
    ├── phan_ra_uc06_goi_mon.puml
    ├── phan_ra_uc07_quan_ly_dat_phong.puml
    ├── phan_ra_uc08_quan_ly_tra_phong.puml
    ├── phan_ra_uc09_kiem_ke_hang.puml
    ├── phan_ra_uc10_quan_ly_order.puml
    ├── phan_ra_uc11_bao_cao_hang_hoa.puml
    ├── phan_ra_uc12_quan_ly_nhan_vien.puml
    ├── phan_ra_uc13_quan_ly_kho.puml
    ├── phan_ra_uc14_bao_cao_chi_nhanh.puml
    ├── phan_ra_uc15_thong_tin_kh.puml
    ├── phan_ra_uc16_quan_ly_he_thong.puml
    ├── phan_ra_uc17_quan_ly_danh_muc.puml
    ├── phan_ra_uc18_quan_ly_kh_toan_he_thong.puml
    ├── phan_ra_uc19_quan_ly_hang_hoi_vien.puml
    ├── phan_ra_uc20_quan_ly_phong_hat.puml
    ├── phan_ra_uc21_quan_ly_tai_khoan_nv.puml
    └── phan_ra_uc22_tong_hop_bao_cao.puml
```

## 5 Module Chính

### 1. **Tài Khoản & Thành Viên** 
`modules/01_tai_khoan_va_thanh_vien/`
- UC01: Đăng nhập
- UC02: Đăng ký
- UC03: Đổi mật khẩu
- UC04: Quản lý thông tin cá nhân

### 2. **Quản Lý Đặt & Trả Phòng**
`modules/02_quan_ly_dat_va_tra_phong/`
- UC05: Đặt phòng
- UC07: Quản lý đặt phòng
- UC08: Quản lý trả phòng

### 3. **Dịch Vụ & Kho Hàng**
`modules/03_dich_vu_va_kho_hang/`
- UC06: Tương tác dịch vụ (Gọi món)
- UC09: Kiểm kê hàng tại quầy
- UC10: Quản lý order
- UC11: Báo cáo tình trạng hàng hóa
- UC13: Quản lý kho

### 4. **Quản Trị Cốt Lõi & Nhân Sự**
`modules/04_quan_tri_cot_loi_va_nhan_su/`
- UC12: Quản lý nhân viên chi nhánh
- UC16: Quản lý hệ thống chi nhánh
- UC17: Quản lý danh mục chung
- UC20: Quản lý phòng hát
- UC21: Quản lý tài khoản nhân viên

### 5. **Báo Cáo & Thống Kê**
`modules/05_bao_cao_va_thong_ke/`
- UC14: Báo cáo số liệu chi nhánh
- UC15: Xem thông tin khách hàng chi nhánh
- UC18: Quản lý khách hàng toàn hệ thống
- UC19: Quản lý hạng hội viên
- UC22: Tổng hợp báo cáo toàn chuỗi

## Các Loại Biểu Đồ

Mỗi module chứa 5 loại biểu đồ UML:

1. **Use Case Diagram** - Mô tả các use case và quan hệ
2. **Entity Diagram** - Cấu trúc dữ liệu và quan hệ entity
3. **Sequence Diagram** - Luồng tương tác giữa các thành phần
4. **Activity Diagram** - Quy trình hoạt động chi tiết
5. **BCE Diagram** - Kiến trúc lớp (Boundary, Control, Entity)

## Cách Sử Dụng

### Để xem biểu đồ PlantUML:
1. Mở file `.puml` tương ứng
2. Copy nội dung
3. Paste vào https://www.plantuml.com/plantuml
4. Render và xem biểu đồ

### Để cập nhật biểu đồ:
1. Mở file `.puml` trong editor
2. Chỉnh sửa mã PlantUML
3. Lưu file
4. Render lại trên PlantUML Editor

## Lưu Ý

- Các file `.puml` là biểu đồ trống, cần điền chi tiết
- Các file `README.md` chứa mô tả của từng biểu đồ
- Tên folder và file không chứa dấu (tiếng Việt không dấu)
- Cấu trúc này tuân theo quy chuẩn UP (Unified Process)
