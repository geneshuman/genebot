# Security Audit — April 11, 2026

**Run at:** 04:00 UTC (00:00 EST)
**Environment:** Dedicated sandboxed Docker instance

## Summary: 1 Critical · 1 Warning · 1 Info

### 🔴 CRITICAL — Config file world-readable
- **Issue:** `/home/node/.openclaw/openclaw.json` had mode 644 — any process could read tokens/settings.
- **Status:** ✅ FIXED AUTOMATICALLY — Permissions changed to 600.

### 🟡 WARNING — Potential multi-user setup detected
- **Issue:** Discord group policy "allowlist" with configured targets suggests multi-user access. Runtime tools exposed without sandboxing in:
  - agents.defaults (sandbox=off)
  - agents.list.main (sandbox=off)
  - agents.list.tvbot (sandbox=off)
- **Risk:** Untrusted users in group contexts could invoke runtime tools.
- **Recommended:** Review sandbox settings for shared agents; set sandbox.mode="all" if untrusted users present.

### ℹ️ INFO — Attack surface
- Open groups: 0 | Allowlisted: 1
- Elevated tools: enabled
- Webhooks: disabled | Internal hooks: enabled
- Browser control: enabled
- Trust model: personal assistant

## Email Status
⚠️ Could not send email — `gog` Gmail OAuth not configured (no tokens stored). Gene should be notified via next direct chat interaction.
