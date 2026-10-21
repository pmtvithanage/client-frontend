/**
 * Warning + pairing-code dialog for replacing the client's ONE sensor.
 * Explains that pairing replaces the current sensor first, validates an
 * 8-character code, then reports the result through a toast.
 * @module components/sensor/PairSensorDialog
 */

import { useEffect, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'

import { usePairSensor } from '../../hooks/useSensor.js'
import { useToast } from '../../hooks/useToast.js'
import { PAIR_CODE_LENGTH, PAIR_WARNING } from '../../constants/sensor.js'

/**
 * Mounted only while open (the parent unmounts it on close), so the code and
 * error reset naturally for every attempt.
 * @param {{sensorName?: string, onCancel: () => void, onDone: () => void}} props
 *   `onDone` runs after a successful pairing.
 */
export default function PairSensorDialog({ sensorName, onCancel, onDone }) {
  const pair = usePairSensor()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const ready = code.length === PAIR_CODE_LENGTH

  const submit = async (event) => {
    event.preventDefault()
    if (!ready) return
    setError(null)
    try {
      await pair.mutateAsync(code)
      toast('Pairing complete. Your new sensor has replaced the old one.', { tone: 'success' })
      onDone()
    } catch (failure) {
      setError(failure?.message ?? 'Could not pair the sensor. Try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pair-sensor-title"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-sev-medium" aria-hidden="true" />
          <h2 id="pair-sensor-title" className="text-base font-semibold text-text">
            Replace your current sensor?
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted">{PAIR_WARNING}</p>
        {sensorName ? (
          <p className="mt-2 text-sm text-text">
            Current sensor: <span className="font-medium">{sensorName}</span>
          </p>
        ) : null}

        <form onSubmit={submit} className="mt-4">
          <label htmlFor="pair-code" className="block text-xs font-medium text-muted">
            Pairing code
          </label>
          <input
            ref={inputRef}
            id="pair-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              setError(null)
            }}
            maxLength={PAIR_CODE_LENGTH}
            autoComplete="off"
            spellCheck={false}
            placeholder={`${PAIR_CODE_LENGTH}-character code`}
            aria-describedby="pair-code-help"
            aria-invalid={Boolean(error)}
            className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-sm uppercase tracking-widest text-text placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <p id="pair-code-help" className="mt-1 text-xs text-muted">
            Find the code on the card that came with your new sensor.
          </p>
          {error ? (
            <p role="alert" className="mt-2 text-xs text-sev-high">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!ready || pair.isPending}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
            >
              {pair.isPending ? 'Pairing…' : 'Replace sensor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
