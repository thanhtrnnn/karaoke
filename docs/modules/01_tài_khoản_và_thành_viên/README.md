# Module 1: Tài khoản & Thành viên

## Tổng quan
Module này quản lý xác thực người dùng, quản lý tài khoản và thông tin cá nhân của tất cả người dùng trong hệ thống.

## Use Case chính
- **UC01: Đăng nhập** – Xác thực tài khoản để truy cập hệ thống theo phân quyền
- **UC02: Đăng ký** – Tạo tài khoản mới cho khách hàng mới (tên, SĐT, mật khẩu)
- **UC03: Đổi mật khẩu** – Cập nhật mật khẩu đăng nhập của người dùng
- **UC04: Quản lý thông tin cá nhân** – Xem, cập nhật họ tên, SĐT; kiểm tra hạng thẻ hội viên và điểm tích lũy

## Các Actor liên quan
- **Thành viên** (tất cả): Đăng nhập, Đổi mật khẩu
- **Khách hàng**: Đăng ký, Quản lý thông tin cá nhân

## Mục tiêu chính
1. Đảm bảo bảo mật và quản lý quyền truy cập
2. Cho phép người dùng quản lý thông tin cá nhân
3. Cung cấp cơ sở xác thực cho tất cả modules khác

## Biểu đồ có trong module
- [Use Case Diagram](use_case_diagram.md) – Mô tả các use case và quan hệ
- [Sequence Diagram](sequence_diagram.md) – Luồng tương tác giữa các thành phần
- [Activity Diagram](activity_diagram.md) – Quy trình hoạt động chi tiết
