#!/bin/bash
set -e

PLATFORM="${1:-current}"

usage() {
  echo "Usage: ./build.sh [platform]"
  echo ""
  echo "Platforms:"
  echo "  linux    Build for Linux  (.AppImage)"
  echo "  mac      Build for macOS  (.dmg)"
  echo "  win      Build for Windows (.exe installer)"
  echo "  current  Build Electron app only, no packaging (default)"
  echo ""
  echo "Examples:"
  echo "  ./build.sh          # compile Go + Electron (no packaging)"
  echo "  ./build.sh linux    # compile Go + package for Linux"
  echo "  ./build.sh mac      # compile Go + package for macOS"
  echo "  ./build.sh win      # compile Go + package for Windows"
}

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 0
fi

# ── 1. Build Go CLI ─────────────────────────────────────────────────────────
echo "==> Building CLI (Go)..."

case "$PLATFORM" in
  win)
    GOOS=windows GOARCH=amd64 go build -o my-safe-file.exe .
    echo "    Done: ./my-safe-file.exe"
    ;;
  mac)
    GOOS=darwin GOARCH=amd64 go build -o my-safe-file .
    echo "    Done: ./my-safe-file (darwin/amd64)"
    ;;
  *)
    GOOS=linux GOARCH=amd64 go build -o my-safe-file .
    echo "    Done: ./my-safe-file (linux/amd64)"
    ;;
esac

# ── 2. Install JS dependencies ───────────────────────────────────────────────
echo "==> Installing dependencies..."
npm install --silent

# ── 3. Build / package Electron ─────────────────────────────────────────────
case "$PLATFORM" in
  linux)
    echo "==> Packaging for Linux..."
    npm run dist:linux
    echo "    Done: ./dist/"
    ;;
  mac)
    echo "==> Packaging for macOS..."
    npm run dist:mac
    echo "    Done: ./dist/"
    ;;
  win)
    echo "==> Packaging for Windows..."
    npm run dist:win
    echo "    Done: ./dist/"
    ;;
  *)
    echo "==> Building Electron (no packaging)..."
    npm run build
    echo "    Done: ./out/"
    ;;
esac

echo ""
echo "Build complete."
