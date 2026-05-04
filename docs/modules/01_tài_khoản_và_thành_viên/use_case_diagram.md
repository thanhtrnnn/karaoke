# Use Case Diagram – Module 1: Tài khoản & Thành viên

## Biểu đồ PlantUML

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Thành viên" as Member
actor "Khách hàng" as Client

Client --|> Member

package "Tài khoản & Thành viên" {
  usecase "Đăng nhập" as UC01
  usecase "Đăng ký" as UC02
  usecase "Đổi mật khẩu" as UC03
  usecase "Quản lý thông tin cá nhân" as UC04
  usecase "Cập nhật thông tin" as UC04_update
  usecase "Kiểm tra hạng thẻ hội viên" as UC04_check
  usecase "Xem điểm tích lũy" as UC04_points
  
  UC04 --> UC04_update : include
  UC04 --> UC04_check : include
  UC04 --> UC04_points : include
}

Member --> UC01
Member --> UC03
Client --> UC02
Client --> UC04

@enduml
```

## Mô tả Use Case
| Use Case | Actor | Mô tả |
|----------|-------|-------|
| **UC01: Đăng nhập** | Thành viên | Xác thực tài khoản bằng tên đăng nhập/email và mật khẩu |
| **UC02: Đăng ký** | Khách hàng | Tạo tài khoản mới: họ tên, số điện thoại, email, mật khẩu |
| **UC03: Đổi mật khẩu** | Thành viên | Cập nhật mật khẩu hiện tại (xác thực mật khẩu cũ) |
| **UC04: Quản lý TTCN** | Khách hàng | Xem/cập nhật thông tin cá nhân, kiểm tra hạng thẻ và điểm |
