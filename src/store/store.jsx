import { createContext, useContext, useMemo, useReducer, useEffect } from 'react'
import { freshState, priceFor, completionEffects, SERVICES, FUND_SHARE, LEDGER } from '../data/seed.js'
import { STATUS_ORDER, serviceOf } from '../lib/domain.js'
import { sameWeek } from '../lib/format.js'

const StoreCtx = createContext(null)
// v2: shape gained landowners, harvestRecords, ledger — start fresh on upgrade.
const LS_KEY = 'tanibareng.v2'

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore corrupt state */
  }
  return freshState()
}

// ── Reducer: the only place state mutates ────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return freshState()

    case 'CREATE_BOOKING': {
      const { plotId, service, ha, date, pay } = action.payload
      const id = `BK-${state.seq}`
      const booking = {
        id,
        plotId,
        service,
        ha,
        date,
        pay,
        status: 'requested',
        op: null,
        machine: null,
        price: priceFor(service, ha),
        paid: false,
        createdAt: date,
        log: { actualHa: null, fuelLiters: null, notes: '', startedAt: null, completedAt: null },
      }
      return { ...state, bookings: [booking, ...state.bookings], seq: state.seq + 1 }
    }

    case 'DISPATCH': {
      // Admin assigns operator + machine → booking advances, machine goes in-field.
      const { id, op, machine } = action.payload
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, op, machine, status: 'dispatched' } : b
        ),
        machines: state.machines.map((m) =>
          m.id === machine && m.status === 'available' ? { ...m, status: 'in_field' } : m
        ),
      }
    }

    case 'CONFIRM': {
      const { id } = action.payload
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id && b.status === 'requested' ? { ...b, status: 'confirmed' } : b
        ),
      }
    }

    case 'START_JOB': {
      const { id } = action.payload
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id
            ? { ...b, status: 'in_progress', log: { ...b.log, startedAt: action.payload.at } }
            : b
        ),
      }
    }

    case 'COMPLETE_JOB': {
      // Operator logs actuals → completed. Frees the machine back to available,
      // then cascades the financial effects: harvest split income (farmer +
      // landowner) and, for pay-at-harvest, the machinery debt incurred.
      const { id, actualHa, fuelLiters, notes, at } = action.payload
      const booking = state.bookings.find((b) => b.id === id)
      if (!booking || booking.status === 'completed' || booking.status === 'invoiced') return state
      const completed = {
        ...booking,
        status: 'completed',
        log: { ...booking.log, actualHa, fuelLiters, notes, completedAt: at },
      }
      const plot = state.plots.find((p) => p.id === booking.plotId)
      const { entries, harvestRecord, nextSeq } = completionEffects(completed, plot, state.ledgerSeq)
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === id ? completed : b)),
        machines: state.machines.map((m) =>
          m.id === booking.machine && m.status === 'in_field' ? { ...m, status: 'available' } : m
        ),
        ledger: [...state.ledger, ...entries],
        harvestRecords: harvestRecord ? [...state.harvestRecords, harvestRecord] : state.harvestRecords,
        ledgerSeq: nextSeq,
      }
    }

    case 'INVOICE': {
      const { id } = action.payload
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id && b.status === 'completed' ? { ...b, status: 'invoiced' } : b
        ),
      }
    }

    case 'PAY': {
      // Farmer settles a pay-at-harvest machinery debt → cash out of the Buku
      // Tani (a MACHINERY_DEBT_PAID ledger entry) and clears admin receivables.
      const { id, at } = action.payload
      const booking = state.bookings.find((b) => b.id === id)
      if (!booking || booking.paid) return state
      const plot = state.plots.find((p) => p.id === booking.plotId)
      const entry = {
        id: `LG-${state.ledgerSeq}`,
        order: state.ledgerSeq,
        date: at || booking.log.completedAt || booking.date,
        type: LEDGER.MACHINERY_DEBT_PAID,
        role: 'farmer',
        party: plot.penggarap,
        bookingId: booking.id,
        plotId: booking.plotId,
        amount: -booking.price.total, // cash out
        cash: true,
        service: booking.service,
        descKey: 'ledger.desc_debt_paid',
        descVars: { service: booking.service },
      }
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === id ? { ...b, paid: true } : b)),
        ledger: [...state.ledger, entry],
        ledgerSeq: state.ledgerSeq + 1,
      }
    }

    case 'SET_MACHINE_STATUS': {
      const { id, status } = action.payload
      return {
        ...state,
        machines: state.machines.map((m) => (m.id === id ? { ...m, status } : m)),
      }
    }

    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    } catch {
      /* quota / private mode — demo still works in-memory */
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// ── Lookups ──────────────────────────────────────────────────────────────────
export function usePlot(id) {
  const { state } = useStore()
  return state.plots.find((p) => p.id === id)
}
export function useOperator(id) {
  const { state } = useStore()
  return state.operators.find((o) => o.id === id)
}
export function useMachine(id) {
  const { state } = useStore()
  return state.machines.find((m) => m.id === id)
}

// ── Derived selectors (everything computed, so numbers always reconcile) ──────
export function useDerived() {
  const { state } = useStore()
  return useMemo(() => {
    const { bookings, machines, operators, fund, plots, ledger } = state

    const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]))
    const plotMap = byId(plots)
    const opMap = byId(operators)
    const machMap = byId(machines)

    const enrich = (b) => ({
      ...b,
      plot: plotMap[b.plotId],
      operator: b.op ? opMap[b.op] : null,
      machine_: b.machine ? machMap[b.machine] : null,
      service_: serviceOf(b.service),
    })
    const enriched = bookings.map(enrich)

    const isActive = (b) => ['confirmed', 'dispatched', 'in_progress'].includes(b.status)
    const isDone = (b) => ['completed', 'invoiced'].includes(b.status)

    // Ops dashboard counts
    const counts = {
      requested: bookings.filter((b) => b.status === 'requested').length,
      active: bookings.filter(isActive).length,
      completedToday: enriched.filter(
        (b) => isDone(b) && b.log.completedAt && sameWeek(b.log.completedAt, state._today || '2026-06-28')
      ).length,
    }

    // Fleet utilization: share of machines currently in-field, plus per-machine
    // load from active/recent bookings.
    const inField = machines.filter((m) => m.status === 'in_field').length
    const operable = machines.filter((m) => m.status !== 'maintenance').length
    const fleetUtil = operable ? Math.round((inField / operable) * 100) : 0

    const machineLoad = machines.map((m) => {
      const jobs = enriched.filter((b) => b.machine === m.id)
      const activeJobs = jobs.filter((b) => isActive(b) || b.status === 'requested')
      // crude utilization proxy: capped by job count this season
      const util =
        m.status === 'maintenance'
          ? 0
          : Math.min(100, Math.round((jobs.length / 4) * 100) + (m.status === 'in_field' ? 15 : 0))
      return { ...m, jobs: jobs.length, activeJobs: activeJobs.length, util }
    })

    // Finance — all derived from bookings
    const realized = enriched.filter(isDone)
    const revenueThisWeek = realized
      .filter((b) => b.log.completedAt && sameWeek(b.log.completedAt, '2026-06-28'))
      .reduce((s, b) => s + b.price.total, 0)
    const revenueSeason = realized.reduce((s, b) => s + b.price.total, 0)

    // receivables = pay-at-harvest bookings not yet paid
    const receivables = enriched
      .filter((b) => b.pay === 'harvest' && !b.paid)
      .reduce((s, b) => s + b.price.total, 0)

    // margin after operator wages, split into fund vs reinvestment
    const operatorCost = realized.reduce((s, b) => s + b.price.operatorWage, 0)
    const margin = revenueSeason - operatorCost
    const fundContribution = Math.round(margin * FUND_SHARE)
    const reinvestContribution = margin - fundContribution
    const fundBalance = fund.openingBalance + fundContribution
    const reinvestBalance = fund.reinvestmentBalance + reinvestContribution

    // Machinery debt actually incurred (service rendered) vs settled, from the
    // ledger. debtOutstanding = collectible-now receivables for the co-op.
    const debtIncurred = ledger
      .filter((e) => e.type === 'MACHINERY_DEBT_INCURRED')
      .reduce((s, e) => s - e.amount, 0)
    const debtPaid = ledger
      .filter((e) => e.type === 'MACHINERY_DEBT_PAID')
      .reduce((s, e) => s - e.amount, 0)
    const debtOutstanding = debtIncurred - debtPaid

    return {
      enriched,
      counts,
      fleetUtil,
      machineLoad,
      finance: {
        revenueThisWeek,
        revenueSeason,
        receivables,
        operatorCost,
        margin,
        fundContribution,
        reinvestContribution,
        fundBalance,
        reinvestBalance,
        debtIncurred,
        debtPaid,
        debtOutstanding,
      },
    }
  }, [state])
}

// Order ledger entries chronologically, ties broken by insertion order.
const byDateOrder = (a, b) => a.date.localeCompare(b.date) || a.order - b.order

// ── Farmer's Buku Tani — running cash ledger + net position ───────────────────
export function useFarmerBook() {
  const { state } = useStore()
  return useMemo(() => {
    const { ledger, bookings, plots } = state
    const plotMap = Object.fromEntries(plots.map((p) => [p.id, p]))

    const entries = ledger.filter((e) => e.role === 'farmer').slice().sort(byDateOrder)
    let saldo = 0
    const rows = entries.map((e) => {
      if (e.cash) saldo += e.amount // only cash events move the running balance
      return { ...e, saldo, plot: plotMap[e.plotId] }
    })

    const income = entries
      .filter((e) => e.type === 'HARVEST_INCOME')
      .reduce((s, e) => s + e.amount, 0)
    const incurred = entries
      .filter((e) => e.type === 'MACHINERY_DEBT_INCURRED')
      .reduce((s, e) => s - e.amount, 0)
    const paid = entries
      .filter((e) => e.type === 'MACHINERY_DEBT_PAID')
      .reduce((s, e) => s - e.amount, 0)

    const outstanding = incurred - paid // debt for services rendered, still owed
    const cash = income - paid // cash actually on hand (== final running saldo)
    const net = income - incurred // net position: invariant to settling debts

    // Outstanding debts the farmer can pay now: pay-at-harvest, service rendered.
    const debts = bookings
      .filter(
        (b) => b.pay === 'harvest' && !b.paid && ['completed', 'invoiced'].includes(b.status)
      )
      .map((b) => ({ ...b, plot: plotMap[b.plotId], service_: serviceOf(b.service) }))
      .sort((a, b) => (a.log.completedAt || a.date).localeCompare(b.log.completedAt || b.date))

    return { rows, income, incurred, paid, outstanding, cash, net, debts }
  }, [state])
}

// ── Landowner's book — portfolio, plot rows, harvest split ledger ─────────────
export function useLandownerBook(landownerId) {
  const { state } = useStore()
  return useMemo(() => {
    const { ledger, harvestRecords, plots, bookings, landowners } = state
    const plotMap = Object.fromEntries(plots.map((p) => [p.id, p]))
    const landowner = landowners.find((l) => l.id === landownerId)
    const myPlots = plots.filter((p) => p.landownerId === landownerId)
    const myPlotIds = new Set(myPlots.map((p) => p.id))

    const entries = ledger
      .filter((e) => e.role === 'landowner' && e.party === landownerId)
      .slice()
      .sort(byDateOrder)
    let saldo = 0
    const rows = entries.map((e) => {
      saldo += e.amount
      return { ...e, saldo, plot: plotMap[e.plotId] }
    })

    const records = harvestRecords
      .filter((h) => myPlotIds.has(h.plotId))
      .map((h) => ({ ...h, plot: plotMap[h.plotId] }))
      .sort(byDateOrder)

    const totalIncome = entries.reduce((s, e) => s + e.amount, 0)
    const totalHa = myPlots.reduce((s, p) => s + p.ha, 0)

    // Per-plot rows: penggarap, split, harvest + farmer-debt health.
    const plotRows = myPlots.map((p) => {
      const plotBookings = bookings.filter((b) => b.plotId === p.id)
      const harvested = plotBookings.some(
        (b) => b.service === 'panen' && ['completed', 'invoiced'].includes(b.status)
      )
      const debtOutstanding = plotBookings
        .filter((b) => b.pay === 'harvest' && !b.paid && ['completed', 'invoiced'].includes(b.status))
        .reduce((s, b) => s + b.price.total, 0)
      const activeHarvest = plotBookings.find(
        (b) => b.service === 'panen' && !['completed', 'invoiced'].includes(b.status)
      )
      const record = records.find((h) => h.plotId === p.id)
      return {
        ...p,
        harvested,
        activeHarvest: activeHarvest || null,
        debtOutstanding,
        debtCleared: debtOutstanding === 0,
        record: record || null,
      }
    })

    return { landowner, myPlots, rows, records, totalIncome, totalHa, plotCount: myPlots.length, plotRows }
  }, [state, landownerId])
}

// Bookings assigned to one operator
export function useOperatorJobs(opId) {
  const { enriched } = useDerived()
  return enriched.filter((b) => b.op === opId)
}

export { SERVICES, STATUS_ORDER }
