// ─────────────────────────────────────────────────────────────────────────────
// TaniBareng — seeded village data
// One believable Kelompok Tani in Central Java. Numbers are designed to add up:
// finance and fleet figures are derived from these records in the store selectors,
// not hardcoded, so an action in one role recomputes another role's screen.
// ─────────────────────────────────────────────────────────────────────────────

// "Today" for the demo. The crop calendar and peak-week logic key off this.
export const TODAY = '2026-06-28' // late-June: tail of MT-1 harvest, peak contention.

export const VILLAGE = {
  kelompok: 'Kelompok Tani Tani Makmur',
  desa: 'Desa Sumberagung',
  kecamatan: 'Kec. Bayan',
  kabupaten: 'Kab. Purworejo, Jawa Tengah',
}

// ── Services (alsintan = alat mesin pertanian) ───────────────────────────────
// pricePerHa in Rupiah. category groups which machines/operators apply.
export const SERVICES = [
  {
    key: 'olah_lahan',
    name: 'Olah Lahan',
    en: 'Land preparation',
    category: 'land_prep',
    pricePerHa: 1_200_000,
    unit: 'ha',
    desc: 'Bajak & garu sawah dengan traktor / hand tractor.',
  },
  {
    key: 'tanam',
    name: 'Tanam Padi',
    en: 'Mechanical planting',
    category: 'planting',
    pricePerHa: 900_000,
    unit: 'ha',
    desc: 'Tanam bibit serempak dengan rice transplanter.',
  },
  {
    key: 'semprot',
    name: 'Penyemprotan',
    en: 'Spraying',
    category: 'spray',
    pricePerHa: 350_000,
    unit: 'ha',
    desc: 'Aplikasi pupuk cair / pestisida dengan drone.',
  },
  {
    key: 'panen',
    name: 'Panen',
    en: 'Harvest',
    category: 'harvest',
    pricePerHa: 1_600_000,
    unit: 'ha',
    desc: 'Panen & perontokan dengan combine harvester.',
  },
]

export const MOBILIZATION_FEE = 75_000 // flat per booking, itemized separately
export const OPERATOR_WAGE_RATE = 0.18 // operator earns 18% of service subtotal
export const FUND_SHARE = 0.45 // of net margin, 45% to community fund / 55% reinvest

// ── Harvest economics (bagi hasil / tenant split) ────────────────────────────
// Gross sellable harvest value per hectare, by crop. Tuned so a maro (50/50)
// padi plot yields a believable farmer share in the low tens of millions.
export const HARVEST_VALUE_PER_HA = { padi: 9_500_000, jagung: 7_000_000 }

export function harvestValuePerHa(crop) {
  if (crop && crop.toLowerCase().startsWith('jagung')) return HARVEST_VALUE_PER_HA.jagung
  return HARVEST_VALUE_PER_HA.padi
}

// Harvest-split presets. farmerPercent + ownerPercent = 100. The Javanese terms
// (Maro, Mertelu) are kept as proper nouns; the ratio drives the math.
export const SPLIT_PRESETS = {
  maro: { key: 'maro', label: 'Maro 50/50', farmerPercent: 50, ownerPercent: 50 },
  mertelu: { key: 'mertelu', label: 'Mertelu 1:2', farmerPercent: 33, ownerPercent: 67 },
  custom_4060: { key: 'custom', label: 'Custom 40/60', farmerPercent: 40, ownerPercent: 60 },
}

// Ledger entry types — the unified financial transaction log.
export const LEDGER = {
  HARVEST_INCOME: 'HARVEST_INCOME',
  MACHINERY_DEBT_INCURRED: 'MACHINERY_DEBT_INCURRED',
  MACHINERY_DEBT_PAID: 'MACHINERY_DEBT_PAID',
}

// ── Landowners (Pemilik Lahan) ───────────────────────────────────────────────
export const SEED_LANDOWNERS = [
  { id: 'LO-01', name: 'H. Marwoto', phone: '0812-2670-1140', desa: 'Sumberagung' },
  { id: 'LO-02', name: 'Hj. Sastro', phone: '0813-9981-3320', desa: 'Sumberagung' },
  { id: 'LO-03', name: 'P. Wignyo', phone: '0857-1123-8890', desa: 'Bayan' },
]

// ── Plots ────────────────────────────────────────────────────────────────────
// Each plot is OWNED by a landowner (landownerId) and CULTIVATED by a penggarap
// (tenant; the `owner`/`penggarap` member name). harvestSplit configures bagi hasil.
export const SEED_PLOTS = [
  { id: 'PL-01', name: 'Blok Kali Lor', owner: 'P. Sukardi', penggarap: 'P. Sukardi', landownerId: 'LO-01', harvestSplit: SPLIT_PRESETS.mertelu, ha: 2.4, crop: 'Padi Inpari-32', blok: 'Kali Lor' },
  { id: 'PL-02', name: 'Sawah Tengah', owner: 'Ibu Wagini', penggarap: 'Ibu Wagini', landownerId: 'LO-02', harvestSplit: SPLIT_PRESETS.maro, ha: 1.8, crop: 'Padi Ciherang', blok: 'Tengah' },
  { id: 'PL-03', name: 'Blok Sumber', owner: 'P. Darmaji', penggarap: 'P. Darmaji', landownerId: 'LO-02', harvestSplit: SPLIT_PRESETS.maro, ha: 3.1, crop: 'Padi Inpari-32', blok: 'Sumber' },
  { id: 'PL-04', name: 'Tegal Wetan', owner: 'P. Mulyono', penggarap: 'P. Mulyono', landownerId: 'LO-03', harvestSplit: SPLIT_PRESETS.custom_4060, ha: 1.2, crop: 'Jagung Hibrida', blok: 'Wetan' },
  { id: 'PL-05', name: 'Blok Krajan', owner: 'Ibu Tasmiah', penggarap: 'Ibu Tasmiah', landownerId: 'LO-01', harvestSplit: SPLIT_PRESETS.maro, ha: 2.7, crop: 'Padi Ciherang', blok: 'Krajan' },
  { id: 'PL-06', name: 'Sawah Kidul', owner: 'P. Hadi S.', penggarap: 'P. Hadi S.', landownerId: 'LO-03', harvestSplit: SPLIT_PRESETS.mertelu, ha: 0.9, crop: 'Padi Inpari-32', blok: 'Kidul' },
]

// ── Fleet (covers the six required machine types + a spare tractor) ───────────
export const SEED_MACHINES = [
  { id: 'TL-01', name: 'Quick G1000', type: 'Hand tractor (roda-2)', category: 'land_prep', hp: 8.5, status: 'available' },
  { id: 'TR-02', name: 'Kubota M6040', type: 'Traktor 4WD', category: 'land_prep', hp: 45, status: 'in_field' },
  { id: 'TR-03', name: 'Yanmar EF494', type: 'Traktor 4WD', category: 'land_prep', hp: 50, status: 'available' },
  { id: 'RT-04', name: 'Kubota SPW-48C', type: 'Rice transplanter', category: 'planting', hp: 9, status: 'available' },
  { id: 'DR-05', name: 'DJI Agras T40', type: 'Drone penyemprot', category: 'spray', hp: 0, status: 'in_field' },
  { id: 'CH-06', name: 'Kubota DC-70', type: 'Combine harvester', category: 'harvest', hp: 70, status: 'in_field' },
  { id: 'PT-07', name: 'Power Thresher TM-90', type: 'Perontok (thresher)', category: 'harvest', hp: 12, status: 'maintenance' },
]

// ── Operators (warga lokal terlatih) ─────────────────────────────────────────
export const SEED_OPERATORS = [
  { id: 'OP-01', name: 'Sukardi', phone: '0812-3301-1180', skills: ['land_prep'], desa: 'Sumberagung' },
  { id: 'OP-02', name: 'Bambang Wiyono', phone: '0813-2290-4471', skills: ['planting', 'land_prep'], desa: 'Sumberagung' },
  { id: 'OP-03', name: 'Tukijan', phone: '0857-4419-9023', skills: ['harvest'], desa: 'Bayan' },
  { id: 'OP-04', name: 'Slamet Riyadi', phone: '0821-3398-7765', skills: ['spray'], desa: 'Sumberagung' },
  { id: 'OP-05', name: 'Eko Prasetyo', phone: '0858-6612-3340', skills: ['harvest', 'land_prep'], desa: 'Bayan' },
]

// ── Crop calendar / seasonality (demo year 2026) ─────────────────────────────
// in-season + peak windows per service category. Peak weeks drive contention
// warnings on the booking date step. Dates are 'MM-DD' inclusive ranges.
export const SEASON = {
  land_prep: {
    season: [['04-15', '06-20'], ['10-15', '12-10']],
    peak: [['05-20', '06-15']],
    note: 'Puncak olah lahan MT-2 (musim gadu).',
  },
  planting: {
    season: [['05-25', '07-10'], ['11-15', '12-31']],
    peak: [['06-10', '07-05']],
    note: 'Tanam serempak MT-2.',
  },
  spray: {
    season: [['06-20', '09-15'], ['12-20', '12-31']],
    peak: [['07-15', '08-15']],
    note: 'Aplikasi tengah musim.',
  },
  harvest: {
    season: [['06-15', '08-05'], ['12-15', '12-31']],
    peak: [['06-22', '07-12']],
    note: 'Puncak panen MT-1 — armada combine padat.',
  },
}

// ── Bookings (~10 across every status) ───────────────────────────────────────
// price fields are filled by buildBooking() so itemization stays consistent.
const RAW_BOOKINGS = [
  // Two unassigned Requested bookings → dispatch-board demo
  { id: 'BK-1012', plotId: 'PL-01', service: 'panen', ha: 2.4, date: '2026-06-29', pay: 'harvest', status: 'requested', op: null, machine: null },
  { id: 'BK-1004', plotId: 'PL-01', service: 'semprot', ha: 2.4, date: '2026-06-30', pay: 'now', status: 'requested', op: null, machine: null },

  { id: 'BK-1011', plotId: 'PL-02', service: 'panen', ha: 1.8, date: '2026-06-28', pay: 'now', status: 'confirmed', op: 'OP-03', machine: 'CH-06' },
  { id: 'BK-1003', plotId: 'PL-05', service: 'tanam', ha: 2.7, date: '2026-07-02', pay: 'harvest', status: 'confirmed', op: 'OP-02', machine: 'RT-04' },

  { id: 'BK-1010', plotId: 'PL-03', service: 'olah_lahan', ha: 3.1, date: '2026-06-28', pay: 'now', status: 'dispatched', op: 'OP-01', machine: 'TR-03' },

  { id: 'BK-1009', plotId: 'PL-04', service: 'semprot', ha: 1.2, date: '2026-06-28', pay: 'now', status: 'in_progress', op: 'OP-04', machine: 'DR-05', actualHa: 0.6 },

  { id: 'BK-1008', plotId: 'PL-05', service: 'panen', ha: 2.7, date: '2026-06-24', pay: 'harvest', status: 'completed', op: 'OP-03', machine: 'CH-06', actualHa: 2.7, fuel: 38, notes: 'Hasil gabah bagus, kadar air normal.' },
  { id: 'BK-1005', plotId: 'PL-02', service: 'olah_lahan', ha: 1.8, date: '2026-06-22', pay: 'now', status: 'completed', op: 'OP-05', machine: 'TR-02', actualHa: 1.8, fuel: 22, notes: '' },

  { id: 'BK-1007', plotId: 'PL-06', service: 'olah_lahan', ha: 0.9, date: '2026-06-23', pay: 'now', status: 'invoiced', op: 'OP-01', machine: 'TL-01', actualHa: 0.9, fuel: 9, notes: 'Petak kecil, selesai 1/2 hari.' },
  { id: 'BK-1006', plotId: 'PL-03', service: 'tanam', ha: 3.1, date: '2026-06-20', pay: 'harvest', status: 'invoiced', op: 'OP-02', machine: 'RT-04', actualHa: 3.1, fuel: 16, notes: '' },
]

// Compute the itemized price + derived shares for one booking.
export function priceFor(serviceKey, ha) {
  const svc = SERVICES.find((s) => s.key === serviceKey)
  const subtotal = Math.round(svc.pricePerHa * ha)
  const total = subtotal + MOBILIZATION_FEE
  return {
    pricePerHa: svc.pricePerHa,
    subtotal,
    mobilization: MOBILIZATION_FEE,
    total,
    operatorWage: Math.round(subtotal * OPERATOR_WAGE_RATE),
  }
}

function buildBooking(b) {
  const price = priceFor(b.service, b.ha)
  // pay-at-harvest invoices stay outstanding; pay-now invoiced/completed are paid.
  const paid = b.pay === 'now' && (b.status === 'invoiced' || b.status === 'completed')
  return {
    ...b,
    price,
    paid,
    createdAt: b.date,
    log: {
      actualHa: b.actualHa ?? null,
      fuelLiters: b.fuel ?? null,
      notes: b.notes ?? '',
      startedAt: ['in_progress', 'completed', 'invoiced'].includes(b.status) ? b.date : null,
      completedAt: ['completed', 'invoiced'].includes(b.status) ? b.date : null,
    },
  }
}

export const SEED_BOOKINGS = RAW_BOOKINGS.map(buildBooking)

// ── Harvest split + ledger derivation ────────────────────────────────────────
// Split a gross harvest value between farmer (penggarap) and landowner (pemilik).
export function splitHarvest(grossValue, split) {
  const farmerShare = Math.round((grossValue * split.farmerPercent) / 100)
  const ownerShare = grossValue - farmerShare // remainder, so the two always sum to gross
  return { farmerShare, ownerShare }
}

// Build the HarvestRecord generated when a "panen" booking completes.
export function buildHarvestRecord(booking, plot) {
  const usedHa = booking.log?.actualHa ?? booking.ha
  const valuePerHa = harvestValuePerHa(plot.crop)
  const grossValue = Math.round(valuePerHa * usedHa)
  const { farmerShare, ownerShare } = splitHarvest(grossValue, plot.harvestSplit)
  return {
    id: `HR-${booking.id}`,
    bookingId: booking.id,
    plotId: plot.id,
    landownerId: plot.landownerId,
    date: booking.log?.completedAt ?? booking.date,
    usedHa,
    valuePerHa,
    grossValue,
    split: plot.harvestSplit,
    farmerShare,
    ownerShare,
  }
}

// The financial cascade for completing ONE booking. Returns the ledger entries
// (farmer + landowner) and any HarvestRecord. Used identically by the seed and
// the live COMPLETE_JOB reducer, so seed and runtime math can never drift.
//   • panen        → HARVEST_INCOME for farmer (share) AND landowner (share)
//   • pay==harvest → MACHINERY_DEBT_INCURRED for farmer (the credit, a memo that
//                    reduces net position but is not a cash movement)
export function completionEffects(booking, plot, startSeq) {
  let seq = startSeq
  const entries = []
  let harvestRecord = null
  const date = booking.log?.completedAt ?? booking.date
  const mk = (e) => {
    entries.push({ id: `LG-${seq}`, order: seq, date, bookingId: booking.id, plotId: plot.id, ...e })
    seq += 1
  }

  if (booking.service === 'panen') {
    harvestRecord = buildHarvestRecord(booking, plot)
    mk({
      type: LEDGER.HARVEST_INCOME,
      role: 'farmer',
      party: plot.penggarap,
      amount: harvestRecord.farmerShare, // + cash in
      cash: true,
      descKey: 'ledger.desc_harvest',
      descVars: { plot: plot.name, split: plot.harvestSplit.label },
    })
    mk({
      type: LEDGER.HARVEST_INCOME,
      role: 'landowner',
      party: plot.landownerId,
      amount: harvestRecord.ownerShare,
      cash: true,
      descKey: 'ledger.desc_harvest',
      descVars: { plot: plot.name, split: plot.harvestSplit.label },
    })
  }

  if (booking.pay === 'harvest') {
    mk({
      type: LEDGER.MACHINERY_DEBT_INCURRED,
      role: 'farmer',
      party: plot.penggarap,
      amount: -booking.price.total, // liability against net position; cash:false
      cash: false,
      service: booking.service,
      descKey: 'ledger.desc_debt',
      descVars: { service: booking.service },
    })
  }

  return { entries, harvestRecord, nextSeq: seq }
}

// Starting community-fund ledger (built up over prior seasons). Live finance
// selectors add this season's realized margin on top.
export const SEED_FUND = {
  openingBalance: 41_850_000, // saldo dana komunitas awal musim
  reinvestmentBalance: 23_400_000, // dana cadangan peremajaan alsintan
}

export function freshState() {
  const plots = SEED_PLOTS.map((p) => ({ ...p }))
  const plotMap = Object.fromEntries(plots.map((p) => [p.id, p]))
  const bookings = SEED_BOOKINGS.map((b) => ({ ...b, price: { ...b.price }, log: { ...b.log } }))

  // Replay the completion cascade over already-completed/invoiced bookings so the
  // demo opens with a populated, self-consistent ledger.
  let ledgerSeq = 5001
  const ledger = []
  const harvestRecords = []
  const settled = bookings
    .filter((b) => ['completed', 'invoiced'].includes(b.status))
    .sort((a, b) => (a.log.completedAt || a.date).localeCompare(b.log.completedAt || b.date))
  for (const b of settled) {
    const { entries, harvestRecord, nextSeq } = completionEffects(b, plotMap[b.plotId], ledgerSeq)
    ledger.push(...entries)
    if (harvestRecord) harvestRecords.push(harvestRecord)
    ledgerSeq = nextSeq
  }

  return {
    plots,
    machines: SEED_MACHINES.map((m) => ({ ...m })),
    operators: SEED_OPERATORS.map((o) => ({ ...o })),
    landowners: SEED_LANDOWNERS.map((l) => ({ ...l })),
    bookings,
    harvestRecords,
    ledger,
    fund: { ...SEED_FUND },
    seq: 1013, // next booking number
    ledgerSeq, // next ledger entry number
  }
}
