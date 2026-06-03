# Module 3: Dich vu & San pham (UC06, UC10, UC12, UC15)
# Test files: OrderControllerTest, DamageReportControllerTest, FacilityControllerTest,
#             ImportReceiptControllerTest, ProviderControllerTest,
#             ServiceOrderRepositoryTest, MenuItemRepositoryTest, MissingTCsTest (TC05,TC07,TC09)

Write-Host "=== MODULE 3: Dich vu & San pham ===" -ForegroundColor Cyan
Write-Host "UC06 Goi mon | UC10 Bao cao HH | UC12 Quan ly kho | UC15 Quan ly menu" -ForegroundColor Gray
Write-Host ""

docker compose exec backend ./mvnw test `
  -Dtest="OrderControllerTest,DamageReportControllerTest,FacilityControllerTest,ImportReceiptControllerTest,ProviderControllerTest,ServiceOrderRepositoryTest,MenuItemRepositoryTest,MissingTCsTest#TC05*+TC07*+TC09*" `
  -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
