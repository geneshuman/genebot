#!/bin/bash
set -e

DOMAIN="ip-172-31-19-220.tail5e9e4f.ts.net"
OPENCLAW_CONFIG_DIR="/home/ubuntu/.openclaw"
CERTS_DIR="$OPENCLAW_CONFIG_DIR/certs"

echo "=== Step 1: Copy certs into openclaw config dir ==="
mkdir -p "$CERTS_DIR"
cp "$HOME/$DOMAIN.crt" "$CERTS_DIR/"
cp "$HOME/$DOMAIN.key" "$CERTS_DIR/"
chmod 600 "$CERTS_DIR/$DOMAIN.key"
echo "✅ Certs copied to $CERTS_DIR"

echo ""
echo "=== Step 2: Patch openclaw.json ==="
CONFIG="$OPENCLAW_CONFIG_DIR/openclaw.json"
cp "$CONFIG" "$CONFIG.bak"

# Use python to safely patch the JSON
python3 - <<EOF
import json

with open("$CONFIG") as f:
    cfg = json.load(f)

# Add TLS config to gateway section
cfg["gateway"]["tls"] = {
    "cert": "/home/node/.openclaw/certs/$DOMAIN.crt",
    "key": "/home/node/.openclaw/certs/$DOMAIN.key"
}

# Update allowedOrigins to use https with no port (Tailscale HTTPS default)
cfg["gateway"]["controlUi"]["allowedOrigins"] = [
    "https://$DOMAIN",
    "https://$DOMAIN:8563"
]

with open("$CONFIG", "w") as f:
    json.dump(cfg, f, indent=2)

print("✅ openclaw.json patched")
EOF

echo ""
echo "=== Step 3: Restart gateway container ==="
cd /home/ubuntu/openclaw
docker compose restart openclaw-gateway
sleep 5

echo ""
echo "=== Step 4: Verify ==="
docker compose ps
curl -sk --max-time 5 https://$DOMAIN:8563/healthz && echo "✅ HTTPS working!" || echo "⚠️  Not responding yet, give it a few seconds"

echo ""
echo "Try: https://$DOMAIN:8563/"
