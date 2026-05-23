import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

const execFileAsync = promisify(execFile)

function getBinaryPath() {
  const name = process.platform === 'win32' ? 'my-safe-file.exe' : 'my-safe-file'
  return app.isPackaged
    ? join(process.resourcesPath, name)
    : join(app.getAppPath(), name)
}

function tmpFile() {
  return join(tmpdir(), `vault-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`)
}

function cleanup(path) {
  try { unlinkSync(path) } catch {}
}

function getIconPath() {
  const candidates = [
    join(app.getAppPath(), 'build/icons/icon.png'),
    join(process.resourcesPath, 'icon.png'),
  ]
  return candidates.find(existsSync) ?? undefined
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 640,
    minHeight: 480,
    title: 'My Vault',
    icon: getIconPath(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  Menu.setApplicationMenu(null)

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('file:open-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open Vault File',
    filters: [
      { name: 'Vault Files', extensions: ['vault'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (canceled || filePaths.length === 0) return null
  return filePaths[0]
})

ipcMain.handle('file:save-dialog', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Vault File',
    defaultPath: 'untitled.vault',
    filters: [
      { name: 'Vault Files', extensions: ['vault'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (canceled || !filePath) return null
  return filePath
})

ipcMain.handle('file:decrypt', async (_, { filePath, password }) => {
  const tmp = tmpFile()
  try {
    await execFileAsync(getBinaryPath(), ['decrypt-file', '-p', password, '-o', tmp, filePath])
    return readFileSync(tmp, 'utf-8')
  } catch (err) {
    const msg = (err.stderr || err.message || '').trim()
    throw new Error(msg || 'Decryption failed')
  } finally {
    cleanup(tmp)
  }
})

ipcMain.handle('file:encrypt-save', async (_, { filePath, content, password }) => {
  const tmp = tmpFile()
  try {
    writeFileSync(tmp, content, 'utf-8')
    await execFileAsync(getBinaryPath(), ['encrypt-file', '-p', password, '-o', filePath, tmp])
    return true
  } catch (err) {
    const msg = (err.stderr || err.message || '').trim()
    throw new Error(msg || 'Encryption failed')
  } finally {
    cleanup(tmp)
  }
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
