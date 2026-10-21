import { useState } from 'react'

import { REQUEST_STATUS_LABEL, SUPPORT_CATEGORIES, SUPPORT_CATEGORY_HELP } from '../../constants/support.js'
import { useToast } from '../../hooks/useToast.js'
import { useCreateRequest, useRequests } from '../../hooks/useSupport.js'
import { formatWhenFull } from '../../utils/format.js'

/**
 * Contact support form and the client's request list.
 * @param {{relatedAlertId?: string}} props
 */
export default function SupportForm({ relatedAlertId }) {
  const { toast } = useToast()
  const create = useCreateRequest()
  const { data, isLoading } = useRequests()
  const [form, setForm] = useState({
    category: '',
    subject: relatedAlertId ? `Question about an alert (${relatedAlertId})` : '',
    message: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!form.category) next.category = 'Choose one of the listed subjects'
    if (form.subject.trim().length < 3) next.subject = 'Add a short subject (at least 3 characters)'
    if (form.message.trim().length < 10) next.message = 'Tell us a little more (at least 10 characters)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try {
      await create.mutateAsync({
        subject: form.subject.trim(),
        message: form.message.trim(),
        category: form.category,
      })
      toast('Support request sent.', { tone: 'success' })
      setForm({ category: '', subject: relatedAlertId ? `Question about an alert (${relatedAlertId})` : '', message: '' })
      setErrors({})
    } catch (error) {
      toast(error?.message ?? 'Could not send your request.', { tone: 'error' })
    }
  }

  const requests = data?.data ?? []

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Contact our security team</h2>
        <p className="mt-0.5 text-xs text-muted">We will reply through this portal.</p>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted" htmlFor="support-topic">
              Topic
            </label>
            <select
              id="support-topic"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
            >
              <option value="">Select a topic</option>
              {SUPPORT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? <p className="text-xs text-sev-critical">{errors.category}</p> : null}
            {form.category ? <p className="text-xs text-muted">{SUPPORT_CATEGORY_HELP[form.category]}</p> : null}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted" htmlFor="support-subject">
              Subject
            </label>
            <input
              id="support-subject"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
            />
            {errors.subject ? <p className="text-xs text-sev-critical">{errors.subject}</p> : null}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted" htmlFor="support-message">
              Message
            </label>
            <textarea
              id="support-message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text"
            />
            {errors.message ? <p className="text-xs text-sev-critical">{errors.message}</p> : null}
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {create.isPending ? 'Sending…' : 'Send request'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text">Your requests</h2>
        <p className="mt-0.5 text-xs text-muted">Open, in progress and answered.</p>
        <div className="mt-3 space-y-3">
          {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
          {!isLoading && requests.length === 0 ? (
            <p className="text-sm text-muted">You have not sent any requests yet.</p>
          ) : null}
          {requests.map((request) => (
            <article key={request.id} className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text">{request.subject}</p>
                  <p className="text-xs text-muted">
                    {request.category} · {REQUEST_STATUS_LABEL[request.status]} ·{' '}
                    {formatWhenFull(request.created_at)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-text">{request.message}</p>
              {request.replies.length ? (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {request.replies.map((reply) => (
                    <div key={reply.id}>
                      <p className="text-xs text-muted">
                        {reply.author} · {formatWhenFull(reply.ts)}
                      </p>
                      <p className="mt-1 text-sm text-text">{reply.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
