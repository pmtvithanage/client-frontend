import { useCallback, useMemo, useRef, useState } from 'react'

import { LIVE_REGION, TOAST_DURATION_MS } from '../../constants/ui.js'
import { ToastContext } from '../../hooks/useToast.js'
import Toast from './Toast.jsx'

/**
 * Holds the toast stack and exposes `toast()` / `dismiss()`. Messages auto
 * dismiss after `TOAST_DURATION_MS`; every message is announced through a
 * polite live region for screen readers.
 * @param {{children: React.ReactNode}} props
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const toast = useCallback(
    (message, { tone = 'info' } = {}) => {
      const id = `toast-${nextId.current++}`
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live={LIVE_REGION}
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((entry) => (
          <div key={entry.id} className="pointer-events-auto">
            <Toast toast={entry} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
