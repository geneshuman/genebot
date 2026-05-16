# Security Audit — May 17, 2026 (00:50 UTC / Sat midnight EST)

**Host:** af6293d3b14a (Docker, Linux 6.17.0-1012-aws)

## Summary: 0 Critical · 3 Warnings · 5 Info

### 🟡 WARNING #1 — Backup/temp files present (permissions OK, but cleanup candidates)
- `/home/node/.openclaw/openclaw.json~` ← previously flagged, still present
- `/home/node/.openclaw/.env~` (old, Apr 4)
- `/home/node/.openclaw/cron/jobs.json.bak` (recent, May 14)
- `/home/node/.openclaw/openclaw.json.bak` (recent, May 14)
- `/home/node/.openclaw/workspace/tv-tracker.json.bak`
- **Action needed:** Delete `openclaw.json~` and `.env~` (editor artifacts). Review `.bak` files.

### 🟡 WARNING #2 — Gateway port 8563 bound to all interfaces (0.0.0.0)
- Port 8563 listens on `0.0.0.0` (--bind lan). Port 8565 is loopback-only (safe).
- **Action needed:** Confirm Docker/host network layer restricts external access.

### 🟡 WARNING #3 — Codex .tmp plugin cache is world-readable (755)
- `/home/node/.openclaw/agents/main/agent/codex-home/.tmp/` — mode 755
- Content appears non-sensitive (SKILL.md files, scripts)
- **Action needed:** `chmod -R 700 /home/node/.openclaw/agents/main/agent/codex-home/.tmp/`

### ℹ️ Sensitive file permissions: ALL CLEAN ✅
- `openclaw.json` → 600 ✅
- `credentials.json` → 600 ✅ (Previously 644 — CONFIRMED FIXED)
- `.env` → 600 ✅

### ℹ️ Running processes: CLEAN ✅
- Only OpenClaw gateway (PID 7, since May 10) and docker-init (PID 1)

### ℹ️ SUID binaries: CLEAN ✅
- All standard Debian system utilities

### ℹ️ World-writable files: NONE ✅

### ℹ️ SSH: NOT RUNNING ✅

### ℹ️ OpenClaw version: 2026.5.2

## Email sent to gene@entropyandsons.com: ✅ message ID 19e2e44435fb10e1
