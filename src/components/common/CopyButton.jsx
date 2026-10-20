import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { COPY_FEEDBACK_MS } from '../../constants/ui.js'

/**
 * Copies a value (an IP address, an id, a command) to the clipboard and shows
 * `Copied` briefly as confirmation.
 * @param {{value: string, label?: string, title?: string, className?: string}} props
 */
export default function CopyButton({ value, label, title = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      // Clipboard unavailable (insecure context); leave the button unchanged.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={title}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-text ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-sev-low" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label ? <span>{copied ? 'Copied' : label}</span> : null}
    </button>
  )
}
