import { Send, ArrowRight, TriangleAlert } from 'lucide-react'
import { useStore, useDerived } from '../../store/store.jsx'
import { useNav } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, Button, MachineStatusTag, WarnStrip } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate } from '../../lib/format.js'
import { seasonFor, contentionOn, serviceName, TODAY } from '../../lib/domain.js'

export default function AdminDashboard() {
  const { state } = useStore()
  const { enriched, counts, fleetUtil, machineLoad, finance } = useDerived()
  const { go } = useNav()
  const t = useT()

  const unassigned = enriched
    .filter((b) => b.status === 'requested')
    .sort((a, b) => a.date.localeCompare(b.date))

  const conflicts = enriched.filter((b) => {
    if (['completed', 'invoiced'].includes(b.status)) return false
    const cat = b.service_.category
    const machAvail = state.machines.filter((m) => m.category === cat && m.status !== 'maintenance').length
    return (
      contentionOn(state.bookings, b.service, b.date, null) > machAvail ||
      (seasonFor(b.service, b.date).peak && contentionOn(state.bookings, b.service, b.date, b.id) >= 1)
    )
  })

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{t('ad.kicker')}</div>
          <h1 className="font-display text-3xl text-ink">{t('ad.title')}</h1>
          <p className="mt-1 font-mono text-sm text-ink-2">{fmtDate(TODAY, { long: true })}</p>
        </div>
        <Button variant="primary" onClick={() => go('dispatch')}>
          <Send className="h-4 w-4" /> {t('ad.btn_dispatch')}
        </Button>
      </header>

      <div className="grid grid-cols-2 divide-line border border-line sm:grid-cols-4 sm:divide-x">
        <Metric label={t('ad.m_requested')} value={counts.requested} sub={t('ad.m_requested_sub')} accent />
        <Metric label={t('ad.m_active')} value={counts.active} sub={t('ad.m_active_sub')} tone="pine" />
        <Metric label={t('ad.m_completed')} value={counts.completedToday} sub={t('ad.m_completed_sub')} />
        <Metric label={t('ad.m_util')} value={`${fleetUtil}%`} sub={t('ad.m_util_sub')} tone="pine" />
      </div>

      {conflicts.length > 0 && (
        <WarnStrip icon={TriangleAlert}>{t('ad.conflict_warn', { n: conflicts.length })}</WarnStrip>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel
          label={t('ad.fin_label')}
          title={t('ad.fin_title')}
          className="lg:col-span-1"
          right={
            <Button variant="ghost" size="sm" onClick={() => go('finance')}>
              {t('common.detail')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        >
          <div className="space-y-3">
            <FinanceLine label={t('ad.fin_week')} value={rp(finance.revenueThisWeek)} />
            <FinanceLine label={t('ad.fin_season')} value={rp(finance.revenueSeason)} />
            <FinanceLine label={t('ad.fin_recv')} value={rp(finance.receivables)} accent />
            <div className="border-t border-line pt-3">
              <div className="label-mono">{t('ad.fin_fund')}</div>
              <div className="mt-1 font-mono text-2xl font-medium text-pine">{rp(finance.fundBalance)}</div>
            </div>
          </div>
        </Panel>

        <Panel
          label={t('ad.q_label')}
          title={t('ad.q_title')}
          className="lg:col-span-2"
          bodyClass=""
          right={<span className="font-mono text-sm font-medium text-clay">{unassigned.length}</span>}
        >
          {unassigned.length === 0 ? (
            <div className="px-4 py-8 text-center font-sans text-sm text-sage">{t('ad.q_empty')}</div>
          ) : (
            <ul className="divide-y divide-line">
              {unassigned.map((b) => {
                const peak = seasonFor(b.service, b.date).peak
                return (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-16 shrink-0">
                      <div className="font-mono text-sm font-medium text-ink">{fmtDate(b.date)}</div>
                      <div className="font-mono text-2xs text-sage">{b.id}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-medium text-ink">{serviceName(t, b.service)}</span>
                        {peak && <span className="font-mono text-2xs uppercase text-clay">◆ {t('common.peak')}</span>}
                      </div>
                      <div className="font-mono text-2xs text-ink-2">{b.plot.name} · {fmtHa(b.ha)}</div>
                    </div>
                    <Button variant="default" size="sm" onClick={() => go('dispatch', { id: b.id })}>
                      {t('ad.assign_btn')}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        label={t('ad.fleet_label')}
        title={t('ad.fleet_title')}
        bodyClass=""
        right={
          <Button variant="ghost" size="sm" onClick={() => go('fleet')}>
            {t('common.manage')} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      >
        <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {machineLoad.map((m) => (
            <div key={m.id} className="bg-paper px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-sans text-sm font-semibold text-ink">{m.name}</div>
                  <div className="font-mono text-2xs text-sage">{m.id} · {m.type}</div>
                </div>
                <MachineStatusTag status={m.status} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-paper-3">
                  <div className="h-full bg-pine" style={{ width: `${m.util}%` }} />
                </div>
                <span className="font-mono text-2xs text-ink-2">{m.util}%</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function FinanceLine({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-sm text-ink-2">{label}</span>
      <span className={`font-mono text-sm font-medium ${accent ? 'text-clay' : 'text-ink'}`}>{value}</span>
    </div>
  )
}
