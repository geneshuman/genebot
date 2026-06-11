#!/bin/bash
# Fix OpenClaw gateway: bind to 0.0.0.0 and restart properly

COMPOSE_FILE="/home/ubuntu/openclaw/docker-compose.yml"

echo "=== Step 1: Fix port binding ==="
# Change 127.0.0.1:8563 to 0.0.0.0:8563
sed -i 's/127\.0\.0\.1:8563:8563/0.0.0.0:8563:8563/g' "$COMPOSE_FILE"
echo "Updated binding:"
grep 8563 "$COMPOSE_FILE" | head -3

echo ""
echo "=== Step 2: Restart with correct compose service name ==="
cd /home/ubuntu/openclaw

# Show available services
echo "Available services:"
docker compose ps --services 2>/dev/null || docker-compose ps --services 2>/dev/null

# Restart the gateway service (try both naming styles)
docker compose restart openclaw-gateway 2>/dev/null || \
docker compose restart gateway 2>/dev/null || \
docker compose up -d 2>/dev/null || \
docker-compose up -d 2>/dev/null

echo ""
echo "=== Step 3: Verify ==="
sleep 3
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null

echo ""
echo "=== Step 4: Test connectivity ==="
curl -s --max-time 5 http://localhost:8563/healthz && echo "✅ Gateway responding on HTTP" || echo "❌ Not responding yet"

echo ""
echo "Try: http://ip-172-31-19-220.tail5e9e4f.ts.net:8563/"
echo "(Note: HTTP not HTTPS)"
