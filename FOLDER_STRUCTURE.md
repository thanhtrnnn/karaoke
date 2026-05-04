# Cấu Trúc Thư Mục Dự Án

## Tổng quan

```
btl_karaoke/
├── AGENT.md                    # Hướng dẫn cho AI Agent khi làm việc với dự án
├── FOLDER_STRUCTURE.md         # Tài liệu này
├── .gitignore                  # Các file/thư mục bị bỏ qua bởi Git
│
├── docs/                       # Tài liệu dự án (UP documentation)
│   ├── INDEX.md                # Mục lục tài liệu + danh sách 22 UC
│   ├── requirements_karaoke.md # Yêu cầu dự án chi tiết
│   │
│   ├── usecase/                # Biểu đồ Use Case tổng quan hệ thống
│   │   ├── README.md           # Danh sách 22 UC
│   │   ├── tong_quan.puml      # Biểu đồ UC tổng quan toàn hệ thống
│   │   ├── phan_ra_uc01_dang_nhap.puml
│   │   ├── phan_ra_uc02_dang_ky.puml
│   │   ├── ...                 # UC03 → UC22
│   │   └── phan_ra_uc22_tong_hop_bao_cao.puml
│   │
│   └── modules/                # Tài liệu chi tiết từng module
│       ├── 01_tai_khoan_va_thanh_vien/
│       │   ├── README.md       # Mô tả module
│       │   ├── usecase/        # UC chi tiết module
│       │   │   ├── README.md
│       │   │   └── diagram.puml
│       │   ├── entity/         # Biểu đồ thực thể phân tích
│       │   │   ├── README.md
│       │   │   └── diagram.puml
│       │   ├── sequence/       # Biểu đồ tuần tự phân tích
│       │   │   ├── README.md
│       │   │   └── diagram.puml
│       │   ├── activity/       # Biểu đồ hoạt động
│       │   │   ├── README.md
│       │   │   └── diagram.puml
│       │   └── bce/            # Biểu đồ lớp BCE (Boundary-Control-Entity)
│       │       ├── README.md
│       │       └── diagram.puml
│       │
│       ├── 02_quan_ly_dat_va_tra_phong/   # (cấu trúc tương tự)
│       ├── 03_dich_vu_va_kho_hang/
│       ├── 04_quan_tri_cot_loi_va_nhan_su/
│       └── 05_bao_cao_va_thong_ke/
│
├── backend/                    # Back-end (Java / Spring Boot) — chưa khởi tạo
├── frontend/                   # Front-end (React.js) — chưa khởi tạo
│
├── tmp/                        # File tham khảo tạm thời
│   ├── 2.4_ref.txt             # Tham khảo format mục 2.4
│   └── 2.6_ref.txt             # Tham khảo format mục 2.6
│
└── .claude/                    # Cấu hình Claude Code
    ├── skills/                 # Skills cho Claude Code
    │   └── cnpm.skill          # Skill tự động tạo tài liệu UP
    └── settings.local.json     # Cấu hình local
```

## Chi tiết các module

| STT | Module | UC phụ trách | Mô tả |
|-----|--------|-------------|--------|
| 1 | Tài khoản & Thành viên | UC01–UC04 | Đăng nhập, đăng ký, đổi mật khẩu, quản lý thông tin cá nhân |
| 2 | Quản lý Đặt & Trả phòng | UC05, UC07, UC08 | Đặt phòng, quản lý đặt phòng, quản lý trả phòng |
| 3 | Dịch vụ & Kho hàng | UC06, UC09–UC11, UC13 | Gọi món, kiểm kê, quản lý order, báo cáo hàng hóa, quản lý kho |
| 4 | Quản trị Cốt lõi & Nhân sự | UC12, UC16, UC17, UC20, UC21 | Quản lý nhân viên, hệ thống chi nhánh, danh mục, phòng hát, tài khoản NV |
| 5 | Báo cáo & Thống kê | UC14, UC15, UC18, UC19, UC22 | Báo cáo chi nhánh, thông tin KH, quản lý KH toàn hệ thống, hạng hội viên, tổng hợp báo cáo |

## Quy ước đặt tên

- **Thư mục module:** `{STT}_{ten_module_khong_dau}` (VD: `01_tai_khoan_va_thanh_vien`)
- **File PlantUML:** `diagram.puml` trong thư mục con tương ứng
- **File Markdown:** `README.md` trong mỗi thư mục để mô tả
- **UC tổng quan:** `phan_ra_uc{STT}_{ten_uc}.puml`
- Ngôn ngữ tài liệu: 100% tiếng Việt
- Định dạng biểu đồ: PlantUML (`.puml`)
