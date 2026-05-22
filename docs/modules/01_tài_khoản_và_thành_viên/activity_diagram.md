# Activity Diagram – Module 1: Tài khoản & Thành viên

## 1. Quy trình Đăng nhập (UC01)

```plantuml
@startuml
start
:Mở ứng dụng;
:Nhập tên đăng nhập;
:Nhập mật khẩu;
:Click nút Đăng nhập;
:Hệ thống kiểm tra thông tin;
if (Tài khoản có tồn tại?) then (Có)
  if (Mật khẩu đúng?) then (Có)
    :Cập nhật lần đăng nhập cuối;
    :Lưu session người dùng;
    :Chuyển đến trang chủ;
    end
  else (Sai)
    :Hiển thị thông báo "Mật khẩu sai";
    end
  endif
else (Không)
  :Hiển thị thông báo "Tài khoản không tồn tại";
  end
endif
@enduml
```

## 2. Quy trình Đăng ký (UC02)

```plantuml
@startuml
start
:Mở trang đăng ký;
:Nhập họ tên;
:Nhập số điện thoại;
:Nhập email;
:Nhập mật khẩu;
:Nhập xác nhận mật khẩu;
:Click nút Đăng ký;
if (Email đã tồn tại?) then (Có)
  :Hiển thị thông báo "Email đã được đăng ký";
  end
else (Không)
  if (SĐT đã tồn tại?) then (Có)
    :Hiển thị thông báo "SĐT đã được đăng ký";
    end
  else (Không)
    if (Mật khẩu = Xác nhận?) then (Có)
      :Mã hóa mật khẩu;
      :Lưu tài khoản mới vào DB;
      :Gửi email xác nhận;
      :Hiển thị thông báo "Đăng ký thành công";
      :Chuyển đến trang đăng nhập;
      end
    else (Sai)
      :Hiển thị thông báo "Mật khẩu không khớp";
      end
    endif
  endif
endif
@enduml
```

## 3. Quy trình Quản lý thông tin cá nhân (UC04)

```plantuml
@startuml
start
:Đăng nhập thành công;
:Truy cập menu "Tài khoản cá nhân";
:Hiển thị thông tin hiện tại;
if (Muốn cập nhật thông tin?) then (Có)
  :Chỉnh sửa họ tên / SĐT;
  :Click lưu thay đổi;
  if (Thông tin hợp lệ?) then (Có)
    :Cập nhật vào DB;
    :Hiển thị thông báo "Cập nhật thành công";
  else (Sai)
    :Hiển thị thông báo lỗi;
  endif
else (Không)
  :Xem thông tin hiện tại;
endif
:Kiểm tra hạng thẻ hội viên;
:Xem điểm tích lũy;
:Xem các ưu đãi theo hạng;
end
@enduml
```

## 4. Quy trình Đổi mật khẩu (UC03)

```plantuml
@startuml
start
:Đăng nhập thành công;
:Truy cập "Đổi mật khẩu";
:Nhập mật khẩu cũ;
:Nhập mật khẩu mới;
:Nhập xác nhận mật khẩu;
:Click "Đổi mật khẩu";
if (Mật khẩu cũ đúng?) then (Có)
  if (Mật khẩu mới = Xác nhận?) then (Có)
    if (Mật khẩu mới ≠ Mật khẩu cũ?) then (Có)
      :Mã hóa mật khẩu mới;
      :Cập nhật vào DB;
      :Hiển thị thông báo "Đổi mật khẩu thành công";
      :Yêu cầu đăng nhập lại;
      end
    else (Sai)
      :Hiển thị "Mật khẩu mới phải khác mật khẩu cũ";
      end
    endif
  else (Sai)
    :Hiển thị "Mật khẩu không khớp";
    end
  endif
else (Sai)
  :Hiển thị "Mật khẩu cũ không đúng";
  end
endif
@enduml
```
