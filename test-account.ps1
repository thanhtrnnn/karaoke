# Module 1: Tai khoan & Thanh vien (UC01-UC04, UC20)
# Chạy trên host, kết nối postgres/redis trong Docker
# Yêu cầu: docker compose up -d postgres redis

Write-Host "=== MODULE 1: Tai khoan & Thanh vien ===" -ForegroundColor Cyan
Write-Host "UC01 Dang nhap | UC02 Dang ky | UC03 Doi MK | UC04 Quan ly TTCN | UC20 Quan ly NV" -ForegroundColor Gray
Write-Host ""

$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/karaoke"
$env:SPRING_DATASOURCE_USERNAME = "karaoke_admin"
$env:SPRING_DATASOURCE_PASSWORD = "Secur3Passw0rd!"
$env:SPRING_REDIS_HOST = "localhost"

Push-Location "$PSScriptRoot\backend"
./mvnw test -Dtest="AuthControllerTest,UserAccountRepositoryTest,MissingTCsTest#TC06_register*" -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
Pop-Location
