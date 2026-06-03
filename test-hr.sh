#!/bin/bash
# Module 5: Nhan su & Bao cao thong ke (UC11, UC13, UC14, UC21)
# Chạy trên host, kết nối postgres/redis trong Docker
# Yêu cầu: docker compose up -d postgres redis

echo "=== MODULE 5: Nhan su & Bao cao thong ke ==="
echo "UC11 Quan ly NV | UC13 Bao cao CN | UC14 Xem KH | UC21 Tong hop BC"
echo ""

export SPRING_PROFILES_ACTIVE=postgres
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/karaoke"
export SPRING_DATASOURCE_USERNAME="karaoke_admin"
export SPRING_DATASOURCE_PASSWORD="Secur3Passw0rd!"
export SPRING_REDIS_HOST=localhost

cd "$(dirname "$0")/backend" || exit 1
./mvnw test \
  -Dtest="HRControllerTest,ReportControllerTest,MissingTCsTest#TC04*+TC05*+TC06*+TC07*+TC08*+TC09*" \
  -pl . 2>&1 | grep -E "Tests run:|BUILD|FAILURE|FAILED"
