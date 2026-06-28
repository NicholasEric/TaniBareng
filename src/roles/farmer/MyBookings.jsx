import { useState } from 'react'
import { ChevronLeft, Tractor, User, MapPin, Phone, ClipboardList, FileText } from 'lucide-react'
import { useDerived } from '../../store/store.jsx'
import { useNav } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, StatusTag, PayChip, EmptyState, Dot } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate, num } from '../../lib/format.js'
import { STATUS, STATUS_ORDER, serviceName } from '../../lib/domain.js'

export default function MyBookings({ focusId }) {
  const { enriched } = useDerived()
  const t = useT()
  const [openId, setOpenId] = useState(focusId || null)

  const sorted = [...enriched].sort((a, b) => b.date.localeCompare(a.date))
  const open = enriched.find((b) => b.id === openId)

  if (open) return <BookingDetail booking={open} onBack={() => setOpenId(null)} />

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('mb.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('mb.title')}</h1>
      </header>

      {sorted.length === 0 ? (
        <Panel>
          <EmptyState icon={ClipboardList} title={t('mb.empty')} />
        </Panel>
      ) : (
        <Panel label={t('mb.count', { n: sorted.length })} title={t('mb.all_title')} bodyClass="">
          <div className="hidden grid-cols-[5.5rem_1fr_7rem_6rem_8rem] gap-3 border-b border-line px-4 py-2 sm:grid">
            <span className="label-mono">{t('mb.col_date')}</span>
            <span className="label-mono">{t('mb.col_service')}</span>
            <span className="label-mono text-right">{t('mb.col_total')}</span>
            <span className="label-mono">{t('mb.col_pay')}</span>
            <span className="label-mono">{t('mb.col_status')}</span>
          </div>
          <ul className="divide-y divide-line">
            {sorted.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => setOpenId(b.id)}
                  className="grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-paper-2 sm:grid-cols-[5.5rem_1fr_7rem_6rem_8rem]"
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-ink">{fmtDate(b.date)}</div>
                    <div className="font-mono text-2xs text-sage">{b.id}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-sans text-sm font-medium text-ink">{serviceName(t, b.service)}</div>
                    <div className="font-mono text-2xs text-ink-2">
                      {b.plot.name} · {fmtHa(b.ha)}
                    </div>
                  </div>
                  <div className="hidden text-right font-mono text-sm text-ink sm:block">
                    {rp(b.price.total)}
                  </div>
                  <div className="hidden sm:block">
                    <PayChip pay={b.pay} />
                  </div>
                  <div className="justify-self-end sm:justify-self-start">
                    <StatusTag status={b.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

function BookingDetail({ booking: b, onBack }) {
  const t = useT()
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 font-sans text-sm text-ink-2 hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t('mb.title')}
      </button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{b.id}</div>
          <h1 className="font-display text-3xl text-ink">{serviceName(t, b.service)}</h1>
          <p className="mt-1 font-mono text-sm text-ink-2">
            {b.plot.name} · {fmtHa(b.ha)} · {fmtDate(b.date, { long: true })}
          </p>
        </div>
        <StatusTag status={b.status} />
      </header>

      <Panel label={t('mb.track_label')} title={t('mb.flow_title')}>
        <ol className="flex flex-wrap gap-x-1 gap-y-3">
          {STATUS_ORDER.map((key, i) => {
            const cur = STATUS[b.status].step
            const me = STATUS[key].step
            const done = me < cur
            const active = me === cur
            return (
              <li key={key} className="flex items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 ${
                    active
                      ? 'border-pine bg-pine text-paper'
                      : done
                        ? 'border-line bg-paper-2 text-ink-2'
                        : 'border-line text-sage'
                  }`}
                >
                  <Dot tone={active ? 'clay' : done ? 'ok' : 'idle'} />
                  <span className="font-mono text-2xs uppercase tracking-wide">{t(`status.${key}`)}</span>
                </span>
                {i < STATUS_ORDER.length - 1 && <span className="h-px w-2 bg-line" />}
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel label={t('mb.assign_label')} title={t('mb.assign_title')}>
          {b.operator ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-sm bg-pine text-paper">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-sans font-semibold text-ink">{b.operator.name}</div>
                  <div className="flex items-center gap-1 font-mono text-2xs text-sage">
                    <Phone className="h-3 w-3" /> {b.operator.phone}
                  </div>
                </div>
              </div>
              {b.machine_ && (
                <div className="flex items-center gap-3 border-t border-line pt-3">
                  <span className="grid h-10 w-10 place-items-center rounded-sm bg-paper-3 text-pine">
                    <Tractor className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-sans font-semibold text-ink">{b.machine_.name}</div>
                    <div className="font-mono text-2xs text-sage">
                      {b.machine_.id} · {b.machine_.type}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={User} title={t('mb.wait_assign_title')}>
              {t('mb.wait_assign_body')}
            </EmptyState>
          )}
        </Panel>

        <Panel label={t('mb.bill_label')} title={t('mb.bill_title')}>
          <dl className="space-y-2">
            <BillRow
              label={t('mb.bill_service', { per: rp(b.price.pricePerHa), ha: num(b.ha) })}
              value={rp(b.price.subtotal)}
            />
            <BillRow label={t('mb.bill_mob')} value={rp(b.price.mobilization)} />
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="font-sans font-semibold text-ink">{t('bk.total')}</span>
              <span className="font-mono text-lg font-medium text-ink">{rp(b.price.total)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <PayChip pay={b.pay} />
              <span className={`font-mono text-2xs uppercase tracking-wide ${b.paid ? 'text-ok' : 'text-clay'}`}>
                {b.paid ? t('common.paid') : t('common.unpaid')}
              </span>
            </div>
          </dl>
        </Panel>
      </div>

      {(b.log.actualHa || b.log.notes) && (
        <Panel label={t('mb.field_label')} title={t('mb.field_title')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('mb.f_area')} value={b.log.actualHa ? fmtHa(b.log.actualHa) : '–'} />
            <Field label={t('mb.f_fuel')} value={b.log.fuelLiters ? `${b.log.fuelLiters} L` : '–'} />
            <Field label={t('mb.f_done')} value={b.log.completedAt ? fmtDate(b.log.completedAt) : '–'} />
          </div>
          {b.log.notes && (
            <div className="mt-3 flex items-start gap-2 border-t border-line pt-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <p className="font-sans text-sm text-ink-2">{b.log.notes}</p>
            </div>
          )}
        </Panel>
      )}
    </div>
  )
}

function BillRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-sm text-ink-2">{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="label-mono">{label}</div>
      <div className="mt-0.5 font-mono text-base text-ink">{value}</div>
    </div>
  )
}
