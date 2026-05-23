import { useEffect, useRef, useState } from 'react'
import styles from './ChangePasswordModal.module.css'

export default function ChangePasswordModal({ onConfirm, onCancel }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const currentRef = useRef(null)

  useEffect(() => {
    currentRef.current?.focus()
  }, [])

  function validate() {
    if (!current.trim()) return 'Current password is required.'
    if (!next.trim()) return 'New password is required.'
    if (next !== confirm) return 'New passwords do not match.'
    if (next === current) return 'New password must differ from current.'
    return null
  }

  function handleConfirm() {
    const err = validate()
    if (err) { setError(err); return }
    onConfirm({ current, next })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Change Password</h2>
        <p className={styles.description}>
          The file will be re-saved with the new password.
        </p>

        <label className={styles.label}>Current password</label>
        <input
          ref={currentRef}
          type="password"
          className={styles.input}
          placeholder="Current password"
          value={current}
          onChange={(e) => { setCurrent(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
        />

        <label className={styles.label}>New password</label>
        <input
          type="password"
          className={styles.input}
          placeholder="New password"
          value={next}
          onChange={(e) => { setNext(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
        />

        <label className={styles.label}>Confirm new password</label>
        <input
          type="password"
          className={styles.input}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>Cancel</button>
          <button className={styles.confirm} onClick={handleConfirm}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}
