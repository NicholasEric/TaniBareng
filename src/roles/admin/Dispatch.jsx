import { useState } from 'react'
import { Send, TriangleAlert, Check, User, Tractor, ChevronRight, Inbox } from 'lucide-react'
import { useStore, useDerived } from '../../store/store.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, Button, StatusTag, PayChip, EmptyState, Dot, WarnStrip, MachineStatusTag } from '../../components/ui.jsx'
import { ha as fmtHa, fmtDate, rp } from '../../lib/format.js'
import { seasonFor, catLabel, serviceName } from '../../lib/domain.js'

export default function Dispatch({ focusId }) {
  const { state, dispatch } = useStore()
  const { enriched } = useDerived()
  const t = useT()
  const [selId, setSelId] = useState(focusId || null)

  const unassigned = enriched
    .filter((b) => b.status === 'requested')
    .sort((a, b) => a.date.localeCompare(b.date))

  const assigned = enriched
    .filter((b) => ['confirmed', 'dispatched', 'in_progress'].includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date))

  const selected = unassigned.find((b) => b.id === selId) || null

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('dp.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('dp.title')}</h1>
        <p className="mt-1 font-sans text-sm text-ink-2">{t('dp.sub')}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          label={t('dp.need_label')}
          title={t('dp.queue_title')}
          bodyClass=""
          right={<span className="font-mono text-sm font-medium text-clay">{unassigned.length}</span>}
        >
          {unassigned.length === 0 ? (
            <EmptyState icon={Inbox} title={t('dp.empty_title')}>{t('dp.empty_body')}</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {unassigned.map((b) => {
                const peak = seasonFor(b.service, b.date).peak
                const active = selId === b.id
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => setSelId(b.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2 ${active ? 'bg-paper-2 ring-2 ring-inset ring-pine' : ''}`}
                    >
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
                      <PayChip pay={b.pay} />
                      <ChevronRight className="h-4 w-4 text-sage" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        {selected ? (
          <AssignPanel
            key={selected.id}
            booking={selected}
            state={state}
            bookings={state.bookings}
            onAssign={(op, machine) => {
              dispatch({ type: 'DISPATCH', payload: { id: selected.id, op, machine } })
              setSelId(null)
            }}
          />
        ) : (
          <Panel label={t('dp.pick_label')} title={t('dp.pick_title')}>
            <EmptyState icon={Send} title={t('dp.pick_empty_title')}>
              {t('dp.pick_empty_body')}
            </EmptyState>
          </Panel>
        )}
      </div>

      <Panel label={t('dp.assigned_label')} title={t('dp.assigned_title')} bodyClass="">
        {assigned.length === 0 ? (
          <EmptyState icon={Tractor} title={t('dp.assigned_empty')} />
        ) : (
          <>
            <div className="hidden grid-cols-[5rem_1fr_1fr_1fr_8rem] gap-3 border-b border-line px-4 py-2 md:grid">
              <span className="label-mono">{t('dp.col_date')}</span>
              <span className="label-mono">{t('dp.col_order')}</span>
              <span className="label-mono">{t('dp.col_operator')}</span>
              <span className="label-mono">{t('dp.col_machine')}</span>
              <span className="label-mono">{t('dp.col_status')}</span>
            </div>
            <ul className="divide-y divide-line">
              {assigned.map((b) => (
                <li
                  key={b.id}
                  className="grid grid-cols-2 gap-2 px-4 py-3 md:grid-cols-[5rem_1fr_1fr_1fr_8rem] md:items-center md:gap-3"
                >
                  <div className="font-mono text-sm text-ink">{fmtDate(b.date)}</div>
                  <div className="min-w-0">
                    <div className="font-sans text-sm font-medium text-ink">{serviceName(t, b.service)}</div>
                    <div className="font-mono text-2xs text-ink-2">{b.plot.name}</div>
                  </div>
                  <div className="font-mono text-2xs text-ink-2 md:text-sm">{b.operator?.name ?? '–'}</div>
                  <div className="font-mono text-2xs text-ink-2 md:text-sm">{b.machine_?.id ?? '–'}</div>
                  <div className="col-span-2 md:col-span-1"><StatusTag status={b.status} /></div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  )
}

function AssignPanel({ booking: b, state, bookings, onAssign }) {
  const t = useT()
  const cat = b.service_.category
  const machines = state.machines.filter((m) => m.category === cat)
  const operators = state.operators.filter((o) => o.skills.includes(cat))

  const [machine, setMachine] = useState(null)
  const [op, setOp] = useState(null)

  const machineBusy = (mid) =>
    bookings.some(
      (x) =>
        x.machine === mid &&
        x.date === b.date &&
        x.id !== b.id &&
        ['dispatched', 'in_progress', 'confirmed'].includes(x.status)
    )
  const opBusy = (oid) =>
    bookings.some(
      (x) =>
        x.op === oid &&
        x.date === b.date &&
        x.id !== b.id &&
        ['dispatched', 'in_progress', 'confirmed'].includes(x.status)
    )

  const peak = seasonFor(b.service, b.date).peak
  const conflict = (machine && machineBusy(machine)) || (op && opBusy(op))

  return (
    <Panel label={t('dp.assign_for', { id: b.id })} title={serviceName(t, b.service)}>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line pb-3 font-mono text-2xs text-ink-2">
        <span>{fmtDate(b.date, { long: true })}</span>
        <span>·</span>
        <span>{b.plot.name} · {fmtHa(b.ha)}</span>
        <span>·</span>
        <span>{rp(b.price.total)}</span>
      </div>

      {peak && (
        <div className="mb-4">
          <WarnStrip icon={TriangleAlert}>{t('dp.peak_warn', { cat: catLabel(t, cat) })}</WarnStrip>
        </div>
      )}

      <div className="mb-4">
        <div className="label-mono mb-2">{t('dp.pick_machine', { cat: catLabel(t, cat) })}</div>
        <div className="space-y-1.5">
          {machines.map((m) => {
            const busy = machineBusy(m.id)
            const maint = m.status === 'maintenance'
            const active = machine === m.id
            return (
              <button
                key={m.id}
                disabled={maint}
                onClick={() => setMachine(m.id)}
                className={`flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors disabled:opacity-40 ${
                  active ? 'border-pine bg-paper-2 ring-1 ring-pine' : 'border-line hover:bg-paper-2'
                }`}
              >
                <Tractor className="h-4 w-4 shrink-0 text-pine" />
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm font-medium text-ink">{m.name}</div>
                  <div className="font-mono text-2xs text-sage">{m.id} · {m.type}</div>
                </div>
                {busy ? (
                  <span className="font-mono text-2xs uppercase text-clay">◆ {t('common.conflict')}</span>
                ) : (
                  <MachineStatusTag status={m.status} />
                )}
                {active && <Check className="h-4 w-4 text-pine" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className="label-mono mb-2">{t('dp.pick_operator')}</div>
        <div className="space-y-1.5">
          {operators.map((o) => {
            const busy = opBusy(o.id)
            const active = op === o.id
            return (
              <button
                key={o.id}
                onClick={() => setOp(o.id)}
                className={`flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors ${
                  active ? 'border-pine bg-paper-2 ring-1 ring-pine' : 'border-line hover:bg-paper-2'
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-paper-3 text-pine">
                  <User className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-sans text-sm font-medium text-ink">{o.name}</div>
                  <div className="font-mono text-2xs text-sage">
                    {o.skills.map((s) => catLabel(t, s)).join(' · ')}
                  </div>
                </div>
                {busy ? (
                  <span className="font-mono text-2xs uppercase text-clay">◆ {t('common.busy_job')}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5"><Dot tone="ok" /><span className="font-mono text-2xs text-sage">{t('common.free')}</span></span>
                )}
                {active && <Check className="h-4 w-4 text-pine" />}
              </button>
            )
          })}
        </div>
      </div>

      {conflict && (
        <div className="mb-4">
          <WarnStrip icon={TriangleAlert}>{t('dp.conflict_warn', { date: fmtDate(b.date) })}</WarnStrip>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!machine || !op}
        onClick={() => onAssign(op, machine)}
      >
        <Send className="h-4 w-4" /> {t('dp.send_btn')}
      </Button>
    </Panel>
  )
}
