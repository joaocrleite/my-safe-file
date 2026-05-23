import { useEffect, useRef, useState } from 'react'
import styles from './PasswordModal.module.css'

export default function PasswordModal({ mode, onConfirm, onCancel }) {
  const [password, setPassword] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  function handleConfirm() {
    if (!password.trim()) return
    onConfirm(password)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {mode === 'save' ? 'Set Password' : 'Enter Password'}
        </h2>
        <p className={styles.description}>
          {mode === 'save'
            ? 'This password will be used to encrypt the file.'
            : 'Enter the password to decrypt and open this file.'}
        </p>

        <input
          ref={inputRef}
          type="password"
          className={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.confirm}
            onClick={handleConfirm}
            disabled={!password.trim()}
          >
            {mode === 'save' ? 'Save' : 'Open'}
          </button>
        </div>
      </div>
    </div>
  )
}
