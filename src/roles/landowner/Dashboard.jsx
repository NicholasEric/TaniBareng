import { ArrowRight, Sprout, MapPinned } from 'lucide-react'
import { useLandownerBook } from '../../store/store.jsx'
import { useNav, ME_LANDOWNER } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, Button, SplitWaterfall, SplitTag, Dot, EmptyState } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate } from '../../lib/format.js'
import { TODAY } from '../../lib/domain.js'

export default function LandownerDashboard() {
  const { landowner, totalIncome, totalHa, plotCount, plotRows, records } = useLandownerBook(ME_LANDOWNER)
  const { go } = useNav()
  const t = useT()

  const latest = records[records.length - 1]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{t('lo.kicker')}</div>
          <h1 className="font-display text-3xl text-ink">{landowner.name}</h1>
          <p className="mt-1 font-mono text-sm text-ink-2">{t('lo.title')} · {fmtDate(TODAY, { long: true })}</p>
        </div>
        <Button variant="default" onClick={() => go('ledger')}>
          {t('nav.lo_ledger')} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-4">
        <Metric label={t('lo.m_plots')} value={plotCount} sub={t('lo.m_plots_sub')} tone="pine" />
        <Metric label={t('lo.m_ha')} value={fmtHa(totalHa)} sub={t('lo.m_ha_sub')} />
        <Metric label={t('lo.m_income')} value={rp(totalIncome)} sub={t('lo.m_income_sub')} tone="pine" />
        <Metric label={t('lo.m_season')} value={t('lo.season_status')} sub={t('lo.m_season_sub')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* plots preview */}
        <Panel
          label={t('lo.plots_label')}
          title={t('lo.plots_title')}
          className="lg:col-span-2"
          bodyClass=""
          right={
            <Button variant="ghost" size="sm" onClick={() => go('plots')}>
              {t('common.all')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        >
          <ul className="divide-y divide-line">
            {plotRows.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm font-medium text-ink">{p.name}</div>
                  <div className="font-mono text-2xs text-ink-2">
                    {p.id} · {fmtHa(p.ha)} · {p.penggarap}
                  </div>
                </div>
                <SplitTag split={p.harvestSplit} />
                <PlotStatus p={p} />
              </li>
            ))}
          </ul>
        </Panel>

        {/* latest harvest split */}
        <Panel label={t('lo.records_label')} title={t('lo.records_title')}>
          {latest ? (
            <SplitWaterfall
              gross={latest.grossValue}
              ownerShare={latest.ownerShare}
              farmerShare={latest.farmerShare}
              split={latest.split}
            />
          ) : (
            <EmptyState icon={Sprout} title={t('lo.records_empty')} />
          )}
        </Panel>
      </div>
    </div>
  )
}

function PlotStatus({ p }) {
  const t = useT()
  if (p.harvested) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Dot tone={p.debtCleared ? 'ok' : 'clay'} />
        <span className="font-mono text-2xs uppercase tracking-wide text-ink-2">
          {p.debtCleared ? t('lo.debt_clear') : t('lo.debt_due')}
        </span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Dot tone={p.activeHarvest ? 'pine' : 'idle'} />
      <span className="font-mono text-2xs uppercase tracking-wide text-sage">
        {p.activeHarvest ? t('lo.upcoming') : t('lo.not_harvested')}
      </span>
    </span>
  )
}
