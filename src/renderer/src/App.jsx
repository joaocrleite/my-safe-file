import { useState, useCallback, useRef, useEffect } from 'react'
import MenuBar from './components/MenuBar'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import PasswordModal from './components/PasswordModal'
import ChangePasswordModal from './components/ChangePasswordModal'
import styles from './App.module.css'

const basename = (p) => p.split(/[/\\]/).pop()

export default function App() {
  const [filePath, setFilePath] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [sessionPassword, setSessionPassword] = useState(null)
  const [modalConfig, setModalConfig] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [error, setError] = useState(null)
  const editorRef = useRef(null)

  const filename = filePath ? basename(filePath) : 'untitled'

  const promptPassword = useCallback((mode) => {
    return new Promise((resolve) => {
      setModalConfig({
        mode,
        onConfirm: (pwd) => { setModalConfig(null); resolve(pwd) },
        onCancel:  ()    => { setModalConfig(null); resolve(null) },
      })
    })
  }, [])

  const confirmDiscard = () =>
    !isDirty || window.confirm('You have unsaved changes. Discard them?')

  const resetSession = () => {
    editorRef.current?.clear()
    editorRef.current?.focus()
    setFilePath(null)
    setIsDirty(false)
    setSessionPassword(null)
    setWordCount(0)
    setCharCount(0)
    setError(null)
  }

  const handleNew = useCallback(() => {
    if (!confirmDiscard()) return
    resetSession()
  }, [isDirty])

  const handleOpen = useCallback(async () => {
    if (!confirmDiscard()) return

    const path = await window.vault.openDialog()
    if (!path) return

    const password = await promptPassword('open')
    if (!password) return

    try {
      const content = await window.vault.decryptFile(path, password)
      editorRef.current?.setContent(content)
      editorRef.current?.focus()
      setFilePath(path)
      setSessionPassword(password)
      setIsDirty(false)
      setError(null)
      const text = content.trim()
      setCharCount(text.length)
      setWordCount(text === '' ? 0 : text.split(/\s+/).length)
    } catch (err) {
      setError('Wrong password or file is corrupted.')
    }
  }, [isDirty, promptPassword])

  const handleSave = useCallback(async () => {
    let path = filePath
    if (!path) {
      path = await window.vault.saveDialog()
      if (!path) return
      setFilePath(path)
    }

    let password = sessionPassword
    if (!password) {
      password = await promptPassword('save')
      if (!password) return
      setSessionPassword(password)
    }

    try {
      const content = editorRef.current?.getContent() ?? ''
      await window.vault.encryptSave(path, content, password)
      setIsDirty(false)
      setError(null)
    } catch (err) {
      setError('Failed to save file.')
    }
  }, [filePath, sessionPassword, promptPassword])

  const handleChangePassword = useCallback(async ({ current, next }) => {
    if (current !== sessionPassword) {
      setShowChangePassword(false)
      setError('Current password is incorrect.')
      return
    }
    try {
      const content = editorRef.current?.getContent() ?? ''
      await window.vault.encryptSave(filePath, content, next)
      setSessionPassword(next)
      setShowChangePassword(false)
      setError(null)
    } catch (err) {
      setError('Failed to change password.')
    }
  }, [filePath, sessionPassword])

  const handleClose = useCallback(() => {
    if (!confirmDiscard()) return
    resetSession()
  }, [isDirty])

  const handleContentChange = useCallback((text) => {
    const trimmed = text.trim()
    setCharCount(trimmed.length)
    setWordCount(trimmed === '' ? 0 : trimmed.split(/\s+/).length)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      switch (e.key) {
        case 's': e.preventDefault(); handleSave();  break
        case 'o': e.preventDefault(); handleOpen();  break
        case 'n': e.preventDefault(); handleNew();   break
        case 'w': e.preventDefault(); handleClose(); break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave, handleOpen, handleNew, handleClose])

  return (
    <div className={styles.app}>
      <header className={styles.titleBar}>
        <span className={styles.logo}>🔐</span>
        <span className={styles.title}>My Vault</span>
        <span className={styles.filename}>
          {filename}{isDirty ? ' •' : ''}
        </span>
      </header>

      <MenuBar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onClose={handleClose}
        onChangePassword={() => setShowChangePassword(true)}
        isDirty={isDirty}
        hasFile={!!filePath}
      />

      <Toolbar />

      <Editor
        ref={editorRef}
        onContentChange={handleContentChange}
        onDirtyChange={setIsDirty}
      />

      <footer className={styles.statusBar}>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        {error
          ? <span className={styles.error}>{error}</span>
          : filePath && <span className={styles.filepath}>{filePath}</span>
        }
      </footer>

      {modalConfig && (
        <PasswordModal
          mode={modalConfig.mode}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onConfirm={handleChangePassword}
          onCancel={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
