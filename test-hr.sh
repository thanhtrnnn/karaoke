#!/bin/bash
# Module 5: Nhan su & Bao cao thong ke (UC11, UC13, UC14, UC21)
# Yêu cầu: docker compose --profile test up -d test

echo "=== MODULE 5: Nhan su & Bao cao thong ke ==="
echo "UC11 Quan ly NV | UC13 Bao cao CN | UC14 Xem KH | UC21 Tong hop BC"
echo ""

docker compose --profile test run --rm test ./mvnw test \
  -Dtest="HRControllerTest,ReportControllerTest,MissingTCsTest#TC04*+TC05*+TC06*+TC07*+TC08*+TC09*" \
  -pl . 2>&1 | grep -E "Tests run:|BUILD|FAILURE|FAILED"
