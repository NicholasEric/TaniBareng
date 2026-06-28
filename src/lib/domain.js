import { SEASON, SERVICES, TODAY } from '../data/seed.js'
import { parseDate } from './format.js'

// Booking status pipeline. Each step carries a dot color token + ordinal; the
// human label is resolved per-language via t(`status.<key>`). Status is shown
// as a tiny dot + mono tag.
export const STATUS = {
  requested: { dot: 'idle', step: 0 },
  confirmed: { dot: 'sage', step: 1 },
  dispatched: { dot: 'pine', step: 2 },
  in_progress: { dot: 'clay', step: 3 },
  completed: { dot: 'ok', step: 4 },
  invoiced: { dot: 'pine', step: 5 },
}

export const STATUS_ORDER = ['requested', 'confirmed', 'dispatched', 'in_progress', 'completed', 'invoiced']

export const MACHINE_STATUS = {
  available: { dot: 'ok' },
  in_field: { dot: 'clay' },
  maintenance: { dot: 'idle' },
}

// Label helpers — pass the active t() from useT(). Kept here so call sites read
// `statusLabel(t, key)` rather than scattering raw translation keys.
export const statusLabel = (t, key) => t(`status.${key}`)
export const machineStatusLabel = (t, key) => t(`mstatus.${key}`)
export const catLabel = (t, key) => t(`cat.${key}`)
export const serviceName = (t, key) => t(`svc.${key}.name`)
export const serviceDesc = (t, key) => t(`svc.${key}.desc`)
export const seasonNote = (t, category) => t(`season.${category}`)

export function serviceOf(key) {
  return SERVICES.find((s) => s.key === key)
}

// ── Seasonality ──────────────────────────────────────────────────────────────
function inRanges(dateStr, ranges) {
  const md = dateStr.slice(5) // 'MM-DD'
  return ranges.some(([a, b]) => md >= a && md <= b)
}

// Returns { inSeason, peak, note } for a service category on a given date.
export function seasonFor(serviceKey, dateStr) {
  const svc = serviceOf(serviceKey)
  const cfg = SEASON[svc.category]
  if (!cfg) return { inSeason: true, peak: false, note: '' }
  return {
    inSeason: inRanges(dateStr, cfg.season),
    peak: inRanges(dateStr, cfg.peak),
    note: cfg.note,
  }
}

// How many active bookings already use this machine-category on a date —
// drives peak-day contention warnings on the dispatch + booking screens.
export function contentionOn(bookings, serviceKey, dateStr, excludeId) {
  const cat = serviceOf(serviceKey).category
  return bookings.filter(
    (b) =>
      b.id !== excludeId &&
      b.date === dateStr &&
      serviceOf(b.service).category === cat &&
      b.status !== 'completed' &&
      b.status !== 'invoiced'
  ).length
}

export { TODAY }
