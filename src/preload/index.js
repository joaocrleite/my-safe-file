import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('vault', {
  openDialog:   ()                              => ipcRenderer.invoke('file:open-dialog'),
  saveDialog:   ()                              => ipcRenderer.invoke('file:save-dialog'),
  decryptFile:  (filePath, password)            => ipcRenderer.invoke('file:decrypt',       { filePath, password }),
  encryptSave:  (filePath, content, password)   => ipcRenderer.invoke('file:encrypt-save',  { filePath, content, password }),
})
