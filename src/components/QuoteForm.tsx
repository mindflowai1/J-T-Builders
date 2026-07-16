import { useState } from 'react'
import { CheckIcon } from './icons'

const SERVICES = [
  'Decks, Pergolas & Sun Rooms',
  'Railings, Stairs & Exteriors',
  'Remodeling & Home Additions',
  'Other',
] as const

const inputCls =
  'w-full rounded-lg border border-ink-500/25 bg-white px-4 py-3 text-base text-ink-950 placeholder:text-ink-500/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40'

/**
 * Lead-capture form, reused in the hero and in the contact section.
 * TODO: wire submission to a real destination (email service / backend) — currently
 * it only shows the success state locally. See docs/design-plan.md open items.
 */
export default function QuoteForm({ id }: { id?: string }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-500 text-ink-950">
          <CheckIcon className="size-6" />
        </span>
        <p className="font-display text-xl font-bold text-ink-950 uppercase">
          Request received!
        </p>
        <p className="text-sm text-ink-500">
          We'll get back to you within 24 hours with your free estimate.
        </p>
      </div>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
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
          className={inputCls}
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
          className={inputCls}
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
          className={`${inputCls} text-ink-950 invalid:text-ink-500/70`}
        >
          <option value="" disabled>
            What do you need?
          </option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
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
          className={`${inputCls} resize-none`}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-500 px-6 py-3.5 font-bold text-ink-950 transition-colors hover:bg-brand-400 active:bg-brand-600"
      >
        Get My Free Quote
      </button>
      <p className="text-center text-xs text-ink-500">
        Free, no-obligation estimate — we reply within 24 hours.
      </p>
    </form>
  )
}
