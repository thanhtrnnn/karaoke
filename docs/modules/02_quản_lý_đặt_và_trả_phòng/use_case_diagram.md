# Use Case Diagram – Module 2: Quản lý đặt và trả phòng

## Biểu đồ PlantUML

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam actorStyle awesome

actor "Khách hàng" as Client
actor "Nhân viên lễ tân" as Receptionist

package "Quản lý đặt và trả phòng" {
  usecase "Đặt phòng" as UC05
  usecase "Đặt phòng trực tuyến" as UC05_online
  usecase "Đặt phòng tại chi nhánh (Walk-in)" as UC05_walkin
  usecase "Xem phòng trống" as UC05_view
  usecase "Xác nhận đặt phòng" as UC05_confirm
  usecase "Check-in" as UC05_checkin
  usecase "Hủy đặt phòng" as UC05_cancel
  
  usecase "Quản lý đặt phòng" as UC07
  usecase "Tìm kiếm booking" as UC07_search
  usecase "Xác nhận check-in" as UC07_checkin
  usecase "Xếp phòng walk-in" as UC07_arrange
  
  usecase "Quản lý trả phòng" as UC08
  usecase "Tính tiền phòng" as UC08_calc
  usecase "Tổng hợp order" as UC08_order
  usecase "Áp dụng ưu đãi/voucher" as UC08_discount
  usecase "Thu tiền & in hóa đơn" as UC08_payment
  usecase "Cộng điểm hội viên" as UC08_point
  
  UC05 --> UC05_online : include
  UC05 --> UC05_walkin : include
  UC05 --> UC05_view : include
  UC05 --> UC05_confirm : include
  UC05 --> UC05_checkin : include
  UC05_cancel --> UC05 : extend
  
  UC07 --> UC07_search : include
  UC07 --> UC07_checkin : include
  UC07 --> UC07_arrange : include
  
  UC08 --> UC08_calc : include
  UC08 --> UC08_order : include
  UC08 --> UC08_payment : include
  UC08 --> UC08_point : include
  UC08_discount --> UC08 : extend
}

Client --> UC05
Client --> UC05_cancel
Receptionist --> UC07
Receptionist --> UC08
Receptionist --> UC05_walkin

@enduml
```

## Mô tả Use Case
| Use Case | Actor | Mô tả |
|----------|-------|-------|
| **UC05: Đặt phòng** | Khách hàng, NV Lễ tân | Đặt phòng online hoặc walk-in, xem phòng trống, xác nhận |
| **UC07: Quản lý đặt phòng** | NV Lễ tân | Tìm kiếm booking, xác nhận check-in, xếp phòng walk-in |
| **UC08: Quản lý trả phòng** | NV Lễ tân | Tính tiền, tổng hợp order, áp dụng ưu đãi, thanh toán |
