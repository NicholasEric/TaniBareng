# TaniBareng — Alsintan Bersama

A working, clickable front-end mock of the **TaniBareng** application: a community-owned
agricultural-mechanization (*alsintan*) service for a Kelompok Tani in Central Java. Farmers
don't buy machines — they book a machine that arrives **with a trained local operator**. The
co-op owns the fleet, money flows back into a community fund, and **three roles share one app
and one source of truth**.

This is the *product*, not a marketing site. Every primary flow mutates shared state and is
reflected across roles.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

Stack: **React + Vite + Tailwind**, **lucide-react** for icons, no other UI kit (primitives
are hand-built in `src/components/ui.jsx`). State is held client-side in a reducer + context
store, persisted to `localStorage`. There is no backend.

---

## The three roles

Switch roles anytime from the **top-bar role switcher** (desktop) or the same control on
mobile. Each role gets its own left nav (desktop) / bottom tab bar (mobile).

| Role | Screens |
| --- | --- |
| **Petani** (Kelompok Tani head) | Beranda · **Pesan Layanan** (5-step booking) · Pesanan Saya · Pembayaran |
| **Operator** | Tugas Hari Ini · Jadwal (week view) · Upah |
| **Admin Koperasi** | Operasi (dashboard) · **Penugasan** (dispatch board) · Armada · Keuangan |

The signed-in operator for the demo is **Tukijan (OP-03)**.

### Language toggle (ID · EN · 日本語)

A three-way language switch sits in the top bar next to the role switcher. The whole UI —
nav, screen titles, labels, status tags, warnings, buttons, and empty states — re-renders in
**Bahasa Indonesia, English, or Japanese**. The choice persists in `localStorage`.

- Translations live in `src/i18n/translations.js` (one flat key dictionary per language);
  `src/i18n/i18n.jsx` provides the `LanguageProvider`, a `useT()` hook, and a `t(key, vars)`
  helper with `{placeholder}` interpolation and English→Indonesian fallback.
- Numbers and dates are **locale-aware** (`src/lib/format.js`): Rupiah grouping switches
  between dots (`Rp 1.600.000`) and commas (`Rp 1,600,000`), and dates render per locale
  (`Sen 28 Jun` / `Sun 28 Jun` / `6月28日(火)`).
- Seeded proper nouns (plot names, operator names, machine models, crops) stay as data, like a
  real catalog — only the UI chrome and domain vocabulary (services, statuses, categories)
  translate.

---

## Shared state — how the demo proves itself

One reducer (`src/store/store.jsx`) owns `bookings · plots · machines · operators · fund`.
Every screen reads derived selectors (`useDerived`), so an action in one role recomputes
another role's screen. Nothing is hardcoded that could drift — the admin dashboard's revenue,
fund balance, fleet utilization, and receivables are all *computed from the bookings*.

**End-to-end flow to try (book → dispatch → work → pay):**

1. **As Petani →** *Pesan Layanan*: pick **Panen**, a plot, a date (peak harvest weeks are
   flagged ◆), choose **Bayar Setelah Panen**, confirm. A new `BK-####` appears with status
   **Diminta**.
2. **Switch to Admin Koperasi →** *Penugasan*: the new booking is in the unassigned queue.
   Assign a combine + assign operator **Tukijan**. Status flips to **Operator dikirim** and
   the machine goes *in-field* on the Armada screen.
3. **Switch to Operator →** *Tugas Hari Ini*: the job is now in Tukijan's queue. **Mulai
   Pekerjaan**, then **Selesaikan & Catat** (log actual hectares, fuel, notes). Status →
   **Selesai**, the machine frees back to *available*, and the wage lands on the Upah screen.
4. **Back as Petani →** *Pembayaran*: the pay-at-harvest balance is listed; tap **Bayar** to
   settle. The Admin **Keuangan** receivables drop by the same amount.

Use **Reset** (top bar) anytime to restore the seeded village.

### Booking status pipeline
`Diminta (Requested) → Dikonfirmasi → Operator dikirim → Dikerjakan → Selesai → Tertagih`

---

## Domain detail (seeded, not generic filler)

- **One believable village:** Kelompok Tani Tani Makmur, Desa Sumberagung — 6 plots
  (0.9–3.1 ha, mostly *padi* Inpari-32 / Ciherang, one *jagung*), 5 local operators, a
  7-unit fleet, and 10 bookings spread across **every** status.
- **Per-hectare pricing**, itemized: e.g. combine **Panen = Rp 1.600.000/ha** + a flat
  mobilization fee. Rupiah is formatted the Indonesian way — `Rp 1.600.000`.
- **Mixed seasonal fleet** mapped to the crop cycle: land prep (hand tractor, 4WD tractors) →
  planting (rice transplanter) → mid-season (spraying drone) → harvest (combine, power
  thresher). The booking date step **knows what's in season** and warns on **peak-week
  contention**; the dispatch board flags resource conflicts.
- **Pay-at-harvest (*Bayar Setelah Panen*)** is a first-class concept — a 0%-interest
  community credit that shows up as farmer balances, admin receivables, and a line in the
  fund split, not an afterthought.
- **Community fund:** service margin (after operator wages) splits **55% reinvestment / 45%
  community fund**, both shown accumulating on the Keuangan screen.

Seed lives in `src/data/seed.js`; `freshState()` is what **Reset** restores.

---

## Design rationale

> A field tool, not a landing page — an agrarian operations console with editorial warmth.

**Green system with depth (no AI-slop).** Green is structural, never a glowing gradient. The
dominant brand ink is a deep **pine** `#1c3a2e` with a darker **forest** `#13241c` for nav;
the secondary is a muted **sage/olive** `#7a8567` for quiet metadata and inactive states. Text
is a warm **near-black** `#1a1c18` on a **bone paper** `#f3efe5` surface (never pure white,
with a faint restrained paper grain). The single non-green accent is a **clay/ochre**
`#bd5e2e`, used *only* for the primary action, peak-week warnings, and alerts. All of it is
defined as Tailwind theme tokens in `tailwind.config.js`; components never hardcode hex.

**Typography does the work.** Three faces, big size contrast:
- **Fraunces** (display serif) — screen titles & panel headings.
- **Hanken Grotesk** — all UI text.
- **Spline Sans Mono** — *every* number, ID, status tag, and piece of metadata, with tabular
  figures. Numbers are everywhere in this app, so they're set as a feature.

**Structural motif:** *hairline-bordered data panels with mono uppercase micro-labels and
edge-sharing grids.* Structure comes from 1px borders and panels that share edges — **no
drop-shadowed floating cards**, no gradient blobs, corners ≤ 4px, no pills. Status is a tiny
**color dot + mono tag**, not a big colored pill. Metric strips are flat divided grids.

**Responsive for real:** desktop = persistent left nav + dense multi-column working area;
mobile = bottom tab bar + single column with thumb-reachable primary actions. Semantic markup,
keyboard-operable controls, `aria-current`/`aria-selected` on nav and tabs, and an
accent-colored focus ring throughout.

---

## Project structure

```
src/
  data/seed.js            # the village: plots, machines, operators, bookings, pricing, seasons
  lib/
    format.js             # Rupiah / hectare / date formatting (id-ID)
    domain.js             # status pipeline, machine status, seasonality + contention logic
  store/store.jsx         # reducer (the only place state mutates) + derived selectors
  components/ui.jsx       # hand-built primitives: Panel, Metric, StatusTag, Button, …
  roles/
    farmer/               # Dashboard · BookFlow · MyBookings · Payments
    operator/             # Today (+ job detail) · Schedule · Earnings
    admin/                # Dashboard · Dispatch · Fleet · Finance
  App.jsx                 # shell: role switcher, nav, in-app routing, reset
```

### Glossary
*Alsintan* — alat mesin pertanian (agricultural machinery). *Kelompok Tani* — farmer group.
*Bayar Setelah Panen* — pay after harvest. *Olah Lahan / Tanam / Penyemprotan / Panen* —
land prep / planting / spraying / harvest. *MT-1 / MT-2* — first / second planting season.
