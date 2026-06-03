# Module 2: Quan ly dat & tra phong (UC05, UC07, UC08)
# Chạy trên host, kết nối postgres/redis trong Docker
# Yêu cầu: docker compose up -d postgres redis

Write-Host "=== MODULE 2: Quan ly dat & tra phong ===" -ForegroundColor Cyan
Write-Host "UC05 Dat phong | UC07 Check-in | UC08 Check-out | Huy phong" -ForegroundColor Gray
Write-Host ""

$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/karaoke"
$env:SPRING_DATASOURCE_USERNAME = "karaoke_admin"
$env:SPRING_DATASOURCE_PASSWORD = "Secur3Passw0rd!"
$env:SPRING_REDIS_HOST = "localhost"

Push-Location "$PSScriptRoot\backend"
./mvnw test -Dtest="BookingControllerTest,BookingRepositoryTest,RoomReceiptControllerTest,PromotionControllerTest,InvoiceControllerTest,MissingTCsTest#TC02*+TC03*+TC11*+TC12*" -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
Pop-Location
