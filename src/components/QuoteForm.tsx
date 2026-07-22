import { useState, type FormEvent } from 'react'
import { trackEvent } from '../lib/tracking'
import { CheckIcon } from './icons'

const SERVICES = [
  'Decks, Pergolas & Sun Rooms',
  'Railings, Stairs & Exteriors',
  'Remodeling & Home Additions',
  'Other',
] as const

const STYLES = {
  light: {
    input:
      'w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-base text-ink-950 placeholder:text-ink-500/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    select: 'text-ink-950 invalid:text-ink-500/70',
    hint: 'text-ink-500',
    error: 'text-red-600',
    successTitle: 'text-ink-950',
    successHint: 'text-ink-500',
  },
  glass: {
    input:
      'w-full rounded-lg border border-cream-50/25 bg-cream-50/10 px-4 py-3 text-base text-cream-50 placeholder:text-cream-50/60 backdrop-blur-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    select: 'text-cream-50 invalid:text-cream-50/60 [&>option]:text-ink-950',
    hint: 'text-cream-50/70',
    error: 'text-red-400',
    successTitle: 'text-cream-50',
    successHint: 'text-cream-50/70',
  },
} as const

/**
 * Lead-capture form. Posts to /api/jobber/create-request, which creates a
 * client + work request in Jobber. Two looks: 'glass' (over the hero video)
 * and 'light' (on a white card).
 */
export default function QuoteForm({
  id,
  variant = 'light',
}: {
  id?: string
  variant?: 'light' | 'glass'
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const s = STYLES[variant]

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot: real visitors never see or fill this field
    if (data.get('company')) {
      setStatus('sent')
      return
    }

    setStatus('sending')
    const email = String(data.get('email') || '')
    const phone = String(data.get('phone') || '')
    try {
      const res = await fetch('/api/jobber/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email,
          phone,
          address: data.get('address'),
          service: data.get('service'),
          message: data.get('message') || '',
        }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      // Real conversion: fire the Meta Lead event (Pixel + Conversions API)
      trackEvent('Lead', { email, phone })
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-500 text-ink-950">
          <CheckIcon className="size-6" />
        </span>
        <p className={`font-display text-xl font-bold uppercase ${s.successTitle}`}>
          Request received!
        </p>
        <p className={`text-sm ${s.successHint}`}>
          We'll get back to you within 24 hours with your free estimate.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {/* Honeypot — visually hidden and unreachable by keyboard/screen readers */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-full opacity-0"
      />
      <div>
        <label htmlFor={`${id}-name`} className="sr-only">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          className={s.input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="sr-only">
          Phone
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Phone number"
          className={s.input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className={s.input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-address`} className="sr-only">
          Property address
        </label>
        <input
          id={`${id}-address`}
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder="Property address"
          className={s.input}
        />
      </div>
      <div>
        <label htmlFor={`${id}-service`} className="sr-only">
          Service
        </label>
        <select
          id={`${id}-service`}
          name="service"
          required
          defaultValue=""
          className={`${s.input} ${s.select}`}
        >
          <option value="" disabled>
            What do you need?
          </option>
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="sr-only">
          Project details
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={3}
          placeholder="Tell us about your project (optional)"
          className={`${s.input} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Get My Free Quote'}
      </button>
      {status === 'error' && (
        <p className={`text-center text-xs font-semibold ${s.error}`}>
          Something went wrong. Please try again or call us directly.
        </p>
      )}
      <p className={`text-center text-xs ${s.hint}`}>
        Free, no-obligation estimate. We reply within 24 hours.
      </p>
    </form>
  )
}
