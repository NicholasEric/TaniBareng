import { CalendarPlus, ArrowRight, Sprout, TriangleAlert } from 'lucide-react'
import { useDerived } from '../../store/store.jsx'
import { useNav } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, Button, StatusTag, PayChip, EmptyState, WarnStrip } from '../../components/ui.jsx'
import { rp, ha, fmtDate } from '../../lib/format.js'
import { seasonFor, serviceName, catLabel, TODAY } from '../../lib/domain.js'

export default function FarmerDashboard() {
  const { enriched, finance } = useDerived()
  const { go } = useNav()
  const t = useT()

  const upcoming = enriched
    .filter((b) => !['completed', 'invoiced'].includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date))

  const outstanding = enriched
    .filter((b) => b.pay === 'harvest' && !b.paid)
    .reduce((s, b) => s + b.price.total, 0)

  const totalHa = enriched
    .filter((b) => b.date >= TODAY && !['completed', 'invoiced'].includes(b.status))
    .reduce((s, b) => s + b.ha, 0)

  const peakHit = upcoming.find((b) => seasonFor(b.service, b.date).peak)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{t('fd.kicker')}</div>
          <h1 className="font-display text-3xl text-ink">{t('fd.welcome')}</h1>
          <p className="mt-1 font-sans text-sm text-ink-2">
            {t('fd.season_line', { date: fmtDate(TODAY, { long: true }) })}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => go('book')}>
          <CalendarPlus className="h-4 w-4" />
          {t('nav.book')}
        </Button>
      </header>

      {peakHit && (
        <WarnStrip icon={TriangleAlert}>{t('fd.peak_warn')}</WarnStrip>
      )}

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-3">
        <Metric label={t('fd.m_active')} value={upcoming.length} sub={t('fd.m_active_sub')} tone="pine" />
        <Metric label={t('fd.m_bill')} value={rp(outstanding)} sub={t('pay.harvest')} accent />
        <Metric
          label={t('fd.m_ha')}
          value={ha(totalHa)}
          sub={t('fd.m_ha_sub')}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          label={t('fd.up_label')}
          title={t('fd.up_title')}
          className="lg:col-span-2"
          bodyClass=""
          right={
            <Button variant="ghost" size="sm" onClick={() => go('bookings')}>
              {t('common.all')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState icon={Sprout} title={t('fd.empty_title')}>
              {t('fd.empty_body')}
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 5).map((b) => {
                const peak = seasonFor(b.service, b.date).peak
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => go('bookings', { id: b.id })}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2"
                    >
                      <div className="w-16 shrink-0">
                        <div className="font-mono text-sm font-medium text-ink">{fmtDate(b.date)}</div>
                        <div className="font-mono text-2xs text-sage">{b.id}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-sm font-medium text-ink">
                            {serviceName(t, b.service)}
                          </span>
                          {peak && (
                            <span className="font-mono text-2xs uppercase tracking-wide text-clay">
                              ◆ {t('common.peak')}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-2xs text-ink-2">
                          {b.plot.name} · {ha(b.ha)}
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <PayChip pay={b.pay} />
                      </div>
                      <StatusTag status={b.status} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          <CropCycle />
          <Panel label={t('fd.pay_label')} title={t('pay.harvest')}>
            <div className="space-y-3">
              <div>
                <div className="font-mono text-3xl font-medium text-clay">{rp(outstanding)}</div>
                <div className="label-mono mt-1">{t('fd.pay_total_sub')}</div>
              </div>
              <p className="font-sans text-sm text-ink-2">{t('fd.pay_desc')}</p>
              <Button variant="outline" className="w-full" onClick={() => go('bukutani')}>
                {t('fd.pay_cta')}
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

const STAGES = ['land_prep', 'planting', 'mid', 'harvest']

function CropCycle() {
  const t = useT()
  const activeIdx = 3 // demo: village is mid-harvest of MT-1
  return (
    <Panel label={t('fd.crop_label')} title={t('fd.crop_title')}>
      <ol className="space-y-2">
        {STAGES.map((key, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          const label = key === 'mid' ? t('stage.mid') : catLabel(t, key)
          return (
            <li key={key} className="flex items-center gap-3">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm border font-mono text-2xs ${
                  active
                    ? 'border-clay bg-clay text-paper'
                    : done
                      ? 'border-pine bg-pine text-paper'
                      : 'border-line text-sage'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`font-sans text-sm ${active ? 'font-semibold text-ink' : done ? 'text-ink-2' : 'text-sage'}`}
              >
                {label}
              </span>
              {active && (
                <span className="ml-auto font-mono text-2xs uppercase tracking-wide text-clay">
                  {t('common.ongoing')}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
