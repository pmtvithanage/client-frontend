import { useEffect } from 'react'

/** Keys that must not swallow letter shortcuts while typing. */
const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

/** Controls whose own Enter/Space activation must not be hijacked. */
const ACTIVATABLE = 'a, button, select, summary, [role="button"], [contenteditable]'

function isTypingTarget(target) {
  return TYPING_TAGS.includes(target?.tagName) || target?.isContentEditable
}

/**
 * Keyboard shortcuts for the alerts list (AGENTS.md / product spec):
 * `j` next, `k` previous, `Enter` open, `a` acknowledge, `/` search, `?` help.
 * Letter keys are ignored while the user is typing in a field.
 * @param {{enabled?: boolean, isTyping?: boolean, onNext: () => void,
 *   onPrevious: () => void, onOpen: () => void, onAcknowledge: () => void,
 *   onSearch: () => void, onHelp: () => void}} options Handlers; `isTyping`
 *   pauses the letter shortcuts (e.g. a dialog is open).
 */
export function useAlertKeyboard({
  enabled = true,
  isTyping = false,
  onNext,
  onPrevious,
  onOpen,
  onAcknowledge,
  onSearch,
  onHelp,
}) {
  useEffect(() => {
    if (!enabled) return undefined
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping || isTypingTarget(event.target)) return
      if (event.key === 'j') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'k') {
        event.preventDefault()
        onPrevious()
      } else if (event.key === 'Enter') {
        // Let a focused link/button keep its own Enter activation.
        if (event.target?.closest?.(ACTIVATABLE)) return
        event.preventDefault()
        onOpen()
      } else if (event.key === 'a') {
        event.preventDefault()
        onAcknowledge()
      } else if (event.key === '/') {
        event.preventDefault()
        onSearch()
      } else if (event.key === '?') {
        event.preventDefault()
        onHelp()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, isTyping, onNext, onPrevious, onOpen, onAcknowledge, onSearch, onHelp])
}
