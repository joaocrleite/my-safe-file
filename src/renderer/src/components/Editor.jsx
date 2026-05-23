import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import styles from './Editor.module.css'

const PLACEHOLDER = 'Start writing...'

const Editor = forwardRef(function Editor({ onContentChange, onDirtyChange }, ref) {
  const editorRef = useRef(null)

  useImperativeHandle(ref, () => ({
    setContent: (html) => {
      if (editorRef.current) editorRef.current.innerHTML = html
    },
    getContent: () => editorRef.current?.innerHTML ?? '',
    clear: () => {
      if (editorRef.current) editorRef.current.innerHTML = ''
    },
    focus: () => editorRef.current?.focus()
  }))

  useEffect(() => {
    editorRef.current?.focus()
  }, [])

  function handleInput() {
    const text = editorRef.current?.innerText ?? ''
    onContentChange(text)
    onDirtyChange(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={PLACEHOLDER}
        spellCheck
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </div>
  )
})

export default Editor
