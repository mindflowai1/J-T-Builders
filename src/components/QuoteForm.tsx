import { useRef, useState, type FormEvent } from 'react'
import { trackEvent, trackGoogleConversion } from '../lib/tracking'
import { SITE } from '../lib/site'
import { CheckIcon } from './icons'

const SERVICES = [
  'Decks, Pergolas & Sun Rooms',
  'Railings, Stairs & Exteriors',
  'Remodeling & Home Additions',
  'Other',
] as const

const STEP_TITLES = [
  'What do you need?',
  'Where is the project?',
  'How can we reach you?',
] as const

const STYLES = {
  light: {
    input:
      'w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-base text-ink-950 placeholder:text-ink-500/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    option:
      'border-ink-500/25 bg-white text-ink-950 hover:border-brand-500 hover:bg-brand-500 hover:text-ink-950 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/40',
    optionActive: 'border-brand-500 bg-brand-500/10 text-ink-950',
    title: 'text-ink-950',
    track: 'bg-ink-500/15',
    back: 'border-ink-500/25 text-ink-700 hover:border-ink-500/50',
    hint: 'text-ink-500',
    error: 'text-red-600',
    successTitle: 'text-ink-950',
    successHint: 'text-ink-500',
  },
  glass: {
    input:
      'w-full rounded-lg border border-cream-50/25 bg-cream-50/10 px-4 py-3 text-base text-cream-50 placeholder:text-cream-50/60 backdrop-blur-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40',
    option:
      'border-cream-50/25 bg-cream-50/10 text-cream-50 backdrop-blur-md hover:border-brand-500 hover:bg-brand-500 hover:text-ink-950 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/40',
    optionActive: 'border-brand-500 bg-brand-500/20 text-cream-50',
    title: 'text-cream-50',
    track: 'bg-cream-50/15',
    back: 'border-cream-50/25 text-cream-50/85 hover:border-cream-50/50',
    hint: 'text-cream-50/70',
    error: 'text-red-400',
    successTitle: 'text-cream-50',
    successHint: 'text-cream-50/70',
  },
} as const

const PRIMARY_BUTTON =
  'flex-1 rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Lead-capture form in three short steps: service, project, contact. Posts to
 * /api/jobber/create-request, which creates the client + request in Jobber,
 * and fires Lead and the Google conversion only when that call succeeds. Two
 * looks: 'glass' (over the hero video) and 'light' (on a white card).
 *
 * Every step stays mounted (inactive ones are `hidden`), so one FormData holds
 * all answers and Back never loses anything. Validation is per step, by hand
 * (noValidate): native validation would trip on required fields in hidden steps.
 */
export default function QuoteForm({
  id,
  variant = 'light',
}: {
  id: string
  variant?: 'light' | 'glass'
}) {
  const [step, setStep] = useState(0)
  const [service, setService] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const started = useRef(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const s = STYLES[variant]
  const last = STEP_TITLES.length - 1

  // First thing the visitor touches: they started filling the form
  function handleFocus() {
    if (started.current) return
    started.current = true
    trackEvent('InitiateCheckout')
  }

  function goTo(next: number) {
    setStep(next)
    // After React shows the step: move focus into it, without jumping the page
    requestAnimationFrame(() => {
      stepRefs.current[next]
        ?.querySelector<HTMLElement>('input, textarea, button')
        ?.focus({ preventScroll: true })
    })
  }

  /** Shows the browser's message on the first invalid field of this step. */
  function stepIsValid(index: number) {
    const fields = stepRefs.current[index]?.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >('input, textarea')
    for (const field of fields ?? []) {
      if (!field.checkValidity()) {
        field.reportValidity()
        return false
      }
    }
    return true
  }

  function chooseService(value: string) {
    setService(value)
    goTo(1)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Enter on an earlier step moves forward instead of submitting
    if (step < last) {
      if (step > 0 && stepIsValid(step)) goTo(step + 1)
      return
    }
    if (!stepIsValid(step)) return

    const data = new FormData(e.currentTarget)

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
          service,
          message: data.get('message') || '',
        }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      // Real conversion: the request exists in Jobber
      trackEvent('Lead', { email, phone })
      trackGoogleConversion()
      setStatus('sent')
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

  const backButton = (
    <button
      type="button"
      onClick={() => goTo(step - 1)}
      className={`rounded-lg border-2 px-5 py-3 font-bold transition-colors ${s.back}`}
    >
      Back
    </button>
  )

  return (
    <form noValidate onSubmit={handleSubmit} onFocus={handleFocus}>
      {/* Honeypot — visually hidden and unreachable by keyboard/screen readers */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-full opacity-0"
      />

      {/* Progress */}
      <div className="mb-4">
        <div className="flex gap-1.5" aria-hidden="true">
          {STEP_TITLES.map((title, i) => (
            <span
              key={title}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-brand-500' : s.track
              }`}
            />
          ))}
        </div>
        <p className={`mt-3 text-xs font-bold tracking-widest uppercase ${s.hint}`}>
          Step {step + 1} of {STEP_TITLES.length}
        </p>
        <p
          id={`${id}-title`}
          aria-live="polite"
          className={`mt-1 font-display text-lg font-bold ${s.title}`}
        >
          {STEP_TITLES[step]}
        </p>
      </div>

      {/* Step 1: service, one tap moves on */}
      <div
        ref={(el) => {
          stepRefs.current[0] = el
        }}
        hidden={step !== 0}
        role="group"
        aria-labelledby={`${id}-title`}
        className="grid gap-2.5"
      >
        {SERVICES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={service === option}
            onClick={() => chooseService(option)}
            className={`w-full rounded-lg border-2 px-4 py-3.5 text-left font-semibold transition-colors focus:outline-none ${
              service === option ? s.optionActive : s.option
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Step 2: project */}
      <div
        ref={(el) => {
          stepRefs.current[1] = el
        }}
        hidden={step !== 1}
        className="space-y-3"
      >
        <div>
          <label htmlFor={`${id}-address`} className="sr-only">
            Property address
          </label>
          <input
            id={`${id}-address`}
            name="address"
            type="text"
            required
            autoComplete="street-address"
            placeholder="Property address or town"
            className={s.input}
          />
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
        <div className="flex gap-2.5">
          {backButton}
          <button type="submit" className={PRIMARY_BUTTON}>
            Next
          </button>
        </div>
      </div>

      {/* Step 3: contact, then send */}
      <div
        ref={(el) => {
          stepRefs.current[2] = el
        }}
        hidden={step !== 2}
        className="space-y-3"
      >
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
            placeholder="Email address (optional)"
            className={s.input}
          />
        </div>
        <div className="flex gap-2.5">
          {backButton}
          <button
            type="submit"
            disabled={status === 'sending'}
            className={PRIMARY_BUTTON}
          >
            {status === 'sending' ? 'Sending...' : 'Get My Free Quote'}
          </button>
        </div>
        {status === 'error' && (
          <p className={`text-center text-xs font-semibold ${s.error}`}>
            Something went wrong. Please try again or call us at{' '}
            <a href={SITE.phoneHref} className="underline">
              {SITE.phone}
            </a>
            .
          </p>
        )}
      </div>

      <p className={`mt-4 text-center text-xs ${s.hint}`}>
        Free, no-obligation estimate. We reply within 24 hours.
      </p>
    </form>
  )
}
