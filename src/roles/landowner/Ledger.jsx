import { Sprout, Scroll } from 'lucide-react'
import { useLandownerBook } from '../../store/store.jsx'
import { ME_LANDOWNER } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, LedgerTable, SplitWaterfall, EmptyState } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate } from '../../lib/format.js'

export default function LandownerLedger() {
  const { rows, records, totalIncome, totalHa } = useLandownerBook(ME_LANDOWNER)
  const t = useT()

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('lo.ledger_kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('lo.ledger_title')}</h1>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-3">
        <Metric label={t('lo.m_income')} value={rp(totalIncome)} sub={t('lo.m_income_sub')} tone="pine" />
        <Metric label={t('lo.records_label')} value={records.length} sub={t('lo.records_title')} />
        <Metric label={t('lo.m_ha')} value={fmtHa(totalHa)} sub={t('lo.m_ha_sub')} className="col-span-2 sm:col-span-1" />
      </div>

      {/* Harvest split waterfalls — one per realized harvest on owned plots */}
      <Panel label={t('lo.records_label')} title={t('lo.records_title')}>
        {records.length === 0 ? (
          <EmptyState icon={Sprout} title={t('lo.records_empty')} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((h) => (
              <div key={h.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-sans text-sm font-medium text-ink">{h.plot.name}</span>
                  <span className="font-mono text-2xs text-sage">
                    {fmtDate(h.date)} · {fmtHa(h.usedHa)}
                  </span>
                </div>
                <SplitWaterfall
                  gross={h.grossValue}
                  ownerShare={h.ownerShare}
                  farmerShare={h.farmerShare}
                  split={h.split}
                />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Owner's income journal */}
      <Panel label={t('lo.ledger_label')} title={t('lo.ledger_title2')} bodyClass="">
        {rows.length === 0 ? (
          <EmptyState icon={Scroll} title={t('lo.empty')} />
        ) : (
          <LedgerTable rows={rows} footerLabel={t('lo.total_income')} footerValue={rp(totalIncome)} />
        )}
      </Panel>
    </div>
  )
}
