#!/bin/bash

# Exit on any error
set -e

echo "==================================="
echo "Starting Karaoke Management System"
echo "==================================="

echo "[1/3] Starting Database Services (PostgreSQL & Redis)..."
cd backend
docker-compose up -d
cd ..

echo "[2/3] Starting Spring Boot Backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

echo "[3/3] Starting Vite React Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "==================================="
echo "System is running!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop all services."
echo "==================================="

# Handle graceful shutdown
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    cd backend && docker-compose stop && cd ..
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
