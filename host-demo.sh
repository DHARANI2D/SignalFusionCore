#!/bin/bash

# SignalFusion Core - Demo Hosting Script
# This script automates the deployment of SignalFusion Core using Docker Compose.

set -e

echo "🚀 Starting SignalFusion Core Demo Hosting..."

# 1. Stop any existing dev servers
echo "🛑 Stopping local development servers..."
killall -9 node tsx 2>/dev/null || true

# 2. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker-compose is not installed. Please install it and try again."
    exit 1
fi

# 3. Build and Start Containers
echo "🏗 Building and starting Docker containers..."
docker-compose down -v
docker-compose up --build -d

echo "⏳ Waiting for services to initialize..."
sleep 15

# 4. Verify Health
echo "🔍 Verifying deployment health..."
BACKEND_HEALTH=$(curl -s http://localhost:8001/health | grep -o '"status":"ok"')

if [ "$BACKEND_HEALTH" == '"status":"ok"' ]; then
    echo "✅ Backend is HEALTHY"
else
    echo "⚠️ Backend health check failed. Check logs with 'docker-compose logs backend'"
fi

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ Frontend is ACCESSIBLE"
else
    echo "⚠️ Frontend access failed. Check logs with 'docker-compose logs frontend'"
fi

echo ""
echo "===================================================="
echo "🎉 SignalFusion Core Demo is LIVE!"
echo "===================================================="
echo "🌐 Local Access: http://localhost:3000"
echo "📡 Backend API: http://localhost:8001"
echo "📑 Documentation: http://localhost:3000/docs (if implemented)"
echo ""
echo "📘 To expose this for a remote demo, you can use ngrok:"
echo "   ngrok http 3000"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop demo: docker-compose down"
echo "===================================================="
