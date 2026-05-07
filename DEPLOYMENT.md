# Hướng dẫn cài đặt và chạy dự án - Famtaoke

---

## Bước 1: Cài Docker Desktop (Windows)

### 1.1 Tải Docker Desktop

1. Truy cập: https://www.docker.com/products/docker-desktop/
2. Click **"Download for Windows"** → chọn bản phù hợp:
   - **Chip Intel/AMD:** tải bản `x86_64`
   - **Chip ARM (Surface Pro X...):** tải bản `ARM64`
3. Chạy file `.exe` vừa tải → làm theo wizard cài đặt
4. **Quan trọng:** Khi hỏi "Use WSL 2 instead of Hyper-V" → **chọn WSL 2** (nhanh hơn)
5. Restart máy sau khi cài xong

### 1.2 Kích hoạt WSL 2 (nếu chưa có)

Mở **PowerShell với quyền Administrator** (chuột phải → Run as Administrator):

```powershell
wsl --install
```

Restart máy. Sau đó mở Docker Desktop lên, đợi icon trên taskbar chuyển sang màu xanh lá.

### 1.3 Kiểm tra Docker hoạt động

Mở **PowerShell** (hoặc **Command Prompt**), gõ:

```powershell
docker --version
# Mong đợi: Docker version 24.x.x hoặc cao hơn

docker compose version
# Mong đợi: Docker Compose version v2.x.x hoặc cao hơn
```

Nếu cả 2 lệnh đều chạy được → Docker đã sẵn sàng.

### 1.4 Cài Git (nếu chưa có)

1. Tải: https://git-scm.com/download/win
2. Chạy installer → giữ nguyên mặc định → Next cho đến khi xong
3. Kiểm tra:

```powershell
git --version
# Mong đợi: git version 2.x.x
```

---

## Bước 2: Clone dự án

Mở **PowerShell** hoặc **Command Prompt**:

```powershell
# Chọn nơi muốn lưu dự án (ví dụ Desktop)
cd Desktop

# Clone
git clone https://github.com/thanhtrnnn/karaoke.git

# Vào thư mục dự án
cd karaoke
```

---

## Bước 3: Checkout nhánh bài tập

```powershell
# Trung - Xác thực:
git checkout bai-tap/trung-xac-thuc

# Tuấn - Quản lý phòng:
git checkout bai-tap/tuan-quan-ly-phong

# Khánh - Gọi món:
git checkout bai-tap/khanh-goi-mon

# Hành - Thanh toán & Báo cáo:
git checkout bai-tap/hanh-thanh-toan-bao-cao
```

Kiểm tra đã ở đúng nhánh chưa:

```powershell
git branch
# Dòng có * là nhánh hiện tại
```

---

## Bước 4: Chạy dự án

```powershell
docker compose up -d --build
```

Lần đầu build mất **3-5 phút** (tải Docker images và dependency). Các lần sau chỉ mất 30 giây.

Đợi build xong, kiểm tra 5 container đều chạy:

```powershell
docker compose ps
```

Phải thấy 5 service đều `Up` hoặc `healthy`:

| SERVICE | STATUS |
|---------|--------|
| karaoke-postgres | Up (healthy) |
| karaoke-redis | Up (healthy) |
| karaoke-backend | Up |
| karaoke-frontend | Up |
| karaoke-pgadmin | Up |

---

## Bước 5: Kiểm tra hoạt động

| Service | URL | Mong đợi |
|---------|-----|----------|
| Frontend | http://localhost:6969 | Trang đăng nhập Famtaoke |
| Backend API | http://localhost:8080/api/health | `{"status":"UP"}` |
| Swagger UI | http://localhost:8080/swagger-ui.html | Danh sách API |
| **pgAdmin** | http://localhost:5050 | Trang đăng nhập pgAdmin |

### Đăng nhập hệ thống

- Username: `admin`
- Password: `admin123`

### Đăng nhập pgAdmin

1. Mở http://localhost:5050
2. Email: `admin@karaoke.local`
3. Password: `admin123`
4. Click **"Add New Server"** (hoặc Object → Register → Server)
5. Tab **General**: Name = `Karaoke DB`
6. Tab **Connection**:
   - Host: `postgres` (tên container, KHÔNG phải localhost)
   - Port: `5432`
   - Database: `karaoke`
   - Username: `karaoke_admin`
   - Password: `Secur3Passw0rd!`
7. Click **Save** → bên trái hiện server → expand để xem bảng

### Xem dữ liệu trong pgAdmin

1. Expand **Servers** → **Karaoke DB** → **Databases** → **karaoke** → **Schemas** → **public** → **Tables**
2. Chuột phải vào bảng (ví dụ `tbl_user`) → **View/Edit Data** → **All Rows**
3. Thấy dữ liệu mẫu do DataSeeder tạo

---

## Bước 6: Dừng và khởi động lại

```powershell
# Dừng (giữ data)
docker compose down

# Dừng + xóa data (reset về ban đầu)
docker compose down -v

# Khởi động lại
docker compose up -d

# Xem log realtime
docker compose logs -f

# Xem log riêng backend
docker compose logs -f backend
```

---

## Kiến trúc Docker

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
│                                                      │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────┐  │
│  │ frontend  │  │  backend  │  │    postgres     │  │
│  │ nginx     │→ │ spring    │→ │    16           │  │
│  │ :6969     │  │ boot      │  │    :5432        │  │
│  │           │  │ :8080     │  │                 │  │
│  └───────────┘  └───────────┘  └─────────────────┘  │
│                       │              ↑               │
│                ┌───────────┐  ┌─────────────────┐    │
│                │   redis   │  │    pgadmin      │    │
│                │   :6379   │  │    :5050        │    │
│                └───────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────┘
```

| Service | Image | Port ngoài → trong | Vai trò |
|---------|-------|-------------------|---------|
| frontend | nginx:alpine | 6969 → 80 | Serve React SPA, proxy API |
| backend | eclipse-temurin:17 | 8080 → 8080 | Spring Boot REST API |
| postgres | postgres:16 | 5432 → 5432 | Database |
| redis | redis:7 | 6379 → 6379 | Cache |
| pgadmin | dpage/pgadmin4 | 5050 → 80 | Giao diện quản lý database |

---

## Xử lý lỗi thường gặp (Windows)

### "docker: command not found"

→ Docker Desktop chưa cài hoặc chưa khởi động. Mở Docker Desktop lên, đợi icon taskbar chuyển xanh.

### "error during connect: open //./pipe/dockerDesktopLinuxEngine"

→ Docker Desktop chưa chạy hoàn toàn. Đợi 30 giây, thử lại.

### "port is already allocated"

```powershell
# Tìm process đang chiếm port
netstat -ano | findstr :8080

# Kill process (thay PID bằng số tìm được)
taskkill /PID <PID> /F
```

Hoặc đổi port trong `docker-compose.yml`.

### Build bị stuck ở "Downloading..."

→ Mạng chậm. Thử đổi DNS sang Google DNS:
1. Settings → Network → Ethernet → Edit DNS
2. Đặt: `8.8.8.8` và `8.8.4.4`
3. Restart Docker Desktop

### "no space left on device"

→ Docker hết dung lượng. Mở Docker Desktop → Settings → Resources → tăng Disk image size lên 60GB+. Hoặc:

```powershell
docker system prune -a --volumes
```

### Frontend trắng / không load

```powershell
# Kiểm tra frontend container có chạy không
docker compose ps frontend

# Xem log frontend
docker compose logs frontend

# Nếu lỗi nginx, kiểm tra backend có sẵn sàng không
curl http://localhost:8080/api/health
```

### pgAdmin không kết nối được database

→ Đảm bảo nhập Host là `postgres` (tên container), KHÔNG phải `localhost`. Vì pgAdmin chạy trong Docker network, nó gọi tên container.

---

## Chạy không dùng Docker (dev mode)

Nếu muốn chạy từng phần riêng để debug:

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend chạy tại http://localhost:8080 với H2 in-memory database.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại http://localhost:6969, Vite tự proxy `/api` sang backend.

> Lưu ý: dev mode dùng H2 database, không có data từ PostgreSQL. DataSeeder sẽ tự tạo dữ liệu mẫu.
