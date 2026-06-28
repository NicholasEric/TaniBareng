import { useOperatorJobs } from '../../store/store.jsx'
import { ME_OPERATOR } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { Panel, StatusTag, Dot } from '../../components/ui.jsx'
import { ha as fmtHa, fmtDate, addDays, weekStart, dowName, parseDate } from '../../lib/format.js'
import { TODAY, serviceName } from '../../lib/domain.js'

export default function OperatorSchedule() {
  const jobs = useOperatorJobs(ME_OPERATOR)
  const t = useT()
  const start = weekStart(TODAY)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  const byDay = (d) =>
    jobs.filter((j) => j.date === d).sort((a, b) => a.service.localeCompare(b.service))

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('os.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('os.title')}</h1>
        <p className="mt-1 font-mono text-sm text-ink-2">
          {fmtDate(days[0])} – {fmtDate(days[6], { long: true })}
        </p>
      </header>

      {/* desktop: 7-column week grid sharing hairlines */}
      <div className="hidden grid-cols-7 border border-line md:grid">
        {days.map((d) => {
          const isToday = d === TODAY
          return (
            <div key={d} className={`border-r border-line last:border-r-0 ${isToday ? 'bg-paper-2' : ''}`}>
              <div className={`border-b border-line px-2 py-2 ${isToday ? 'bg-pine text-paper' : ''}`}>
                <div className="font-mono text-2xs uppercase tracking-wide">{dowName(parseDate(d).getDay())}</div>
                <div className="font-mono text-lg font-medium">{parseDate(d).getDate()}</div>
              </div>
              <div className="min-h-[8rem] space-y-1 p-1.5">
                {byDay(d).map((j) => (
                  <div key={j.id} className="rounded-sm border border-line bg-paper p-1.5">
                    <div className="font-sans text-2xs font-semibold leading-tight text-ink">{serviceName(t, j.service)}</div>
                    <div className="font-mono text-[10px] text-ink-2">{j.plot.name}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <Dot tone="pine" />
                      <span className="font-mono text-[10px] text-sage">{fmtHa(j.ha)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* mobile: agenda list */}
      <div className="space-y-3 md:hidden">
        {days
          .filter((d) => byDay(d).length > 0)
          .map((d) => (
            <Panel key={d} label={fmtDate(d, { long: true })} title={d === TODAY ? t('os.today') : ''} bodyClass="">
              <ul className="divide-y divide-line">
                {byDay(d).map((j) => (
                  <li key={j.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="font-sans text-sm font-medium text-ink">{serviceName(t, j.service)}</div>
                      <div className="font-mono text-2xs text-ink-2">{j.plot.name} · {fmtHa(j.ha)}</div>
                    </div>
                    <StatusTag status={j.status} />
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        {days.every((d) => byDay(d).length === 0) && (
          <Panel><p className="py-6 text-center font-sans text-sm text-sage">{t('os.empty')}</p></Panel>
        )}
      </div>
    </div>
  )
}
