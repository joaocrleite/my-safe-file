import styles from './Toolbar.module.css'

const FORMATS = [
  { command: 'bold',          label: 'B',  title: 'Bold (Ctrl+B)',        style: { fontWeight: 'bold' } },
  { command: 'italic',        label: 'I',  title: 'Italic (Ctrl+I)',      style: { fontStyle: 'italic' } },
  { command: 'underline',     label: 'U',  title: 'Underline (Ctrl+U)',   style: { textDecoration: 'underline' } },
  { command: 'strikeThrough', label: 'S',  title: 'Strikethrough',        style: { textDecoration: 'line-through' } },
]

const HEADINGS = [
  { tag: 'h1', label: 'H1', title: 'Heading 1' },
  { tag: 'h2', label: 'H2', title: 'Heading 2' },
  { tag: 'h3', label: 'H3', title: 'Heading 3' },
]

const LISTS = [
  { command: 'insertUnorderedList', label: '• List',  title: 'Bullet list' },
  { command: 'insertOrderedList',   label: '1. List', title: 'Numbered list' },
]

const ALIGNS = [
  { command: 'justifyLeft',   label: '⬱', title: 'Align left' },
  { command: 'justifyCenter', label: '≡', title: 'Align center' },
  { command: 'justifyRight',  label: '⬰', title: 'Align right' },
]

function exec(command, value = null) {
  document.execCommand(command, false, value)
}

function ToolbarButton({ label, title, style, onClick }) {
  return (
    <button
      className={styles.btn}
      title={title}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {label}
    </button>
  )
}

function Separator() {
  return <span className={styles.separator} />
}

export default function Toolbar() {
  return (
    <div className={styles.toolbar}>
      {FORMATS.map((f) => (
        <ToolbarButton key={f.command} {...f} onClick={() => exec(f.command)} />
      ))}

      <Separator />

      {HEADINGS.map((h) => (
        <ToolbarButton key={h.tag} label={h.label} title={h.title} onClick={() => exec('formatBlock', h.tag)} />
      ))}

      <Separator />

      {LISTS.map((l) => (
        <ToolbarButton key={l.command} label={l.label} title={l.title} onClick={() => exec(l.command)} />
      ))}

      <Separator />

      {ALIGNS.map((a) => (
        <ToolbarButton key={a.command} label={a.label} title={a.title} onClick={() => exec(a.command)} />
      ))}
    </div>
  )
}
