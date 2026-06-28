import { MapPinned } from 'lucide-react'
import { useLandownerBook } from '../../store/store.jsx'
import { ME_LANDOWNER } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, SplitTag, Dot } from '../../components/ui.jsx'
import { rp, ha as fmtHa } from '../../lib/format.js'

export default function LandownerPlots() {
  const { plotRows, totalHa } = useLandownerBook(ME_LANDOWNER)
  const t = useT()

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('lo.plots_label')}</div>
        <h1 className="font-display text-3xl text-ink">{t('lo.plots_title')}</h1>
        <p className="mt-1 font-sans text-sm text-ink-2">
          {plotRows.length} {t('lo.col_plot').toLowerCase()} · {fmtHa(totalHa)}
        </p>
      </header>

      <Panel label={t('lo.plots_label')} title={t('lo.plots_title')} bodyClass="">
        {/* dense hairline table: text left, debt value right-aligned mono */}
        <div className="hidden grid-cols-[1.4fr_4rem_1fr_7rem_8rem_9rem] gap-3 border-b border-line px-4 py-2 lg:grid">
          <span className="label-mono">{t('lo.col_plot')}</span>
          <span className="label-mono text-right">{t('lo.col_ha')}</span>
          <span className="label-mono">{t('lo.col_penggarap')}</span>
          <span className="label-mono">{t('lo.col_split')}</span>
          <span className="label-mono text-right">{t('bt.debt_label')}</span>
          <span className="label-mono">{t('lo.col_status')}</span>
        </div>
        <ul className="divide-y divide-line">
          {plotRows.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-2 items-center gap-2 px-4 py-3 lg:grid-cols-[1.4fr_4rem_1fr_7rem_8rem_9rem] lg:gap-3"
            >
              <div className="min-w-0">
                <div className="font-sans text-sm font-medium text-ink">{p.name}</div>
                <div className="font-mono text-2xs text-sage">{p.id} · {p.crop}</div>
              </div>
              <div className="hidden text-right font-mono text-sm tabular-nums text-ink lg:block">
                {fmtHa(p.ha)}
              </div>
              <div className="hidden font-sans text-sm text-ink-2 lg:block">{p.penggarap}</div>
              <div className="hidden lg:block">
                <SplitTag split={p.harvestSplit} />
              </div>
              <div
                className={`hidden text-right font-mono text-sm tabular-nums lg:block ${
                  p.debtOutstanding > 0 ? 'text-clay' : 'text-sage'
                }`}
              >
                {p.debtOutstanding > 0 ? rp(p.debtOutstanding) : '—'}
              </div>
              <div className="flex items-center justify-end gap-2 lg:justify-start">
                <PlotStatus p={p} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
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
