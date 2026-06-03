# Module 3: Dich vu & San pham (UC06, UC10, UC12, UC15)
# Chạy trên host, kết nối postgres/redis trong Docker
# Yêu cầu: docker compose up -d postgres redis

Write-Host "=== MODULE 3: Dich vu & San pham ===" -ForegroundColor Cyan
Write-Host "UC06 Goi mon | UC10 Bao cao HH | UC12 Quan ly kho | UC15 Quan ly menu" -ForegroundColor Gray
Write-Host ""

$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/karaoke"
$env:SPRING_DATASOURCE_USERNAME = "karaoke_admin"
$env:SPRING_DATASOURCE_PASSWORD = "Secur3Passw0rd!"
$env:SPRING_REDIS_HOST = "localhost"

Push-Location "$PSScriptRoot\backend"
./mvnw test -Dtest="OrderControllerTest,DamageReportControllerTest,FacilityControllerTest,ImportReceiptControllerTest,ProviderControllerTest,ServiceOrderRepositoryTest,MenuItemRepositoryTest,MissingTCsTest#TC05*+TC07*+TC09*" -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
Pop-Location
