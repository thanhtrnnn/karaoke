# Module 1: Tai khoan & Thanh vien (UC01-UC04, UC20)
# Test files: AuthControllerTest, UserAccountRepositoryTest, MissingTCsTest (TC06)

Write-Host "=== MODULE 1: Tai khoan & Thanh vien ===" -ForegroundColor Cyan
Write-Host "UC01 Dang nhap | UC02 Dang ky | UC03 Doi MK | UC04 Quan ly TTCN | UC20 Quan ly NV" -ForegroundColor Gray
Write-Host ""

docker compose exec backend ./mvnw test `
  -Dtest="AuthControllerTest,UserAccountRepositoryTest,MissingTCsTest#TC06_register*" `
  -pl . 2>&1 | Select-String -Pattern "Tests run:|BUILD|FAILURE|FAILED"
