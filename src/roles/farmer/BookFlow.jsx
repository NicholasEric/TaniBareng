import { useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  Tractor,
  Sprout,
  SprayCan,
  Wheat,
  MapPin,
  CalendarDays,
  CircleCheck,
} from 'lucide-react'
import { useStore, useDerived } from '../../store/store.jsx'
import { useNav } from '../../App.jsx'
import { useT } from '../../i18n/i18n.jsx'
import { SERVICES } from '../../data/seed.js'
import { Panel, Button, WarnStrip, PayChip } from '../../components/ui.jsx'
import { rp, ha as fmtHa, fmtDate, addDays, parseDate, dowName, monName, num } from '../../lib/format.js'
import {
  seasonFor,
  serviceOf,
  serviceName,
  serviceDesc,
  catLabel,
  seasonNote,
  contentionOn,
  TODAY,
} from '../../lib/domain.js'

const SERVICE_ICON = { olah_lahan: Tractor, tanam: Sprout, semprot: SprayCan, panen: Wheat }
const STEP_KEYS = ['bk.step_service', 'bk.step_plot', 'bk.step_date', 'bk.step_price', 'bk.step_confirm']

export default function BookFlow() {
  const { state, dispatch } = useStore()
  const { enriched } = useDerived()
  const { go } = useNav()
  const t = useT()

  const [step, setStep] = useState(0)
  const [service, setService] = useState(null)
  const [plotId, setPlotId] = useState(null)
  const [date, setDate] = useState(null)
  const [pay, setPay] = useState('now')

  const plot = state.plots.find((p) => p.id === plotId)
  const svc = service ? serviceOf(service) : null
  const price = svc && plot ? priceCalc(svc, plot.ha) : null

  const canNext =
    (step === 0 && service) ||
    (step === 1 && plotId) ||
    (step === 2 && date) ||
    step === 3 ||
    step === 4

  const next = () => setStep((s) => Math.min(s + 1, 4))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const confirm = () => {
    dispatch({ type: 'CREATE_BOOKING', payload: { plotId, service, ha: plot.ha, date, pay } })
    const newId = `BK-${state.seq}`
    go('bookings', { id: newId })
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="label-mono">{t('bk.kicker')}</div>
        <h1 className="font-display text-3xl text-ink">{t('bk.title')}</h1>
      </header>

      <Stepper step={step} onJump={(i) => i < step && setStep(i)} />

      <Panel className="min-h-[22rem]" bodyClass="p-4 sm:p-6">
        {step === 0 && <StepService service={service} onPick={setService} />}
        {step === 1 && <StepPlot plots={state.plots} plotId={plotId} onPick={setPlotId} />}
        {step === 2 && (
          <StepDate
            service={service}
            date={date}
            onPick={setDate}
            machines={state.machines}
            operators={state.operators}
            bookings={state.bookings}
          />
        )}
        {step === 3 && (
          <StepPrice svc={svc} plot={plot} price={price} pay={pay} onPay={setPay} />
        )}
        {step === 4 && <StepConfirm svc={svc} plot={plot} price={price} pay={pay} date={date} service={service} />}
      </Panel>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4" /> {t('common.back')}
        </Button>
        {step < 4 ? (
          <Button variant="default" onClick={next} disabled={!canNext}>
            {t('common.next')} <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={confirm}>
            <Check className="h-4 w-4" /> {t('bk.confirm_btn')}
          </Button>
        )}
      </div>
    </div>
  )
}

function priceCalc(svc, ha) {
  const subtotal = Math.round(svc.pricePerHa * ha)
  return { pricePerHa: svc.pricePerHa, subtotal, mobilization: 75_000, total: subtotal + 75_000 }
}

function Stepper({ step, onJump }) {
  const t = useT()
  return (
    <ol className="flex items-center border border-line bg-paper" aria-label={t('bk.aria_steps')}>
      {STEP_KEYS.map((key, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={key} className="flex flex-1 items-center">
            <button
              onClick={() => onJump(i)}
              disabled={i >= step}
              className={`flex w-full items-center gap-2 px-2 py-2.5 sm:px-3 ${
                i < step ? 'cursor-pointer hover:bg-paper-2' : 'cursor-default'
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm border font-mono text-2xs ${
                  active
                    ? 'border-clay bg-clay text-paper'
                    : done
                      ? 'border-pine bg-pine text-paper'
                      : 'border-line-2 text-sage'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`hidden font-mono text-2xs uppercase tracking-wide sm:inline ${
                  active ? 'text-ink' : done ? 'text-ink-2' : 'text-sage'
                }`}
              >
                {t(key)}
              </span>
            </button>
            {i < STEP_KEYS.length - 1 && <span className="h-px w-2 bg-line sm:w-3" />}
          </li>
        )
      })}
    </ol>
  )
}

// ── Step 1: service ──────────────────────────────────────────────────────────
function StepService({ service, onPick }) {
  const t = useT()
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{t('bk.s1_title')}</h2>
      <p className="mb-4 mt-0.5 font-sans text-sm text-ink-2">{t('bk.s1_sub')}</p>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = SERVICE_ICON[s.key]
          const active = service === s.key
          const season = seasonFor(s.key, TODAY)
          return (
            <button
              key={s.key}
              onClick={() => onPick(s.key)}
              className={`flex items-start gap-3 bg-paper p-4 text-left transition-colors hover:bg-paper-2 ${
                active ? 'ring-2 ring-inset ring-pine' : ''
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm ${active ? 'bg-pine text-paper' : 'bg-paper-3 text-pine'}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-ink">{serviceName(t, s.key)}</span>
                  {season.inSeason ? (
                    <span className="font-mono text-2xs uppercase tracking-wide text-pine">{t('common.in_season')}</span>
                  ) : (
                    <span className="font-mono text-2xs uppercase tracking-wide text-sage">{t('common.out_season')}</span>
                  )}
                </div>
                <div className="font-mono text-2xs text-sage">{catLabel(t, s.category)}</div>
                <p className="mt-1 font-sans text-sm text-ink-2">{serviceDesc(t, s.key)}</p>
                <div className="mt-2 font-mono text-sm font-medium text-ink">
                  {rp(s.pricePerHa)} <span className="text-2xs text-sage">{t('common.per_ha')}</span>
                </div>
              </div>
              {active && <CircleCheck className="h-5 w-5 shrink-0 text-pine" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 2: plot ─────────────────────────────────────────────────────────────
function StepPlot({ plots, plotId, onPick }) {
  const t = useT()
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{t('bk.s2_title')}</h2>
      <p className="mb-4 mt-0.5 font-sans text-sm text-ink-2">{t('bk.s2_sub')}</p>
      <ul className="divide-y divide-line border border-line">
        {plots.map((p) => {
          const active = plotId === p.id
          return (
            <li key={p.id}>
              <button
                onClick={() => onPick(p.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-2 ${active ? 'bg-paper-2' : ''}`}
              >
                <MapPin className={`h-4 w-4 shrink-0 ${active ? 'text-pine' : 'text-sage'}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-sans font-medium text-ink">{p.name}</div>
                  <div className="font-mono text-2xs text-ink-2">
                    {p.id} · {p.owner} · {p.crop}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium text-ink">{fmtHa(p.ha)}</div>
                </div>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-pine bg-pine' : 'border-line-2'}`}
                >
                  {active && <Check className="h-3 w-3 text-paper" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Step 3: date with availability + peak flags ──────────────────────────────
function StepDate({ service, date, onPick, machines, operators, bookings }) {
  const t = useT()
  const cat = serviceOf(service).category
  const machAvail = machines.filter((m) => m.category === cat && m.status !== 'maintenance').length
  const opAvail = operators.filter((o) => o.skills.includes(cat)).length

  const days = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i))

  return (
    <div>
      <h2 className="font-display text-xl text-ink">{t('bk.s3_title')}</h2>
      <p className="mb-4 mt-0.5 font-sans text-sm text-ink-2">
        {t('bk.s3_sub', { cat: catLabel(t, cat), m: machAvail, o: opAvail })}
      </p>

      <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4 md:grid-cols-7">
        {days.map((d) => {
          const dt = parseDate(d)
          const season = seasonFor(service, d)
          const used = contentionOn(bookings, service, d)
          const full = used >= machAvail
          const active = date === d
          const disabled = !season.inSeason
          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => onPick(d)}
              className={`relative flex flex-col gap-1 bg-paper p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? 'ring-2 ring-inset ring-pine' : 'hover:bg-paper-2'
              }`}
            >
              <span className="font-mono text-2xs text-sage">
                {dowName(dt.getDay())} · {monName(dt.getMonth())}
              </span>
              <span className="font-mono text-base font-medium text-ink">{dt.getDate()}</span>
              <span className="mt-0.5 flex items-center gap-1">
                {season.peak ? (
                  <span className="font-mono text-2xs uppercase text-clay">◆ {t('common.peak')}</span>
                ) : season.inSeason ? (
                  <span className="font-mono text-2xs text-pine">{t('common.season')}</span>
                ) : (
                  <span className="font-mono text-2xs text-sage">{t('common.closed')}</span>
                )}
              </span>
              {season.inSeason && (
                <span className={`font-mono text-2xs ${full ? 'text-clay' : 'text-sage'}`}>
                  {full ? t('common.full') : t('common.slot', { n: machAvail - used })}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {date && seasonFor(service, date).peak && (
        <div className="mt-4">
          <WarnStrip icon={TriangleAlert}>
            {t('bk.peak_warn', { date: fmtDate(date, { long: true }), note: seasonNote(t, cat) })}
          </WarnStrip>
        </div>
      )}
      {date && contentionOn(bookings, service, date) >= machAvail && (
        <div className="mt-3">
          <WarnStrip icon={TriangleAlert}>
            {t('bk.full_warn', { n: machAvail, cat: catLabel(t, cat) })}
          </WarnStrip>
        </div>
      )}
    </div>
  )
}

// ── Step 4: price + pay mode ─────────────────────────────────────────────────
function StepPrice({ svc, plot, price, pay, onPay }) {
  const t = useT()
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{t('bk.s4_title')}</h2>
      <p className="mb-4 mt-0.5 font-sans text-sm text-ink-2">
        {t('bk.s4_sub', { svc: serviceName(t, svc.key), plot: plot.name, ha: fmtHa(plot.ha) })}
      </p>

      <div className="border border-line">
        <Row
          label={t('bk.row_service', { svc: serviceName(t, svc.key), per: rp(price.pricePerHa), ha: num(plot.ha) })}
          value={rp(price.subtotal)}
        />
        <Row label={t('bk.row_mob')} value={rp(price.mobilization)} />
        <div className="flex items-center justify-between border-t-2 border-ink/15 bg-paper-2 px-4 py-3">
          <span className="font-sans font-semibold text-ink">{t('bk.total')}</span>
          <span className="font-mono text-xl font-medium text-ink">{rp(price.total)}</span>
        </div>
      </div>

      <h3 className="mb-2 mt-5 label-mono">{t('bk.pay_method')}</h3>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
        <PayOption
          active={pay === 'now'}
          onClick={() => onPay('now')}
          title={t('pay.now')}
          sub={t('bk.pay_now_sub')}
          detail={t('bk.pay_now_detail')}
        />
        <PayOption
          active={pay === 'harvest'}
          onClick={() => onPay('harvest')}
          title={t('pay.harvest')}
          sub={t('bk.pay_harvest_sub')}
          detail={t('bk.pay_harvest_detail')}
          accent
        />
      </div>
    </div>
  )
}

function PayOption({ active, onClick, title, sub, detail, accent }) {
  const t = useT()
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 bg-paper p-4 text-left transition-colors hover:bg-paper-2 ${
        active ? `ring-2 ring-inset ${accent ? 'ring-clay' : 'ring-pine'}` : ''
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          active ? (accent ? 'border-clay bg-clay' : 'border-pine bg-pine') : 'border-line-2'
        }`}
      >
        {active && <Check className="h-3 w-3 text-paper" />}
      </span>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-ink">{title}</span>
          {accent && (
            <span className="font-mono text-2xs uppercase tracking-wide text-clay">{t('bk.featured')}</span>
          )}
        </div>
        <div className="font-mono text-2xs text-sage">{sub}</div>
        <p className="mt-1 font-sans text-sm text-ink-2">{detail}</p>
      </div>
    </button>
  )
}

// ── Step 5: confirm ──────────────────────────────────────────────────────────
function StepConfirm({ svc, plot, price, pay, date, service }) {
  const t = useT()
  const season = seasonFor(service, date)
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{t('bk.s5_title')}</h2>
      <p className="mb-4 mt-0.5 font-sans text-sm text-ink-2">{t('bk.s5_sub')}</p>

      <dl className="border border-line">
        <SummaryRow icon={Wheat} label={t('bk.sum_service')} value={serviceName(t, svc.key)} />
        <SummaryRow icon={MapPin} label={t('bk.sum_plot')} value={`${plot.name} · ${fmtHa(plot.ha)} · ${plot.owner}`} />
        <SummaryRow
          icon={CalendarDays}
          label={t('bk.sum_date')}
          value={fmtDate(date, { long: true })}
          flag={season.peak ? t('bk.peak_week') : null}
        />
        <SummaryRow icon={Tractor} label={t('bk.sum_pay')} value={<PayChip pay={pay} />} />
        <div className="flex items-center justify-between bg-paper-2 px-4 py-3">
          <span className="font-sans font-semibold text-ink">{t('bk.sum_total')}</span>
          <span className="font-mono text-xl font-medium text-ink">{rp(price.total)}</span>
        </div>
      </dl>

      <p className="mt-3 font-sans text-sm text-sage">{t('bk.s5_note')}</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0">
      <span className="font-sans text-sm text-ink-2">{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  )
}

function SummaryRow({ icon: Icon, label, value, flag }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-sage" />
      <span className="label-mono w-24 shrink-0">{label}</span>
      <span className="flex-1 font-sans text-sm font-medium text-ink">{value}</span>
      {flag && <span className="font-mono text-2xs uppercase tracking-wide text-clay">◆ {flag}</span>}
    </div>
  )
}
