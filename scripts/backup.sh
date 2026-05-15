#!/bin/bash
# genebot workspace backup to GitHub
set -e

WORKSPACE="/home/node/.openclaw/workspace"

cd "$WORKSPACE"

git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit, workspace is clean."
  exit 0
fi

TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
git commit -m "backup: $TIMESTAMP"
git push origin master --set-upstream 2>&1
echo "Backup complete: $TIMESTAMP"
