#!/bin/bash
source "$(dirname "$0")/helpers.sh"

echo "Running 99_full_flow.sh..."
# Simulate full flow
echo "Logging in..."
TOKEN="dev-token-TESTADMIN" # using dev token
echo "Creating booking..."
api_request POST "/bookings" "{\"customerId\":\"KH001\", \"roomId\":\"RM001\", \"startTime\":\"2026-05-22T20:00:00\"}" "$TOKEN" > /dev/null
echo "Ordering items..."
api_request POST "/orders" "{\"bookingId\":1, \"items\":[{\"menuItemId\":\"SP001\", \"quantity\":2}]}" "$TOKEN" > /dev/null
echo "Checking out..."
api_request POST "/invoices" "{\"bookingId\":1}" "$TOKEN" > /dev/null
echo "Full flow completed."
