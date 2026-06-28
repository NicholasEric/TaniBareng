import { Banknote, PiggyBank, RefreshCw, Receipt } from 'lucide-react'
import { useDerived } from '../../store/store.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, EmptyState } from '../../components/ui.jsx'
import { rp, fmtDate, ha as fmtHa } from '../../lib/format.js'
import { FUND_SHARE } from '../../data/seed.js'
import { serviceName } from '../../lib/domain.js'

export default function Finance() {
  const { enriched, finance } = useDerived()
  const t = useT()

  const receivables = enriched
    .filter((b) => b.pay === 'harvest' && !b.paid)
    .sort((a, b) => a.date.localeCompare(b.date))

  const fundPct = Math.round(FUND_SHARE * 100)
  const reinvestPct = 100 - fundPct

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('fn.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('fn.title')}</h1>
        <p className="mt-1 font-sans text-sm text-ink-2">{t('fn.sub')}</p>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-4">
        <Metric label={t('fn.m_season')} value={rp(finance.revenueSeason)} sub={t('fn.m_season_sub')} tone="pine" />
        <Metric label={t('fn.m_week')} value={rp(finance.revenueThisWeek)} sub={t('fn.m_week_sub')} />
        <Metric label={t('fn.m_wage')} value={rp(finance.operatorCost)} sub={t('fn.m_wage_sub')} />
        <Metric label={t('fn.m_recv')} value={rp(finance.receivables)} sub={t('fn.m_recv_sub')} accent />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel label={t('fn.split_label')} title={t('fn.split_title')}>
          <div className="mb-4">
            <div className="label-mono">{t('fn.margin_label')}</div>
            <div className="mt-1 font-mono text-3xl font-medium text-ink">{rp(finance.margin)}</div>
          </div>

          <div className="flex h-3 overflow-hidden rounded-sm border border-line">
            <div className="bg-pine" style={{ width: `${reinvestPct}%` }} title={t('fn.reinvest', { pct: reinvestPct })} />
            <div className="bg-clay" style={{ width: `${fundPct}%` }} title={t('fn.fund', { pct: fundPct })} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SplitCard
              tone="pine"
              label={t('fn.reinvest', { pct: reinvestPct })}
              value={rp(finance.reinvestContribution)}
              sub={t('fn.reinvest_sub')}
            />
            <SplitCard
              tone="clay"
              label={t('fn.fund', { pct: fundPct })}
              value={rp(finance.fundContribution)}
              sub={t('fn.fund_sub')}
            />
          </div>
        </Panel>

        <Panel label={t('fn.bal_label')} title={t('fn.bal_title')}>
          <div className="space-y-4">
            <Balance
              icon={PiggyBank}
              label={t('fn.bal_fund')}
              value={rp(finance.fundBalance)}
              sub={t('fn.bal_fund_sub', { amt: rp(finance.fundContribution) })}
              tone="pine"
            />
            <Balance
              icon={RefreshCw}
              label={t('fn.bal_reinvest')}
              value={rp(finance.reinvestBalance)}
              sub={t('fn.bal_reinvest_sub')}
            />
            <Balance
              icon={Receipt}
              label={t('fn.bal_recv')}
              value={rp(finance.receivables)}
              sub={t('fn.bal_recv_sub', { n: receivables.length })}
              tone="clay"
            />
          </div>
        </Panel>
      </div>

      <Panel label={t('fn.recv_label')} title={t('fn.recv_title')} bodyClass="">
        {receivables.length === 0 ? (
          <EmptyState icon={Banknote} title={t('fn.recv_empty')} />
        ) : (
          <>
            <div className="hidden grid-cols-[5rem_1fr_1fr_7rem] gap-3 border-b border-line px-4 py-2 sm:grid">
              <span className="label-mono">{t('fn.col_date')}</span>
              <span className="label-mono">{t('fn.col_order')}</span>
              <span className="label-mono">{t('fn.col_plot')}</span>
              <span className="label-mono text-right">{t('fn.col_value')}</span>
            </div>
            <ul className="divide-y divide-line">
              {receivables.map((b) => (
                <li
                  key={b.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[5rem_1fr_1fr_7rem]"
                >
                  <div className="hidden font-mono text-sm text-ink sm:block">{fmtDate(b.date)}</div>
                  <div className="min-w-0">
                    <div className="font-sans text-sm font-medium text-ink">{serviceName(t, b.service)}</div>
                    <div className="font-mono text-2xs text-sage sm:hidden">{b.id} · {fmtDate(b.date)}</div>
                    <div className="hidden font-mono text-2xs text-sage sm:block">{b.id}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-sans text-sm text-ink-2">{b.plot.name}</div>
                    <div className="font-mono text-2xs text-sage">{b.plot.owner} · {fmtHa(b.ha)}</div>
                  </div>
                  <div className="text-right font-mono text-sm font-medium text-clay">{rp(b.price.total)}</div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t-2 border-ink/15 bg-paper-2 px-4 py-3">
              <span className="font-sans font-semibold text-ink">{t('fn.recv_total')}</span>
              <span className="font-mono text-xl font-medium text-clay">{rp(finance.receivables)}</span>
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}

function SplitCard({ tone, label, value, sub }) {
  return (
    <div className="border border-line p-3">
      <div className="flex items-center gap-1.5">
        <span className={`inline-block h-2 w-2 rounded-sm ${tone === 'clay' ? 'bg-clay' : 'bg-pine'}`} />
        <span className="label-mono">{label}</span>
      </div>
      <div className={`mt-1 font-mono text-lg font-medium ${tone === 'clay' ? 'text-clay' : 'text-pine'}`}>{value}</div>
      <div className="mt-0.5 font-sans text-2xs text-sage">{sub}</div>
    </div>
  )
}

function Balance({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm ${tone === 'clay' ? 'bg-clay-soft text-clay' : 'bg-paper-3 text-pine'}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="label-mono">{label}</div>
        <div className={`font-mono text-xl font-medium ${tone === 'clay' ? 'text-clay' : tone === 'pine' ? 'text-pine' : 'text-ink'}`}>
          {value}
        </div>
        <div className="font-sans text-2xs text-sage">{sub}</div>
      </div>
    </div>
  )
}
