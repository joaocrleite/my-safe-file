# My Vault

A CLI and desktop editor for symmetric file encryption, similar to GPG's `--symmetric` mode.

- **Key derivation**: Argon2id (memory-hard, resistant to brute-force)
- **Encryption**: AES-256-GCM (authenticated — detects tampering)
- **Format**: Base64-encoded `salt + nonce + ciphertext` stored in `.vault` files

Each encryption produces a unique output even for the same input due to a random salt and nonce.

---

## Getting started

### Requirements

| Tool | Version |
|---|---|
| Go | 1.22+ |
| Node.js | 18+ |

### Clone & build

```bash
git clone https://github.com/joaocrleite/my-safe-file
cd my-safe-file

# Build both CLI and desktop app (no installer)
./build.sh

# Build + package a distributable
./build.sh linux    # → dist/My Vault-1.0.0.AppImage
./build.sh mac      # → dist/My Vault-1.0.0.dmg
./build.sh win      # → dist/My Vault Setup 1.0.0.exe
```

---

## Desktop editor

A rich text editor that encrypts every file with a password. Files are stored as `.vault` files and are never saved as plain text.

### Run in development

```bash
npm install
npm run dev
```

> **Linux:** if you get a sandbox error, the dev script already passes `--no-sandbox`.

### Install on Linux (AppImage)

```bash
chmod +x "My Vault-1.0.0.AppImage"
./"My Vault-1.0.0.AppImage" --no-sandbox
```

No installation required — the Go binary is bundled inside the AppImage.

### Features

| Feature | Detail |
|---|---|
| Rich text formatting | Bold, Italic, Underline, Strikethrough, Headings, Lists, Alignment |
| New / Open / Save / Close | Full file lifecycle via menu bar or keyboard shortcuts |
| Encryption | Files encrypted with Go CLI on every save, decrypted on open |
| Password prompt | Asked on open and on first save; remembered for the session |
| Change password | Re-encrypts the current file under a new password |
| Unsaved indicator | `•` shown in title bar and Save button when there are unsaved changes |
| Word & character count | Live count in the status bar |

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save file |
| `Ctrl+W` | Close file |

---

## CLI

### Build

```bash
go build -o my-safe-file .
```

### Commands

#### Encrypt text

```bash
./my-safe-file encrypt -p <password> <text>
./my-safe-file encrypt -p mypassword "hello world"
# urC0GBUP0y8FKpXO8i79+ngWZYwiN+kRBGfU4QrXHfCyE8doTgRFW1dYGUiDQ6GNu/mKXBBlJA==
```

#### Decrypt text

```bash
./my-safe-file decrypt -p <password> <ciphertext>
./my-safe-file decrypt -p mypassword "urC0GBUP0y8FKpXO8i79+..."
# hello world
```

#### Encrypt a file

```bash
./my-safe-file encrypt-file -p <password> <file>
./my-safe-file encrypt-file -p <password> -o <output> <file>
```

```bash
./my-safe-file encrypt-file -p mypassword secret.txt
# encrypted: secret.txt -> secret.txt.vault
```

#### Decrypt a file

```bash
./my-safe-file decrypt-file -p <password> <file>
./my-safe-file decrypt-file -p <password> -o <output> <file>
```

```bash
./my-safe-file decrypt-file -p mypassword secret.txt.vault
# decrypted: secret.txt.vault -> secret.txt
```

Output files are written with permission `0600` (owner read/write only).

#### Help

```bash
./my-safe-file --help
./my-safe-file encrypt --help
./my-safe-file decrypt --help
./my-safe-file encrypt-file --help
./my-safe-file decrypt-file --help
```

### Running tests

```bash
go test ./...
```

---

## Project structure

```
my-safe-file/
├── build.sh                       # Build script (CLI + desktop + packaging)
├── README.md
│
├── # ── CLI (Go) ──────────────────────────────────────────
├── main.go
├── go.mod
├── go.sum
├── cmd/
│   ├── root.go                    # Root cobra command
│   ├── encrypt.go                 # encrypt subcommand
│   ├── decrypt.go                 # decrypt subcommand
│   ├── encrypt_file.go            # encrypt-file subcommand
│   └── decrypt_file.go            # decrypt-file subcommand
├── internal/
│   └── crypto/
│       ├── crypto.go              # Encrypt / Decrypt logic
│       └── crypto_test.go         # Unit tests
├── testData/
│   └── sample.txt                 # Sample file for testing
│
└── # ── Desktop editor (Electron + React) ─────────────────
    ├── package.json
    ├── electron.vite.config.mjs
    └── src/
        ├── main/
        │   └── index.js           # Main process: IPC handlers, Go CLI calls
        ├── preload/
        │   └── index.js           # contextBridge: exposes vault API to renderer
        └── renderer/
            └── src/
                ├── App.jsx        # Root component: file & password state
                └── components/
                    ├── MenuBar             # New / Open / Save / Close / Change Password
                    ├── Toolbar             # Formatting toolbar (bold, italic, lists…)
                    ├── Editor              # contenteditable rich text editor
                    ├── PasswordModal       # Password prompt for open / save
                    └── ChangePasswordModal # Change password for current file
```
