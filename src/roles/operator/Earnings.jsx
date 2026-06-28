import { Coins, TrendingUp } from 'lucide-react'
import { useOperatorJobs } from '../../store/store.jsx'
import { ME_OPERATOR } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, StatusTag, EmptyState } from '../../components/ui.jsx'
import { rp, fmtDate, ha as fmtHa } from '../../lib/format.js'
import { serviceName } from '../../lib/domain.js'

export default function OperatorEarnings() {
  const jobs = useOperatorJobs(ME_OPERATOR)
  const t = useT()

  const earned = jobs.filter((j) => ['completed', 'invoiced'].includes(j.status))
  const pending = jobs.filter((j) => ['dispatched', 'in_progress', 'confirmed'].includes(j.status))

  const earnedTotal = earned.reduce((s, j) => s + j.price.operatorWage, 0)
  const pendingTotal = pending.reduce((s, j) => s + j.price.operatorWage, 0)
  const haTotal = earned.reduce((s, j) => s + (j.log.actualHa ?? j.ha), 0)

  const ledger = [...earned, ...pending].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('oe.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('oe.title')}</h1>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-3">
        <Metric label={t('oe.m_earned')} value={rp(earnedTotal)} sub={t('oe.m_earned_sub')} tone="pine" />
        <Metric label={t('oe.m_pending')} value={rp(pendingTotal)} sub={t('oe.m_pending_sub', { n: pending.length })} accent />
        <Metric label={t('oe.m_area')} value={fmtHa(haTotal)} sub={t('oe.m_area_sub')} className="col-span-2 sm:col-span-1" />
      </div>

      <Panel label={t('oe.ledger_label')} title={t('oe.ledger_title')} bodyClass="">
        {ledger.length === 0 ? (
          <EmptyState icon={Coins} title={t('oe.empty')} />
        ) : (
          <>
            <div className="hidden grid-cols-[5rem_1fr_5rem_7rem_8rem] gap-3 border-b border-line px-4 py-2 sm:grid">
              <span className="label-mono">{t('oe.col_date')}</span>
              <span className="label-mono">{t('oe.col_service')}</span>
              <span className="label-mono text-right">{t('oe.col_area')}</span>
              <span className="label-mono text-right">{t('oe.col_wage')}</span>
              <span className="label-mono">{t('oe.col_status')}</span>
            </div>
            <ul className="divide-y divide-line">
              {ledger.map((j) => {
                const paid = ['completed', 'invoiced'].includes(j.status)
                return (
                  <li
                    key={j.id}
                    className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[5rem_1fr_5rem_7rem_8rem]"
                  >
                    <div className="font-mono text-sm text-ink">{fmtDate(j.date)}</div>
                    <div className="min-w-0">
                      <div className="font-sans text-sm font-medium text-ink">{serviceName(t, j.service)}</div>
                      <div className="font-mono text-2xs text-ink-2">{j.plot.name}</div>
                    </div>
                    <div className="hidden text-right font-mono text-sm text-ink-2 sm:block">
                      {fmtHa(j.log.actualHa ?? j.ha)}
                    </div>
                    <div className={`text-right font-mono text-sm font-medium ${paid ? 'text-pine' : 'text-clay'}`}>
                      {rp(j.price.operatorWage)}
                    </div>
                    <div className="hidden sm:block">
                      <StatusTag status={j.status} />
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center justify-between border-t-2 border-ink/15 bg-paper-2 px-4 py-3">
              <span className="inline-flex items-center gap-2 font-sans font-semibold text-ink">
                <TrendingUp className="h-4 w-4 text-pine" /> {t('oe.total')}
              </span>
              <span className="font-mono text-xl font-medium text-pine">{rp(earnedTotal)}</span>
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
