import { ArrowDown } from 'lucide-react'
import { STATUS, MACHINE_STATUS, LEDGER_TYPE, serviceName } from '../lib/domain.js'
import { useT } from '../i18n/i18n.jsx'
import { rp, fmtDate } from '../lib/format.js'

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

// ── Ledger / bookkeeping primitives ──────────────────────────────────────────
// A strict accounting journal: tinted header, left-aligned text, right-aligned
// mono numbers in separate Debit (Masuk) / Kredit (Keluar) columns, a running
// Saldo, zebra rows, and a double-rule total. Visually distinct from the plain
// hairline data tables used elsewhere.
export function LedgerTable({ rows, showBalance = true, footerLabel, footerValue }) {
  const t = useT()
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-line-2 bg-paper-2 text-left">
            <th className="label-mono px-3 py-2 font-normal">{t('ledger.col_date')}</th>
            <th className="label-mono px-3 py-2 font-normal">{t('ledger.col_desc')}</th>
            <th className="label-mono px-3 py-2 text-right font-normal">{t('ledger.col_debit')}</th>
            <th className="label-mono px-3 py-2 text-right font-normal">{t('ledger.col_credit')}</th>
            {showBalance && (
              <th className="label-mono px-3 py-2 text-right font-normal">{t('ledger.col_balance')}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => {
            const meta = LEDGER_TYPE[e.type] || {}
            const debit = meta.column === 'debit'
            const amt = Math.abs(e.amount)
            // resolve description, translating the service-name var if present
            const vars = { ...e.descVars }
            if (vars.service) vars.service = serviceName(t, vars.service)
            const desc = e.descKey ? t(e.descKey, vars) : e.desc || ''
            return (
              <tr
                key={e.id}
                className={`border-b border-line align-top ${i % 2 ? 'bg-paper-2/40' : ''} ${
                  meta.memo ? 'text-ink-2' : 'text-ink'
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-2xs text-sage">
                  {fmtDate(e.date)}
                </td>
                <td className="px-3 py-2">
                  <div className="font-sans text-sm leading-tight">{desc}</div>
                  <div className="font-mono text-2xs text-sage">
                    {e.bookingId}
                    {meta.memo ? ` · ${t('ledger.memo')}` : ''}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums text-pine">
                  {debit ? `+${rp(amt)}` : ''}
                </td>
                <td
                  className={`whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums ${
                    meta.memo ? 'text-sage' : 'text-clay'
                  }`}
                >
                  {!debit ? `${meta.memo ? '(' : '−'}${rp(amt)}${meta.memo ? ')' : ''}` : ''}
                </td>
                {showBalance && (
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-sm font-medium tabular-nums text-ink">
                    {e.cash ? rp(e.saldo) : '—'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        {footerLabel != null && (
          <tfoot>
            <tr className="border-t-2 border-ink/20 bg-paper-2">
              <td className="px-3 py-2.5 font-sans text-sm font-semibold text-ink" colSpan={showBalance ? 4 : 3}>
                {footerLabel}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-base font-medium tabular-nums text-ink">
                {footerValue}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

// Typographic harvest-split waterfall: gross → owner share / farmer share.
export function SplitWaterfall({ gross, ownerShare, farmerShare, split, ownerLabel, farmerLabel }) {
  const t = useT()
  return (
    <div className="border border-line">
      <div className="border-b border-line bg-paper-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="label-mono">{t('lo.wf_gross')}</span>
          {split && (
            <span className="font-mono text-2xs uppercase tracking-wide text-sage">{split.label}</span>
          )}
        </div>
        <div className="mt-1 font-mono text-3xl font-medium tabular-nums text-ink">{rp(gross)}</div>
      </div>
      <div className="flex justify-center py-1.5">
        <ArrowDown className="h-4 w-4 text-sage-2" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
        <div className="px-4 py-3">
          <div className="label-mono text-pine">{ownerLabel || t('lo.wf_owner')}</div>
          <div className="mt-1 font-mono text-2xl font-medium tabular-nums text-pine">{rp(ownerShare)}</div>
          {split && <div className="mt-0.5 font-mono text-2xs text-sage">{split.ownerPercent}%</div>}
        </div>
        <div className="px-4 py-3">
          <div className="label-mono">{farmerLabel || t('lo.wf_farmer')}</div>
          <div className="mt-1 font-mono text-2xl font-medium tabular-nums text-ink">{rp(farmerShare)}</div>
          {split && <div className="mt-0.5 font-mono text-2xs text-sage">{split.farmerPercent}%</div>}
        </div>
      </div>
    </div>
  )
}

// Tiny split-ratio tag for plot tables
export function SplitTag({ split }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-line-2 px-1.5 py-0.5 font-mono text-2xs uppercase tracking-[0.06em] text-ink-2">
      {split.label}
    </span>
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
