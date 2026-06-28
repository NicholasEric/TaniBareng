// Locale-aware formatting. The current locale is module state, set once by the
// LanguageProvider during render (synchronous, before children render), so the
// pure formatters below don't need the language threaded through every call.

const LOCALES = {
  id: {
    grouping: 'id-ID',
    decimal: 'id-ID',
    dow: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    mon: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    big: { M: ' M', jt: ' jt', rb: ' rb' },
  },
  en: {
    grouping: 'en-US',
    decimal: 'en-US',
    dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    mon: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    big: { M: 'B', jt: 'M', rb: 'k' },
  },
  ja: {
    grouping: 'ja-JP',
    decimal: 'ja-JP',
    dow: ['日', '月', '火', '水', '木', '金', '土'],
    mon: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    big: { M: '億', jt: '百万', rb: '千' },
  },
}

let _locale = 'id'
export function setLocale(l) {
  if (LOCALES[l]) _locale = l
}
const L = () => LOCALES[_locale]

// Rupiah — always "Rp", grouping per locale (id/ja use dots, en uses commas)
export function rp(n) {
  if (n == null || Number.isNaN(n)) return 'Rp –'
  const sign = n < 0 ? '-' : ''
  const s = Math.abs(Math.round(n)).toLocaleString(L().grouping)
  return `${sign}Rp ${s}`
}

export function rpShort(n) {
  if (n == null || Number.isNaN(n)) return 'Rp –'
  const abs = Math.abs(n)
  const b = L().big
  const f = (v) => v.toFixed(1).replace('.', _locale === 'id' ? ',' : '.')
  if (abs >= 1_000_000_000) return `Rp ${f(n / 1_000_000_000)}${b.M}`
  if (abs >= 1_000_000) return `Rp ${f(n / 1_000_000)}${b.jt}`
  if (abs >= 1_000) return `Rp ${Math.round(n / 1_000)}${b.rb}`
  return rp(n)
}

export function ha(n) {
  if (n == null) return '–'
  return `${n.toLocaleString(L().decimal, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ha`
}

// Plain localized number (tabular figures), e.g. hectares inline
export function num(n, opts) {
  return Number(n).toLocaleString(L().decimal, opts)
}

export function dowName(idx) {
  return L().dow[idx]
}
export function monName(idx) {
  return L().mon[idx]
}

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fmtDate(s, opts = {}) {
  const dt = parseDate(s)
  const dow = L().dow[dt.getDay()]
  const date = dt.getDate()
  const mIdx = dt.getMonth()
  const year = dt.getFullYear()
  if (_locale === 'ja') {
    if (opts.long) return `${year}年${mIdx + 1}月${date}日(${dow})`
    return `${mIdx + 1}月${date}日(${dow})`
  }
  const mon = L().mon[mIdx]
  if (opts.long) return `${dow}, ${date} ${mon} ${year}`
  return `${dow} ${date} ${mon}`
}

export function isoDate(dt) {
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(s, n) {
  const dt = parseDate(s)
  dt.setDate(dt.getDate() + n)
  return isoDate(dt)
}

// Monday of the week containing s
export function weekStart(s) {
  const dt = parseDate(s)
  const day = (dt.getDay() + 6) % 7 // Mon=0
  dt.setDate(dt.getDate() - day)
  return isoDate(dt)
}

export function sameWeek(a, b) {
  return weekStart(a) === weekStart(b)
}
