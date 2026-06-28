import { Wallet, TrendingDown, Info } from 'lucide-react'
import { useStore, useFarmerBook } from '../../store/store.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, Button, LedgerTable, EmptyState, PayChip } from '../../components/ui.jsx'
import { rp, fmtDate, ha as fmtHa } from '../../lib/format.js'
import { serviceName, TODAY } from '../../lib/domain.js'

export default function BukuTani() {
  const { dispatch } = useStore()
  const { rows, income, outstanding, cash, net, debts } = useFarmerBook()
  const t = useT()

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('bt.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('bt.title')}</h1>
      </header>

      {/* Net position header — the headline number */}
      <div className="border border-line">
        <div className="grid gap-px bg-line sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="bg-paper px-4 py-4">
            <div className="label-mono">{t('bt.net_label')}</div>
            <div
              className={`mt-1 font-mono text-4xl font-semibold leading-none tracking-tight tabular-nums ${
                net < 0 ? 'text-clay' : 'text-pine'
              }`}
            >
              {rp(net)}
            </div>
            <div className="mt-1.5 font-mono text-2xs text-sage">{t('bt.net_sub')}</div>
          </div>
          <Metric label={t('bt.cash_label')} value={rp(cash)} sub={t('bt.cash_sub')} />
          <Metric label={t('bt.income_label')} value={rp(income)} sub={t('bt.income_sub')} tone="pine" />
          <Metric label={t('bt.debt_label')} value={rp(outstanding)} sub={t('bt.debt_sub')} accent />
        </div>
      </div>

      <div className="flex items-start gap-2 border-l-2 border-line-2 bg-paper-2 px-3 py-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
        <p className="font-sans text-2xs leading-snug text-ink-2">{t('bt.formula')}</p>
      </div>

      {/* Debt breakdown — the actionable, payable machinery debts */}
      <Panel label={t('bt.debt_label')} title={t('bt.debt_title')} bodyClass="">
        {debts.length === 0 ? (
          <EmptyState icon={Wallet} title={t('bt.debt_empty')} />
        ) : (
          <ul className="divide-y divide-line">
            {debts.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="w-20 shrink-0">
                  <div className="font-mono text-sm font-medium text-ink">{fmtDate(b.date)}</div>
                  <div className="font-mono text-2xs text-sage">{b.id}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm font-medium text-ink">
                    {serviceName(t, b.service)}
                  </div>
                  <div className="font-mono text-2xs text-ink-2">
                    {b.plot.name} · {fmtHa(b.ha)}
                  </div>
                </div>
                <PayChip pay={b.pay} />
                <div className="text-right">
                  <div className="font-mono text-base font-medium tabular-nums text-clay">
                    −{rp(b.price.total)}
                  </div>
                  <div className="font-mono text-2xs text-sage">{t('bt.debt_due')}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => dispatch({ type: 'PAY', payload: { id: b.id, at: TODAY } })}
                >
                  {t('bt.pay_btn')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* The ledger / general journal */}
      <Panel label={t('bt.ledger_label')} title={t('bt.ledger_title')} bodyClass="">
        {rows.length === 0 ? (
          <EmptyState icon={TrendingDown} title={t('bt.empty')} />
        ) : (
          <LedgerTable rows={rows} footerLabel={t('bt.total_in')} footerValue={rp(cash)} />
        )}
      </Panel>
    </div>
  )
}
