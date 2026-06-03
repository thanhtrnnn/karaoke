# Module 4: Quan tri cot loi (UC16-UC19)
# Yêu cầu: docker compose --profile test up -d test

Write-Host "=== MODULE 4: Quan tri cot loi ===" -ForegroundColor Cyan
Write-Host "UC16 Chi nhanh | UC17 Khach hang | UC18 Hange HV | UC19 Phong hat" -ForegroundColor Gray
Write-Host ""

docker compose --profile test run --rm test ./mvnw test `
  -Dtest="CrudControllersTest,CustomerRepositoryTest,MembershipTierRepositoryTest,RoomRepositoryTest,RoomTypeControllerTest,MembershipControllerTest,MissingTCsTest#TC08*+TC14*+TC19*" `
  -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
