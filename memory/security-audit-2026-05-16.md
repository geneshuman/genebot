# Security Audit Report — 2026-05-16

**Audit Time:** Sat 2026-05-16 ~00:50 UTC  
**Auditor:** genebot subagent (security-audit-2026-05-17)  
**Host:** af6293d3b14a (Docker, Linux 6.17.0-1012-aws)

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 0 |
| 🟡 WARNING | 3 |
| ℹ️ INFO | 5 |

---

## Findings

### 🟡 WARNING — Backup files present (openclaw.json~, .env~, cron/jobs.json.bak)

Multiple backup/tilde files exist in `/home/node/.openclaw/`:

- `/home/node/.openclaw/openclaw.json~` (4764 bytes, 2026-04-11) — **previously flagged**
- `/home/node/.openclaw/.env~` (182 bytes, 2026-04-04)
- `/home/node/.openclaw/cron/jobs.json.bak` (12463 bytes, 2026-05-14)
- `/home/node/.openclaw/openclaw.json.bak` (6249 bytes, 2026-05-14)
- `/home/node/.openclaw/workspace/tv-tracker.json.bak` (10844 bytes, 2026-04-05)

All are `rw-------` (600), so not world-readable. The tilde files (`openclaw.json~`, `.env~`) are editor artifacts that should be cleaned up. The `.bak` files may be intentional system backups, but worth confirming and pruning stale ones.

**Recommendation:** Delete `openclaw.json~` and `.env~` (editor artifacts). Review and prune old `.bak` files.

---

### 🟡 WARNING — Gateway port 8563 bound to all interfaces (0.0.0.0)

Listening port `8563` is bound to `0.0.0.0` (all interfaces), meaning it's accessible from outside the container if Docker port-forwarding is configured. Port `8565` is bound to `127.0.0.1` only (safe).

Port `33283` on `127.0.0.11` is the Docker embedded DNS resolver — expected.

**Assessment:** This is likely intentional (`--bind lan`), but worth confirming that external access is controlled at the Docker/network layer.

---

### 🟡 WARNING — Codex .tmp plugin cache is world-readable (755)

Directory `/home/node/.openclaw/agents/main/agent/codex-home/.tmp/` and its contents have `drwxr-xr-x` (755) permissions. Files within are readable by any process on the system. While the content appears to be non-secret plugin/skill data, the directory is in the agent's home path and warrants tighter permissions.

**Recommendation:** `chmod -R 700 /home/node/.openclaw/agents/main/agent/codex-home/.tmp/` if no other users/processes need access.

---

### ℹ️ INFO — File permissions: openclaw.json, credentials.json, .env — ALL CLEAN ✅

- `/home/node/.openclaw/openclaw.json` → `rw-------` (600) ✅  
- `/home/node/.openclaw/workspace/credentials.json` → `rw-------` (600) ✅ *(Previously 644 — now fixed!)*
- `/home/node/.openclaw/.env` → `rw-------` (600) ✅

The previously-reported `credentials.json` world-readable issue has been resolved.

---

### ℹ️ INFO — Running processes: clean ✅

Only expected processes running:
- `node dist/index.js gateway --bind lan --port 8563` (PID 7, main OpenClaw process, uptime since May 10)
- `/sbin/docker-init` (PID 1)
- Transient shell/ps processes from this audit

No unexpected daemons, cronjobs running as processes, or foreign binaries detected.

---

### ℹ️ INFO — SUID binaries: all standard ✅

SUID binaries found:
- `/usr/bin/chfn`, `/usr/bin/chsh`, `/usr/bin/gpasswd`, `/usr/bin/mount`, `/usr/bin/newgrp`, `/usr/bin/passwd`, `/usr/bin/su`, `/usr/bin/umount`

All are standard Debian system utilities. No non-standard or suspicious SUID binaries detected.

---

### ℹ️ INFO — World-writable files: none ✅

No world-writable files or directories found in `/home/node/.openclaw/`.

---

### ℹ️ INFO — SSH: not running, no authorized_keys ✅

- No `sshd` process running
- No `sshd_config` present
- No `authorized_keys` files found anywhere on the system

SSH attack surface: zero.

---

### ℹ️ INFO — OpenClaw version: 2026.5.2

`openclaw update --check` is not available as a command. Current version is `OpenClaw 2026.5.2`. Manual check for updates recommended if a newer release is available.

---

## Compared to Previous Audit

| Item | Previous | Now |
|------|----------|-----|
| `credentials.json` permissions | 644 (world-readable) 🔴 | 600 ✅ FIXED |
| `openclaw.json~` backup | Present 🟡 | Still present 🟡 |
| New: `openclaw.json.bak` | — | Present (recent, 2026-05-14) |
| New: `.env~` backup | — | Present (old, 2026-04-04) |

---

## Recommended Actions

1. **Delete editor artifacts:** `rm /home/node/.openclaw/openclaw.json~ /home/node/.openclaw/.env~`
2. **Review .bak files:** Confirm `cron/jobs.json.bak` and `openclaw.json.bak` are intentional; prune if not needed
3. **Tighten .tmp directory:** `chmod -R 700 /home/node/.openclaw/agents/main/agent/codex-home/.tmp/`
4. **Verify network exposure:** Confirm Docker firewall/port-mapping limits who can reach port 8563 externally
