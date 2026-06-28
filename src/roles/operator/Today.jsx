import { useState } from 'react'
import {
  ChevronLeft,
  Play,
  CircleCheck,
  Navigation,
  MapPin,
  Clock,
  Fuel,
  Tractor,
  ListChecks,
} from 'lucide-react'
import { useStore, useOperatorJobs } from '../../store/store.jsx'
import { ME_OPERATOR } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Button, StatusTag, EmptyState, TextInput, Field, WarnStrip } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate, num } from '../../lib/format.js'
import { catLabel, serviceName, TODAY } from '../../lib/domain.js'

// rough estimate: ~0.6 ha/hour effective across services
function estHours(haVal) {
  return Math.max(1, Math.round((haVal / 0.6) * 10) / 10)
}

export default function OperatorToday({ focusId }) {
  const { state } = useStore()
  const t = useT()
  const me = state.operators.find((o) => o.id === ME_OPERATOR)
  const jobs = useOperatorJobs(ME_OPERATOR)
  const [openId, setOpenId] = useState(focusId || null)

  const open = jobs.find((j) => j.id === openId)
  if (open) return <JobDetail job={open} onBack={() => setOpenId(null)} />

  const queue = jobs
    .filter((j) => ['dispatched', 'in_progress', 'confirmed'].includes(j.status))
    .sort((a, b) => a.date.localeCompare(b.date))
  const todayJobs = queue.filter((j) => j.date === TODAY)
  const later = queue.filter((j) => j.date !== TODAY)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{t('ot.kicker', { name: me.name })}</div>
          <h1 className="font-display text-3xl text-ink">{t('ot.title')}</h1>
          <p className="mt-1 font-mono text-sm text-ink-2">{fmtDate(TODAY, { long: true })}</p>
        </div>
        <div className="rounded-sm border border-line px-3 py-2 text-right">
          <div className="label-mono">{t('ot.queue')}</div>
          <div className="font-mono text-2xl font-medium text-pine">{queue.length}</div>
        </div>
      </header>

      {todayJobs.some((j) => j.status === 'in_progress') && (
        <WarnStrip icon={Clock}>{t('ot.inprogress_warn')}</WarnStrip>
      )}

      <Panel label={t('ot.today_label')} title={t('ot.today_title', { n: todayJobs.length })} bodyClass="">
        {todayJobs.length === 0 ? (
          <EmptyState icon={ListChecks} title={t('ot.empty_title')}>
            {t('ot.empty_body')}
          </EmptyState>
        ) : (
          <ol className="divide-y divide-line">
            {todayJobs.map((j, i) => (
              <JobRow key={j.id} job={j} index={i + 1} onOpen={() => setOpenId(j.id)} />
            ))}
          </ol>
        )}
      </Panel>

      {later.length > 0 && (
        <Panel label={t('ot.later_label')} title={t('ot.later_title')} bodyClass="">
          <ol className="divide-y divide-line">
            {later.map((j) => (
              <JobRow key={j.id} job={j} onOpen={() => setOpenId(j.id)} />
            ))}
          </ol>
        </Panel>
      )}
    </div>
  )
}

function JobRow({ job: j, index, onOpen }) {
  const t = useT()
  return (
    <li>
      <button onClick={onOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2">
        {index != null ? (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-pine font-mono text-sm text-paper">
            {index}
          </span>
        ) : (
          <span className="w-16 shrink-0 font-mono text-sm font-medium text-ink">{fmtDate(j.date)}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-ink">{serviceName(t, j.service)}</span>
            <span className="font-mono text-2xs text-sage">{catLabel(t, j.service_.category)}</span>
          </div>
          <div className="font-mono text-2xs text-ink-2">
            {j.plot.name} · {fmtHa(j.ha)} · {j.plot.owner}
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <div className="font-mono text-2xs text-sage">{t('ot.est', { h: num(estHours(j.ha)) })}</div>
          {j.machine_ && <div className="font-mono text-2xs text-ink-2">{j.machine_.id}</div>}
        </div>
        <StatusTag status={j.status} />
      </button>
    </li>
  )
}

function JobDetail({ job: j, onBack }) {
  const { dispatch } = useStore()
  const t = useT()
  const [actualHa, setActualHa] = useState(j.log.actualHa ?? j.ha)
  const [fuel, setFuel] = useState(j.log.fuelLiters ?? '')
  const [notes, setNotes] = useState(j.log.notes ?? '')

  const canStart = j.status === 'dispatched' || j.status === 'confirmed'
  const canComplete = j.status === 'in_progress'

  const start = () => dispatch({ type: 'START_JOB', payload: { id: j.id, at: TODAY } })
  const complete = () =>
    dispatch({
      type: 'COMPLETE_JOB',
      payload: { id: j.id, actualHa: Number(actualHa), fuelLiters: Number(fuel) || null, notes, at: TODAY },
    })

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 font-sans text-sm text-ink-2 hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t('ot.back')}
      </button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label-mono">{j.id}</div>
          <h1 className="font-display text-3xl text-ink">{serviceName(t, j.service)}</h1>
          <p className="mt-1 font-mono text-sm text-ink-2">{j.plot.name} · {fmtDate(j.date, { long: true })}</p>
        </div>
        <StatusTag status={j.status} />
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel label={t('ot.loc_label')} title={t('ot.loc_title')}>
          <dl className="space-y-3">
            <Info icon={MapPin} label={t('ot.info_plot')} value={`${j.plot.name} · ${j.plot.blok}`} />
            <Info icon={Tractor} label={t('ot.info_machine')} value={j.machine_ ? `${j.machine_.name} (${j.machine_.id})` : '–'} />
            <Info icon={ListChecks} label={t('ot.info_target')} value={fmtHa(j.ha)} />
            <Info icon={Clock} label={t('ot.info_est')} value={t('ot.est', { h: num(estHours(j.ha)) })} />
            <Info icon={null} label={t('ot.info_farmer')} value={`${j.plot.owner} · ${j.plot.crop}`} />
          </dl>
          <Button variant="outline" className="mt-4 w-full" onClick={() => alert(t('ot.nav_alert', { plot: j.plot.name }))}>
            <Navigation className="h-4 w-4" /> {t('ot.nav_btn')}
          </Button>
        </Panel>

        <Panel label={t('ot.log_label')} title={t('ot.log_title')}>
          {j.status === 'completed' || j.status === 'invoiced' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-l-2 border-ok bg-paper-2 px-3 py-2">
                <CircleCheck className="h-4 w-4 text-ok" />
                <span className="font-sans text-sm text-ink">{t('ot.done_msg')}</span>
              </div>
              <Info icon={ListChecks} label={t('ot.l_area')} value={fmtHa(j.log.actualHa)} />
              <Info icon={Fuel} label={t('ot.l_fuel')} value={j.log.fuelLiters ? `${j.log.fuelLiters} L` : '–'} />
              {j.log.notes && <p className="font-sans text-sm text-ink-2">“{j.log.notes}”</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label={t('ot.f_actual')}>
                <TextInput
                  type="number"
                  step="0.1"
                  value={actualHa}
                  onChange={(e) => setActualHa(e.target.value)}
                  disabled={!canComplete}
                />
              </Field>
              <Field label={t('ot.f_fuel')}>
                <TextInput
                  type="number"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  placeholder="38"
                  disabled={!canComplete}
                />
              </Field>
              <Field label={t('ot.f_notes')}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canComplete}
                  rows={2}
                  placeholder={t('ot.notes_ph')}
                  className="w-full rounded-sm border border-line-2 bg-paper px-3 py-2 font-sans text-sm text-ink focus:border-pine disabled:opacity-50"
                />
              </Field>

              {canStart && (
                <Button variant="default" size="lg" className="w-full" onClick={start}>
                  <Play className="h-4 w-4" /> {t('ot.start_btn')}
                </Button>
              )}
              {canComplete && (
                <Button variant="primary" size="lg" className="w-full" onClick={complete}>
                  <CircleCheck className="h-4 w-4" /> {t('ot.complete_btn')}
                </Button>
              )}
              {!canStart && !canComplete && (
                <p className="font-sans text-sm text-sage">{t('ot.wait_confirm')}</p>
              )}
            </div>
          )}
        </Panel>
      </div>

      <Panel label={t('ot.wage_label')} title={t('ot.wage_title')}>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-3xl font-medium text-pine">{rp(j.price.operatorWage)}</div>
            <div className="label-mono mt-1">{t('ot.wage_pct')}</div>
          </div>
          <div className="max-w-[10rem] text-right font-mono text-2xs text-sage">{t('ot.wage_when')}</div>
        </div>
      </Panel>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-sage" /> : <span className="h-4 w-4 shrink-0" />}
      <span className="label-mono w-24 shrink-0">{label}</span>
      <span className="flex-1 font-sans text-sm font-medium text-ink">{value}</span>
    </div>
  )
}
