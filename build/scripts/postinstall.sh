#!/bin/bash
# Fix Chromium sandbox permissions required for Electron on Linux.
# This runs automatically after `sudo dpkg -i`.

SANDBOX=$(find /opt -name "chrome-sandbox" -path "*[Mm]y*[Vv]ault*" 2>/dev/null | head -1)

if [ -z "$SANDBOX" ]; then
  echo "my-vault: chrome-sandbox not found, skipping sandbox fix" >&2
  exit 0
fi

chown root:root "$SANDBOX"
chmod 4755 "$SANDBOX"
echo "my-vault: sandbox configured at $SANDBOX"
