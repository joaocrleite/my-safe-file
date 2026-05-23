import styles from './MenuBar.module.css'

export default function MenuBar({ onNew, onOpen, onSave, onClose, onChangePassword, isDirty, hasFile }) {
  return (
    <div className={styles.menuBar}>
      <button className={styles.btn} onClick={onNew} title="New file (Ctrl+N)">
        New
      </button>
      <button className={styles.btn} onClick={onOpen} title="Open file (Ctrl+O)">
        Open
      </button>
      <button
        className={`${styles.btn} ${styles.save}`}
        onClick={onSave}
        title="Save file (Ctrl+S)"
        disabled={!isDirty && !hasFile}
      >
        Save{isDirty ? ' •' : ''}
      </button>
      <button
        className={`${styles.btn} ${styles.password}`}
        onClick={onChangePassword}
        title="Change file password"
        disabled={!hasFile}
      >
        Change Password
      </button>
      <button
        className={`${styles.btn} ${styles.close}`}
        onClick={onClose}
        title="Close file (Ctrl+W)"
        disabled={!hasFile}
      >
        Close
      </button>
    </div>
  )
}
