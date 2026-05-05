export interface Customer {
  id: string;
  salutation: string; // Danh xưng: Anh, Chị, Ông, Bà
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  tier: string;
  points: number;
}

export const mockCustomers: Customer[] = [
  { id: 'KH001', salutation: 'Anh', firstName: 'Tuấn', lastName: 'Nguyễn Văn', fullName: 'Nguyễn Văn Tuấn', phone: '0901234567', tier: 'Vàng', points: 1250 },
  { id: 'KH002', salutation: 'Chị', firstName: 'Lan', lastName: 'Trần Thị', fullName: 'Trần Thị Lan', phone: '0912345678', tier: 'Bạc', points: 450 },
  { id: 'KH003', salutation: 'Anh', firstName: 'Hoàng', lastName: 'Lê', fullName: 'Lê Hoàng', phone: '0923456789', tier: 'Đồng', points: 120 },
  { id: 'KH004', salutation: 'Chị', firstName: 'Minh', lastName: 'Phạm', fullName: 'Phạm Minh', phone: '0934567890', tier: 'Kim cương', points: 5200 },
];

export const mockRooms = [
  { id: 'P01', name: 'VIP 01', type: 'VIP', capacity: '15 người', price: '150,000đ', status: 'Trống', color: 'status-available', canBook: true },
  { id: 'P02', name: 'P.02', type: 'Thường', capacity: '10 người', price: '100,000đ', status: 'Đang dùng', color: 'status-occupied', canBook: false },
  { id: 'P03', name: 'VIP 02', type: 'VIP', capacity: '15 người', price: '150,000đ', status: 'Đặt trước', color: 'tertiary', canBook: false },
  { id: 'P04', name: 'Deluxe 01', type: 'Deluxe', capacity: '20 người', price: '200,000đ', status: 'Trống', color: 'status-available', canBook: true },
  { id: 'P05', name: 'P.05', type: 'Thường', capacity: '8 người', price: '80,000đ', status: 'Trống', color: 'status-available', canBook: true },
];

export const mockMenu = [
  { id: 'SP001', name: 'Bia Tiger', cat: 'Đồ uống', price: 30000, stock: 45, image: '/images/beer.png', active: true },
  { id: 'SP002', name: 'Bia Heineken', cat: 'Đồ uống', price: 35000, stock: 32, image: '/images/beer.png', active: true },
  { id: 'SP003', name: 'Nước cam', cat: 'Đồ uống', price: 25000, stock: 20, image: '/images/fruit.png', active: true },
  { id: 'SP004', name: 'Sinh tố bơ', cat: 'Đồ uống', price: 40000, stock: 15, image: '/images/fruit.png', active: true },
  { id: 'SP005', name: 'Chivas 18', cat: 'Đồ uống', price: 2500000, stock: 5, image: '/images/beer.png', active: true },
  { id: 'SP006', name: 'Khô mực nướng', cat: 'Đồ ăn', price: 120000, stock: 15, image: '/images/snack.png', active: true },
  { id: 'SP007', name: 'Mì xào hải sản', cat: 'Đồ ăn', price: 85000, stock: 20, image: '/images/snack.png', active: true },
  { id: 'SP008', name: 'Khoai tây chiên', cat: 'Đồ ăn', price: 50000, stock: 30, image: '/images/snack.png', active: true },
  { id: 'SP009', name: 'Bò lúc lắc', cat: 'Đồ ăn', price: 150000, stock: 10, image: '/images/snack.png', active: true },
  { id: 'SP010', name: 'Trái cây dĩa', cat: 'Trái cây', price: 120000, stock: 12, image: '/images/fruit.png', active: true },
];

export const mockOrders = [
  { id: 'ORD001', room: 'P01', items: 'Bia Tiger x3, Trái cây x1', time: '18:15', status: '⏳ Chờ xử lý', color: 'status-cleaning' },
  { id: 'ORD002', room: 'P05', items: 'Mì xào hải sản x2', time: '18:20', status: '🔄 Đang làm', color: 'tertiary' },
  { id: 'ORD003', room: 'P03', items: 'Nước cam x4, Khăn lạnh x10', time: '18:30', status: '✅ Đã phục vụ', color: 'status-available' },
  { id: 'ORD004', room: 'P04', items: 'Bia Sài Gòn x5', time: '19:00', status: '🔄 Đang làm', color: 'tertiary' },
];
