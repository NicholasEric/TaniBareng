import { Wrench } from 'lucide-react'
import { useStore, useDerived } from '../../store/store.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Metric, MachineStatusTag, Button } from '../../components/ui.jsx'
import { catLabel } from '../../lib/domain.js'

const NEXT_STATUS = { available: 'in_field', in_field: 'maintenance', maintenance: 'available' }

export default function Fleet() {
  const { state, dispatch } = useStore()
  const { machineLoad, fleetUtil } = useDerived()
  const t = useT()

  const byStatus = (s) => state.machines.filter((m) => m.status === s).length

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('fl.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('fl.title')}</h1>
        <p className="mt-1 font-sans text-sm text-ink-2">{t('fl.sub', { n: state.machines.length })}</p>
      </header>

      <div className="grid grid-cols-2 divide-x divide-line border border-line sm:grid-cols-4">
        <Metric label={t('fl.m_avail')} value={byStatus('available')} sub={t('fl.m_avail_sub')} tone="pine" />
        <Metric label={t('fl.m_field')} value={byStatus('in_field')} sub={t('fl.m_field_sub')} accent />
        <Metric label={t('fl.m_maint')} value={byStatus('maintenance')} sub={t('fl.m_maint_sub')} />
        <Metric label={t('fl.m_util')} value={`${fleetUtil}%`} sub={t('fl.m_util_sub')} tone="pine" />
      </div>

      <Panel label={t('fl.list_label')} title={t('fl.list_title')} bodyClass="">
        <div className="hidden grid-cols-[1fr_1fr_5rem_1fr_9rem] gap-3 border-b border-line px-4 py-2 lg:grid">
          <span className="label-mono">{t('fl.col_machine')}</span>
          <span className="label-mono">{t('fl.col_type')}</span>
          <span className="label-mono text-right">{t('fl.col_power')}</span>
          <span className="label-mono">{t('fl.col_util')}</span>
          <span className="label-mono">{t('fl.col_status')}</span>
        </div>
        <ul className="divide-y divide-line">
          {machineLoad.map((m) => (
            <li
              key={m.id}
              className="grid grid-cols-2 items-center gap-3 px-4 py-3 lg:grid-cols-[1fr_1fr_5rem_1fr_9rem]"
            >
              <div>
                <div className="font-sans text-sm font-semibold text-ink">{m.name}</div>
                <div className="font-mono text-2xs text-sage">{m.id}</div>
              </div>
              <div className="hidden lg:block">
                <div className="font-sans text-sm text-ink-2">{m.type}</div>
                <div className="font-mono text-2xs text-sage">{catLabel(t, m.category)} · {t('fl.jobs', { n: m.jobs })}</div>
              </div>
              <div className="hidden text-right font-mono text-sm text-ink-2 lg:block">
                {m.hp ? `${m.hp} HP` : '—'}
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-paper-3">
                  <div className={`h-full ${m.status === 'maintenance' ? 'bg-sage-2' : 'bg-pine'}`} style={{ width: `${m.util}%` }} />
                </div>
                <span className="font-mono text-2xs text-ink-2">{m.util}%</span>
              </div>
              <div className="flex items-center justify-end gap-2 lg:justify-between">
                <MachineStatusTag status={m.status} />
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('fl.col_status')}
                  onClick={() =>
                    dispatch({ type: 'SET_MACHINE_STATUS', payload: { id: m.id, status: NEXT_STATUS[m.status] } })
                  }
                >
                  <Wrench className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <p className="font-mono text-2xs text-sage">{t('fl.tip')}</p>
    </div>
  )
}
