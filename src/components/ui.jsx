import { STATUS, MACHINE_STATUS } from '../lib/domain.js'
import { useT } from '../i18n/i18n.jsx'

const DOT_COLORS = {
  ok: 'bg-ok',
  sage: 'bg-sage',
  pine: 'bg-pine',
  clay: 'bg-clay',
  idle: 'bg-sage-2',
  warn: 'bg-clay',
}

// Tiny status dot
export function Dot({ tone = 'idle', className = '' }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone]} ${className}`} aria-hidden />
}

// Booking status: dot + mono tag (the repeated status motif)
export function StatusTag({ status }) {
  const t = useT()
  const s = STATUS[status]
  if (!s) return null
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <Dot tone={s.dot} />
      <span className="font-mono text-2xs uppercase tracking-[0.08em] text-ink-2">
        {t(`status.${status}`)}
      </span>
    </span>
  )
}

export function MachineStatusTag({ status }) {
  const t = useT()
  const s = MACHINE_STATUS[status]
  if (!s) return null
  return (
    <span className="inline-flex items-center gap-1.5">
      <Dot tone={s.dot} />
      <span className="font-mono text-2xs uppercase tracking-[0.08em] text-ink-2">
        {t(`mstatus.${status}`)}
      </span>
    </span>
  )
}

// Hairline-bordered data panel — the structural motif
export function Panel({ title, label, right, children, className = '', bodyClass = '', as: Tag = 'section' }) {
  return (
    <Tag className={`border border-line bg-paper ${className}`}>
      {(title || label || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            {label && <div className="label-mono">{label}</div>}
            {title && <h2 className="font-display text-lg leading-tight text-ink">{title}</h2>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={bodyClass || 'p-4'}>{children}</div>
    </Tag>
  )
}

// Metric cell — big mono number + mono label, edge-sharing in a grid
export function Metric({ label, value, sub, tone = 'ink', accent = false }) {
  return (
    <div className="px-4 py-3.5">
      <div className="label-mono">{label}</div>
      <div
        className={`mt-1 font-mono text-2xl font-medium leading-none tracking-tight ${
          accent ? 'text-clay' : tone === 'pine' ? 'text-pine' : 'text-ink'
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-2xs text-sage">{sub}</div>}
    </div>
  )
}

export function Button({ variant = 'default', size = 'md', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none'
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }
  const variants = {
    // primary action uses the clay accent — sparingly
    primary: 'bg-clay text-paper hover:bg-clay-2 active:bg-clay-2',
    default: 'bg-pine text-paper hover:bg-pine-2 active:bg-pine-2',
    outline: 'border border-line-2 bg-paper text-ink hover:bg-paper-2',
    ghost: 'text-ink-2 hover:bg-paper-2',
    danger: 'border border-clay/40 bg-paper text-clay hover:bg-clay-soft',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="label-mono mb-1.5">{label}</div>
      {children}
      {hint && <div className="mt-1 font-mono text-2xs text-sage">{hint}</div>}
    </label>
  )
}

export function TextInput({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-sm border border-line-2 bg-paper px-3 font-mono text-sm text-ink placeholder:text-sage-2 focus:border-pine ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-10 w-full rounded-sm border border-line-2 bg-paper px-3 font-sans text-sm text-ink focus:border-pine ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

// Inline warning strip — the only place the accent shouts
export function WarnStrip({ children, icon: Icon }) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-clay bg-clay-soft px-3 py-2">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />}
      <p className="font-sans text-sm leading-snug text-ink">{children}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {Icon && <Icon className="h-7 w-7 text-sage-2" strokeWidth={1.5} />}
      <div className="font-display text-base text-ink-2">{title}</div>
      {children && <p className="max-w-xs font-sans text-sm text-sage">{children}</p>}
    </div>
  )
}

// Pay-mode chip (pay-at-harvest is first-class)
export function PayChip({ pay }) {
  const t = useT()
  const harvest = pay === 'harvest'
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-[0.06em] ${
        harvest ? 'border-clay/40 text-clay' : 'border-line-2 text-sage'
      }`}
    >
      {harvest ? t('pay.chip_harvest') : t('pay.chip_now')}
    </span>
  )
}
