Subject: [genebot] Weekly Security Audit — 2026-06-13 (3 Warnings)

Body:
Weekly security audit completed Saturday 2026-06-13 00:48 UTC.
Overall: 0 critical · 3 warn · 1 info

---
WARN 1: gateway.nodes.deny_commands_ineffective
Some denyCommands entries are ineffective. Unknown command names listed:
  canvas.navigate, canvas.eval, canvas.snapshot
These are not matched by the exact-name system. No immediate risk, but the config is noise.
Recommendation: Verify these are intentional and remove or correct them.

WARN 2: security.trust_model.multi_user_heuristic
Heuristic detects potential multi-user setup (Discord groupPolicy=allowlist + group targets).
Runtime/process tools exposed without sandbox in: agents.defaults, main, tvbot.
This is expected for a personal-assistant setup. No change needed unless untrusted users gain access.
Recommendation: No action required in current single-operator setup. Note for future if multi-user.

WARN 3: plugins.installs_unpinned_npm_specs
Plugins "brave" and "discord" are installed from unpinned npm specs.
Risk: supply-chain instability on update.
Recommendation: Pin to exact versions when next updating plugins.

---
INFO: Attack surface summary
  - groups: open=0, allowlist=1
  - tools.elevated: enabled
  - browser control: enabled
  - trust model: personal assistant (single operator boundary)

---
Doctor Notes (non-critical):
  - NODE_COMPILE_CACHE not set (minor perf on small hosts)
  - Agent "informabot" tools.fs config may need explicit alsoAllow
  - Agent "main" message tool not in allowlist for discord/webchat (explicit channel actions may fail)

---
Environment: Debian 12 (bookworm), Docker container on AWS nvme0n1
Gateway: bind=lan (0.0.0.0:8563), version 2026.6.5
No firewall (ufw) active at container level — expected in Docker environment.
No disk encryption visible at container level — expected, managed at host level.
