import { useState } from 'react'
import { CheckIcon, ChevronLeftIcon } from './icons'

const SERVICES = [
  'Decks, Pergolas & Sun Rooms',
  'Railings, Stairs & Exteriors',
  'Remodeling & Home Additions',
  'Other',
] as const

const STEPS = ['Your project', 'Your details', 'Confirm'] as const

const STYLES = {
  light: {
    input:
      'w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-base text-ink-950 placeholder:text-ink-500/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    select: 'text-ink-950 invalid:text-ink-500/70',
    stepText: 'text-ink-500',
    track: 'bg-ink-500/15',
    hint: 'text-ink-500',
    error: 'text-red-600',
    back: 'text-ink-700 hover:text-ink-950',
    reviewLabel: 'text-ink-500',
    reviewValue: 'text-ink-950',
    reviewRow: 'border-ink-500/10',
    successTitle: 'text-ink-950',
    successHint: 'text-ink-500',
  },
  glass: {
    input:
      'w-full rounded-lg border border-cream-50/25 bg-cream-50/10 px-4 py-3 text-base text-cream-50 placeholder:text-cream-50/60 backdrop-blur-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    select: 'text-cream-50 invalid:text-cream-50/60 [&>option]:text-ink-950',
    stepText: 'text-cream-50/70',
    track: 'bg-cream-50/15',
    hint: 'text-cream-50/70',
    error: 'text-red-400',
    back: 'text-cream-50/70 hover:text-cream-50',
    reviewLabel: 'text-cream-50/50',
    reviewValue: 'text-cream-50',
    reviewRow: 'border-cream-50/10',
    successTitle: 'text-cream-50',
    successHint: 'text-cream-50/70',
  },
} as const

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  service: '',
  message: '',
  company: '', // honeypot
}

/**
 * 3-step lead form: project → details → confirm. Posts to
 * /api/jobber/create-request, which creates a client + work request in Jobber.
 * Two looks: 'glass' (over the hero video) and 'light' (on a white card).
 */
export default function QuoteForm({
  id,
  variant = 'light',
}: {
  id?: string
  variant?: 'light' | 'glass'
}) {
  const [step, setStep] = useState(0) // 0, 1, 2
  const [form, setForm] = useState({ ...EMPTY })
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [sent, setSent] = useState(false)
  const s = STYLES[variant]

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const canContinue = step === 0 ? form.service !== '' : true
  const canReview = form.name.trim() !== '' && form.phone.trim() !== ''

  async function submit() {
    if (form.company) {
      setSent(true) // honeypot: pretend success, drop it
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/jobber/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setSent(true)
    } catch {
      setStatus('error')
    }
  }

  if (sent) {
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
    <div>
      {/* Progress: segments + label */}
      <div className="mb-5">
        <div className="flex gap-1.5">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-brand-500' : s.track
              }`}
            />
          ))}
        </div>
        <p className={`mt-2 text-xs font-bold tracking-wide uppercase ${s.stepText}`}>
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.company}
        onChange={set('company')}
        className="absolute -left-full opacity-0"
      />

      {/* Step 1 — project */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label htmlFor={`${id}-service`} className="sr-only">
              Service
            </label>
            <select
              id={`${id}-service`}
              value={form.service}
              onChange={set('service')}
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
              rows={3}
              value={form.message}
              onChange={set('message')}
              placeholder="Tell us about your project (optional)"
              className={`${s.input} resize-none`}
            />
          </div>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep(1)}
            className="w-full rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2 — details */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label htmlFor={`${id}-name`} className="sr-only">
              Name
            </label>
            <input
              id={`${id}-name`}
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
              placeholder="Your name *"
              className={s.input}
            />
          </div>
          <div>
            <label htmlFor={`${id}-phone`} className="sr-only">
              Phone
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="Phone number *"
              className={s.input}
            />
          </div>
          <div>
            <label htmlFor={`${id}-email`} className="sr-only">
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
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
              type="text"
              autoComplete="street-address"
              value={form.address}
              onChange={set('address')}
              placeholder="Property address"
              className={s.input}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`flex items-center gap-1 px-2 py-3 text-sm font-bold transition-colors ${s.back}`}
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </button>
            <button
              type="button"
              disabled={!canReview}
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — confirm */}
      {step === 2 && (
        <div className="space-y-3">
          <dl className="space-y-0">
            {[
              ['Service', form.service],
              ['Name', form.name],
              ['Phone', form.phone],
              ['Email', form.email],
              ['Address', form.address],
              ['Details', form.message],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div
                  key={label}
                  className={`flex justify-between gap-4 border-b py-2.5 text-sm ${s.reviewRow}`}
                >
                  <dt className={`shrink-0 font-semibold ${s.reviewLabel}`}>
                    {label}
                  </dt>
                  <dd className={`text-right ${s.reviewValue}`}>{value}</dd>
                </div>
              ))}
          </dl>
          {status === 'error' && (
            <p className={`text-center text-xs font-semibold ${s.error}`}>
              Something went wrong. Please try again or call us directly.
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1 px-2 py-3 text-sm font-bold transition-colors ${s.back}`}
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </button>
            <button
              type="button"
              disabled={status === 'sending'}
              onClick={submit}
              className="flex-1 rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending...' : 'Get My Free Quote'}
            </button>
          </div>
        </div>
      )}

      <p className={`mt-4 text-center text-xs ${s.hint}`}>
        Free, no-obligation estimate. We reply within 24 hours.
      </p>
    </div>
  )
}
