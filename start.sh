#!/bin/bash

# Exit on any error
set -e

echo "==================================="
echo "Starting Karaoke Management System"
echo "==================================="

echo "Starting all services via Docker Compose..."
docker compose up -d --build

echo "==================================="
echo "System is running!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "To view logs, run: docker compose logs -f"
echo "To stop, run: docker compose down"
echo "==================================="

