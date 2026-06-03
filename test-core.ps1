# Module 4: Quan tri cot loi (UC16-UC19)
# Chạy trên host, kết nối postgres/redis trong Docker
# Yêu cầu: docker compose up -d postgres redis

Write-Host "=== MODULE 4: Quan tri cot loi ===" -ForegroundColor Cyan
Write-Host "UC16 Chi nhanh | UC17 Khach hang | UC18 Hange HV | UC19 Phong hat" -ForegroundColor Gray
Write-Host ""

$env:SPRING_PROFILES_ACTIVE = "postgres"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/karaoke"
$env:SPRING_DATASOURCE_USERNAME = "karaoke_admin"
$env:SPRING_DATASOURCE_PASSWORD = "Secur3Passw0rd!"
$env:SPRING_REDIS_HOST = "localhost"

Push-Location "$PSScriptRoot\backend"
./mvnw test -Dtest="CrudControllersTest,CustomerRepositoryTest,MembershipTierRepositoryTest,RoomRepositoryTest,RoomTypeControllerTest,MembershipControllerTest,MissingTCsTest#TC08*+TC14*+TC19*" -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
Pop-Location
