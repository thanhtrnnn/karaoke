# Hướng dẫn cài đặt và chạy dự án - Famtaoke

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu | Kiểm tra |
|----------|---------------------|----------|
| Docker | 24.0 | `docker --version` |
| Docker Compose | 2.20 | `docker compose version` |
| Git | 2.30 | `git --version` |

> Nếu không dùng Docker, cần thêm: Node.js 18+, Java 17+, Maven 3.9+

---

## Cách 1: Docker Compose (Khuyến nghị)

### Bước 1: Clone dự án

```bash
git clone https://github.com/thanhtrnnn/karaoke.git
cd karaoke
```

### Bước 2: Tạo file .env (tùy chọn)

```bash
cp .env.example .env
```

Nội dung `.env` (giá trị mặc định hoạt động được):

```
POSTGRES_DB=karaoke
POSTGRES_USER=karaoke_admin
POSTGRES_PASSWORD=Secur3Passw0rd!
```

### Bước 3: Chạy

```bash
# Cách nhanh
./start.sh

# Hoặc chạy trực tiếp
docker compose up -d --build
```

Lần đầu build mất 3-5 phút (tải dependency). Các lần sau chỉ mất 30 giây.

### Bước 4: Kiểm tra

| Service | URL | Mong đợi |
|---------|-----|----------|
| Frontend | http://localhost:6969 | Trang đăng nhập |
| Backend API | http://localhost:8080/api/health | `{"status":"UP"}` |
| Swagger UI | http://localhost:8080/swagger-ui.html | Docs API |

Đăng nhập: `admin` / `admin123`

### Bước 5: Dừng

```bash
docker compose down           # Dừng container, giữ data
docker compose down -v        # Dừng container, XÓA data (reset)
```

---

## Cách 2: Chạy tách riêng (để debug)

### Backend

```bash
cd backend

# Lần đầu: build
./mvnw clean package -DskipTests

# Chạy với profile H2 (không cần PostgreSQL)
java -jar target/*.jar

# Hoặc dùng Maven trực tiếp
./mvnw spring-boot:run
```

Backend chạy tại http://localhost:8080, dùng database H2 in-memory.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại http://localhost:6969, tự proxy `/api` sang backend qua Vite config.

---

## Kiến trúc Docker

```
┌─────────────────────────────────────────────────┐
│                  docker-compose                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ frontend │  │ backend  │  │   postgres    │  │
│  │ nginx    │→ │ spring   │→ │   16          │  │
│  │ :6969    │  │ boot     │  │   :5432       │  │
│  │          │  │ :8080    │  │               │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│                       │                          │
│                ┌──────────┐                      │
│                │  redis   │                      │
│                │  :6379   │                      │
│                └──────────┘                      │
└─────────────────────────────────────────────────┘
```

### Mô tả từng service

| Service | Image | Port | Vai trò |
|---------|-------|------|---------|
| `frontend` | nginx:alpine | 6969→80 | Serve SPA React, proxy API sang backend |
| `backend` | eclipse-temurin:17 | 8080 | Spring Boot REST API |
| `postgres` | postgres:16 | 5432 | Database chính |
| `redis` | redis:7 | 6379 | Cache (chưa dùng nhiều) |

### Volume

| Volume | Mô tả |
|--------|-------|
| `karaoke-postgres-data` | Data PostgreSQL, persist giữa các lần restart |

### Network

Tất cả service chung 1 Docker network. Frontend gọi backend qua hostname `karaoke-backend` (xem `frontend/nginx.conf` dòng 13).

---

## Xem logs

```bash
# Tất cả service
docker compose logs -f

# Chỉ backend
docker compose logs -f backend

# Chỉ frontend
docker compose logs -f frontend

# Chỉ database
docker compose logs -f postgres
```

---

## Truy cập database trực tiếp

### Qua H2 Console (chế độ dev, không dùng Docker)

- Mở: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:karaoke`
- User: `sa`
- Password: (trống)

### Qua psql (Docker)

```bash
docker compose exec postgres psql -U karaoke_admin -d karaoke

# Ví dụ query
SELECT * FROM tbl_user;
SELECT * FROM tbl_room;
SELECT * FROM tbl_order;
\q  # thoát
```

---

## Reset hoàn toàn

```bash
# Dừng và xóa tất cả (container, volume, image)
docker compose down -v --rmi all

# Build lại từ đầu
docker compose up -d --build
```

---

## Xử lý lỗi thường gặp

### Port đã bị chiếm

```
Error: Bind for 0.0.0.0:8080 failed: port is already allocated
```

Giải pháp: Tắt process đang dùng port, hoặc đổi port trong `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # đổi 8080 thành 8081
```

### Build chậm

Lần đầu build tải nhiều dependency. Các lần sau dùng Docker cache nên nhanh hơn. Nếu muốn nhanh hơn nữa:

```bash
docker compose build --parallel
```

### Database không khởi động được

```bash
# Kiểm tra status
docker compose ps

# Nếu postgres unhealthy, xóa volume và restart
docker compose down -v
docker compose up -d --build
```

### Frontend không kết nối được backend

Kiểm tra:
1. Backend có chạy không? `curl http://localhost:8080/api/health`
2. Nếu dùng Docker: nginx proxy qua `karaoke-backend:8080` (xem `frontend/nginx.conf`)
3. Nếu dùng dev mode: Vite proxy qua `localhost:8080` (xem `frontend/vite.config.ts`)
