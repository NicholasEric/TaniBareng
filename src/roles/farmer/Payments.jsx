import { Check, History } from 'lucide-react'
import { useStore, useDerived } from '../../store/store.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, Button, PayChip, EmptyState } from '../../components/ui.jsx'
import { rp, fmtDate, ha as fmtHa } from '../../lib/format.js'
import { serviceName } from '../../lib/domain.js'

export default function FarmerPayments() {
  const { dispatch } = useStore()
  const { enriched } = useDerived()
  const t = useT()

  const harvestCredit = enriched.filter((b) => b.pay === 'harvest')
  const outstanding = harvestCredit.filter((b) => !b.paid)
  const outstandingTotal = outstanding.reduce((s, b) => s + b.price.total, 0)
  const settledTotal = harvestCredit.filter((b) => b.paid).reduce((s, b) => s + b.price.total, 0)

  const history = enriched
    .filter((b) => b.paid || (b.pay === 'now' && ['invoiced', 'completed'].includes(b.status)))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('fp.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('fp.title')}</h1>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-3">
        <Metric label={t('fp.m_bill')} value={rp(outstandingTotal)} sub={t('fp.m_bill_sub', { n: outstanding.length })} accent />
        <Metric label={t('fp.m_paid')} value={rp(settledTotal)} sub={t('fp.m_paid_sub')} tone="pine" />
        <Metric
          label={t('fp.m_scheme')}
          value="0%"
          sub={t('fp.m_scheme_sub')}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <Panel label={t('fp.sched_label')} title={t('fp.sched_title')} bodyClass="">
        {outstanding.length === 0 ? (
          <EmptyState icon={Check} title={t('fp.empty_title')}>
            {t('fp.empty_body')}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {outstanding.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="w-20 shrink-0">
                  <div className="font-mono text-sm font-medium text-ink">{fmtDate(b.date)}</div>
                  <div className="font-mono text-2xs text-sage">{b.id}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm font-medium text-ink">{serviceName(t, b.service)}</div>
                  <div className="font-mono text-2xs text-ink-2">
                    {b.plot.name} · {fmtHa(b.ha)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-medium text-clay">{rp(b.price.total)}</div>
                  <div className="font-mono text-2xs text-sage">{t('fp.due')}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => dispatch({ type: 'PAY', payload: { id: b.id } })}
                >
                  {t('fp.pay_btn')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel label={t('fp.hist_label')} title={t('fp.hist_title')} bodyClass="">
        {history.length === 0 ? (
          <EmptyState icon={History} title={t('fp.hist_empty')} />
        ) : (
          <ul className="divide-y divide-line">
            {history.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                <Check className="h-4 w-4 shrink-0 text-ok" />
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm text-ink">{serviceName(t, b.service)} · {b.plot.name}</div>
                  <div className="font-mono text-2xs text-sage">{b.id} · {fmtDate(b.date)}</div>
                </div>
                <PayChip pay={b.pay} />
                <div className="w-24 text-right font-mono text-sm text-ink">{rp(b.price.total)}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
