# Module 2: Quan ly dat & tra phong (UC05, UC07, UC08)
# Test files: BookingControllerTest, BookingRepositoryTest, RoomReceiptControllerTest,
#             PromotionControllerTest, InvoiceControllerTest, MissingTCsTest (TC02,TC03,TC11,TC12)

Write-Host "=== MODULE 2: Quan ly dat & tra phong ===" -ForegroundColor Cyan
Write-Host "UC05 Dat phong | UC07 Check-in | UC08 Check-out | Huy phong" -ForegroundColor Gray
Write-Host ""

docker compose exec backend ./mvnw test `
  -Dtest="BookingControllerTest,BookingRepositoryTest,RoomReceiptControllerTest,PromotionControllerTest,InvoiceControllerTest,MissingTCsTest#TC02*+TC03*+TC11*+TC12*" `
  -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
