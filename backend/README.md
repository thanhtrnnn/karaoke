# Karaoke Backend

Spring Boot REST API for the karaoke chain management project.

## Run Locally

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

Useful endpoints:

- `GET /swagger-ui.html`
- `GET /api-docs`
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/customers`
- `GET /api/rooms`
- `GET /api/menu-items`
- `GET /api/orders`
- `GET /api/reports/summary`

Swagger UI includes example request and response bodies for the main API flows.

Seed login accounts:

- `admin` / `admin123`
- `reception` / `reception123`

## PostgreSQL Profile

The default profile uses H2 for quick development. To run against PostgreSQL:

```bash
SPRING_PROFILES_ACTIVE=postgres \
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/karaoke \
SPRING_DATASOURCE_USERNAME=karaoke \
SPRING_DATASOURCE_PASSWORD=karaoke \
./mvnw spring-boot:run
```

## Frontend Integration

CORS allows Vite dev origins by default:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
