import { createContext, useContext } from 'react'

/** React context carrying the toast API (`ToastProvider` supplies it). */
export const ToastContext = createContext(null)

/**
 * Show and dismiss toast messages.
 * @returns {{toast: (message: string, options?: {tone?: 'info'|'success'|'error'}) => string,
 *   dismiss: (id: string) => void}}
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
