import { createContext, useContext, useState } from 'react'
import {
  Sprout,
  Tractor,
  Building2,
  RotateCcw,
  Home,
  CalendarPlus,
  ClipboardList,
  Wallet,
  ListChecks,
  CalendarDays,
  Coins,
  LayoutDashboard,
  Send,
  Cog,
  Banknote,
} from 'lucide-react'
import { useStore } from './store/store.jsx'
import { useT, useLang } from './i18n/i18n.jsx'
import { VILLAGE } from './data/seed.js'

import FarmerDashboard from './roles/farmer/Dashboard.jsx'
import BookFlow from './roles/farmer/BookFlow.jsx'
import MyBookings from './roles/farmer/MyBookings.jsx'
import FarmerPayments from './roles/farmer/Payments.jsx'

import OperatorToday from './roles/operator/Today.jsx'
import OperatorSchedule from './roles/operator/Schedule.jsx'
import OperatorEarnings from './roles/operator/Earnings.jsx'

import AdminDashboard from './roles/admin/Dashboard.jsx'
import Dispatch from './roles/admin/Dispatch.jsx'
import Fleet from './roles/admin/Fleet.jsx'
import Finance from './roles/admin/Finance.jsx'

// ── lightweight in-app router ────────────────────────────────────────────────
const NavCtx = createContext(null)
export function useNav() {
  return useContext(NavCtx)
}

// icon + translation keys; labels resolve per-language at render
const ROLES = {
  farmer: { nameKey: 'role.farmer', subKey: 'role.farmer_sub', icon: Sprout },
  operator: { nameKey: 'role.operator', subKey: 'role.operator_sub', icon: Tractor },
  admin: { nameKey: 'role.admin', subKey: 'role.admin_sub', icon: Building2 },
}

const NAV = {
  farmer: [
    { key: 'dashboard', labelKey: 'nav.home', icon: Home },
    { key: 'book', labelKey: 'nav.book', icon: CalendarPlus },
    { key: 'bookings', labelKey: 'nav.bookings', icon: ClipboardList },
    { key: 'payments', labelKey: 'nav.payments', icon: Wallet },
  ],
  operator: [
    { key: 'today', labelKey: 'nav.today', icon: ListChecks },
    { key: 'schedule', labelKey: 'nav.schedule', icon: CalendarDays },
    { key: 'earnings', labelKey: 'nav.earnings', icon: Coins },
  ],
  admin: [
    { key: 'dashboard', labelKey: 'nav.operations', icon: LayoutDashboard },
    { key: 'dispatch', labelKey: 'nav.dispatch', icon: Send },
    { key: 'fleet', labelKey: 'nav.fleet', icon: Cog },
    { key: 'finance', labelKey: 'nav.finance', icon: Banknote },
  ],
}

// The signed-in operator for the demo (their queue is shared state)
export const ME_OPERATOR = 'OP-03'

function screenFor(role, screen, params, nav) {
  if (role === 'farmer') {
    if (screen === 'book') return <BookFlow />
    if (screen === 'bookings') return <MyBookings focusId={params?.id} />
    if (screen === 'payments') return <FarmerPayments />
    return <FarmerDashboard />
  }
  if (role === 'operator') {
    if (screen === 'schedule') return <OperatorSchedule />
    if (screen === 'earnings') return <OperatorEarnings />
    return <OperatorToday focusId={params?.id} />
  }
  // admin
  if (screen === 'dispatch') return <Dispatch focusId={params?.id} />
  if (screen === 'fleet') return <Fleet />
  if (screen === 'finance') return <Finance />
  return <AdminDashboard />
}

export default function App() {
  const { dispatch } = useStore()
  const t = useT()
  const [role, setRole] = useState('farmer')
  const [route, setRoute] = useState({ screen: 'dashboard', params: null })

  const go = (screen, params = null) => setRoute({ screen, params })
  const switchRole = (r) => {
    setRole(r)
    setRoute({ screen: NAV[r][0].key, params: null })
  }

  const navItems = NAV[role]
  const RoleIcon = ROLES[role].icon

  const navValue = { role, screen: route.screen, params: route.params, go, switchRole }

  return (
    <NavCtx.Provider value={navValue}>
      <div className="min-h-screen md:flex">
        {/* ── Desktop left nav ───────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-forest md:flex">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <BrandMark />
              <div>
                <div className="font-display text-xl leading-none text-paper">TaniBareng</div>
                <div className="label-mono mt-1 text-sage-2">{t('app.brand_tag')}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4" aria-label={t('app.aria_nav')}>
            <div className="label-mono px-2 pb-2 text-sage-2">
              {t('app.menu_for', { role: t(ROLES[role].nameKey) })}
            </div>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = route.screen === item.key
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => go(item.key)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? 'bg-pine text-paper'
                          : 'text-sage-2 hover:bg-white/5 hover:text-paper'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="font-medium">{t(item.labelKey)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="label-mono text-sage-2">{VILLAGE.kelompok}</div>
            <div className="mt-0.5 font-mono text-2xs text-sage-2/70">
              {VILLAGE.desa} · {VILLAGE.kabupaten}
            </div>
          </div>
        </aside>

        {/* ── Main column ────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* top bar: role switcher + reset */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <BrandMark small />
              <span className="font-display text-lg text-ink">TaniBareng</span>
            </div>

            <RoleSwitcher role={role} onSwitch={switchRole} />

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-sm border border-line px-2.5 py-1.5 lg:flex">
                <RoleIcon className="h-4 w-4 text-pine" strokeWidth={1.75} />
                <div className="leading-tight">
                  <div className="font-mono text-2xs uppercase tracking-wide text-ink">
                    {t(ROLES[role].nameKey)}
                  </div>
                  <div className="font-mono text-2xs text-sage">{t(ROLES[role].subKey)}</div>
                </div>
              </div>
              <LanguageToggle />
              <button
                onClick={() => {
                  if (confirm(t('app.reset_confirm'))) dispatch({ type: 'RESET' })
                }}
                title={t('app.reset_title')}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-line px-2.5 text-ink-2 hover:bg-paper-2"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden font-mono text-2xs uppercase tracking-wide sm:inline">
                  {t('app.reset')}
                </span>
              </button>
            </div>
          </header>

          {/* working area */}
          <main className="flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-10">
            <div className="mx-auto max-w-5xl">{screenFor(role, route.screen, route.params, go)}</div>
          </main>
        </div>

        {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-forest md:hidden"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0,1fr))` }}
          aria-label={t('app.aria_nav')}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const active = route.screen === item.key
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 ${
                  active ? 'text-paper' : 'text-sage-2'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.6} />
                <span className="text-center font-mono text-[10px] uppercase leading-tight tracking-wide">
                  {t(item.labelKey)}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </NavCtx.Provider>
  )
}

function BrandMark({ small }) {
  const s = small ? 'h-7 w-7' : 'h-8 w-8'
  return (
    <div className={`${s} grid place-items-center rounded-sm bg-pine text-paper`}>
      <Sprout className={small ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2} />
    </div>
  )
}

function RoleSwitcher({ role, onSwitch }) {
  const t = useT()
  return (
    <div
      className="flex items-center gap-0.5 rounded-sm border border-line bg-paper-2 p-0.5"
      role="tablist"
      aria-label={t('app.aria_role')}
    >
      {Object.entries(ROLES).map(([key, r]) => {
        const Icon = r.icon
        const active = role === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onSwitch(key)}
            className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
              active ? 'bg-pine text-paper' : 'text-ink-2 hover:bg-paper-3'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden font-medium sm:inline">{t(r.nameKey)}</span>
          </button>
        )
      })}
    </div>
  )
}

// Three-way language toggle — segmented, mono labels, matches the role switcher
function LanguageToggle() {
  const { lang, setLang, langs, t } = useLang()
  return (
    <div
      className="flex items-center gap-0.5 rounded-sm border border-line bg-paper-2 p-0.5"
      role="group"
      aria-label={t('app.aria_lang')}
    >
      {langs.map((l) => {
        const active = lang === l.code
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.name}
            className={`rounded-sm px-2 py-1.5 font-mono text-2xs uppercase tracking-wide transition-colors ${
              active ? 'bg-pine text-paper' : 'text-ink-2 hover:bg-paper-3'
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
