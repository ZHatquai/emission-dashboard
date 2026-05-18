import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, ComposedChart, Bar, Rectangle,
} from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import KPICard from '../shared/KPICard.jsx'
import AlertBanner from '../shared/AlertBanner.jsx'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

// Glide path anchors — linearly interpolate between these
const TRAJECTORY_ANCHORS = [
  { year: 2023, required: 1568434 },
  { year: 2027, required: 1254747 },
  { year: 2030, required: 784217 },
  { year: 2035, required: 392109 },
  { year: 2040, required: 156843 },
  { year: 2045, required: 0 },
]

function interpolate(anchors, year) {
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1]
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year)
      return Math.round(a.required + t * (b.required - a.required))
    }
  }
  return 0
}

function buildGlidePath() {
  const data = []
  for (let y = 2023; y <= 2045; y++) {
    // Approved abatement builds up cumulatively
    let approved = 0
    if (y >= 2027) approved += 230000  // W1 fully deployed
    if (y >= 2032) approved += 400000  // W2 added
    if (y >= 2040) approved += 55000   // W3 added
    data.push({
      year: y,
      required: interpolate(TRAJECTORY_ANCHORS, y),
      approved,
      gap: Math.max(0, interpolate(TRAJECTORY_ANCHORS, y) - approved),
    })
  }
  return data
}

// MAC waterfall data — levers sorted by MAC ascending
const MAC_LEVERS = [
  { id: 3,  name: 'Compressed Air',       mac: -65, abatement: 12000,  wave: 1 },
  { id: 2,  name: 'LED Retrofit',          mac: -45, abatement: 15000,  wave: 1 },
  { id: 4,  name: 'HVAC Optimisation',     mac: -25, abatement: 25000,  wave: 1 },
  { id: 5,  name: 'Smart BMS',             mac: -15, abatement: 33000,  wave: 1 },
  { id: 1,  name: 'Logistics Modal Shift', mac: -30, abatement: 90000,  wave: 1 },
  { id: 6,  name: 'Rooftop Solar PV',      mac: 5,   abatement: 45000,  wave: 1 },
  { id: 7,  name: 'E-Forklift Fleet',      mac: 15,  abatement: 10000,  wave: 1 },
  { id: 8,  name: 'Off-site PPA',          mac: 20,  abatement: 70000,  wave: 2 },
  { id: 9,  name: 'Supplier EE Program',   mac: 25,  abatement: 75000,  wave: 2 },
  { id: 10, name: 'Bio-based Polymers',    mac: 55,  abatement: 80000,  wave: 2 },
  { id: 11, name: '90% Recycled Aluminium',mac: 80,  abatement: 140000, wave: 2 },
  { id: 12, name: 'Industrial Heat Pumps', mac: 85,  abatement: 35000,  wave: 2 },
  { id: 13, name: 'Supplier RE Mandate',   mac: 100, abatement: 55000,  wave: 3 },
  { id: 14, name: 'DAC Removal',           mac: 200, abatement: 458808, wave: 4 },
].sort((a, b) => a.mac - b.mac)

const WAVE_COLORS = { 1: 'var(--ink)', 2: 'var(--stone)', 3: 'var(--linen)', 4: 'var(--danger)' }

const PERIOD_CARDS = [
  { period: '2025–27', rate: '−7.2% p.a.', current: true },
  { period: '2028–32', rate: '−9.8% p.a.', current: false },
  { period: '2033–40', rate: '−5.1% p.a.', current: false },
  { period: '2041–45', rate: '−7.0% p.a.', current: false },
]

const CustomGlideTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 12 }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--stone)', marginBottom: 2 }}>
          {p.name}: {p.value?.toLocaleString()} tCO2e
        </div>
      ))}
    </div>
  )
}

export default function M1Trajectory() {
  const { data: summary, loading: l1 } = useModuleData('master-summary')
  const { data: projects, loading: l2 } = useModuleData('projects')

  const loading = l1 || l2
  const glideData = useMemo(() => buildGlidePath(), [])
  const maxAbatement = Math.max(...MAC_LEVERS.map(l => l.abatement))

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      {/* Alert Banner */}
      <AlertBanner stats={[
        { label: 'Annual reduction required', value: '−7.2% / yr', sub: '2025–27 period' },
        { label: 'Portfolio coverage', value: '13.8%', sub: 'of gross carbon debt' },
        { label: 'Remaining gap', value: '3,494,271', sub: 'tCO2e', danger: true },
        { label: '2030 SBTi gate', value: '784,217', sub: 'tCO2e target' },
      ]} />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <KPICard title="2023 Baseline (MB)" value="1,568,434" unit="tCO2e" sub="S1 26,198 + S2 MB 140,676 + S3 1,401,560" />
        <KPICard title="Gross Carbon Debt" value="4,588,079" unit="tCO2e" />
        <KPICard title="Max DAC Liability" value="$91.8M" sub="Ceiling — not target. Board approval required." danger />
        <KPICard title="Carbon Cost Exposure" value="$156.8M" sub="1,568,434 × $100 shadow price" />
      </div>

      {/* Glide Path Chart */}
      <ChartCard title="Net-Zero Glide Path — Required Trajectory vs Approved Abatement" style={{ marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={glideData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="var(--linen)" strokeWidth={0.5} />
            <XAxis dataKey="year" tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomGlideTooltip />} />
            <ReferenceArea dataKey="required" y1={0} fill="var(--linen)" fillOpacity={0.4} />
            <ReferenceLine x={2027} stroke="var(--stone)" strokeDasharray="3 3" strokeWidth={0.5} label={{ value: '2027', fill: 'var(--stone)', fontSize: 10 }} />
            <ReferenceLine x={2030} stroke="var(--ink)" strokeWidth={1} label={{ value: 'SBTi Gate', fill: 'var(--ink)', fontSize: 10, fontWeight: 500 }} />
            <ReferenceLine x={2035} stroke="var(--stone)" strokeDasharray="3 3" strokeWidth={0.5} label={{ value: '2035', fill: 'var(--stone)', fontSize: 10 }} />
            <ReferenceLine x={2040} stroke="var(--stone)" strokeDasharray="3 3" strokeWidth={0.5} label={{ value: '2040', fill: 'var(--stone)', fontSize: 10 }} />
            <Line type="monotone" dataKey="required" stroke="var(--stone)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Required trajectory" />
            <Line type="monotone" dataKey="approved" stroke="var(--ink)" strokeWidth={2} dot={false} name="Approved abatement" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* MAC Waterfall */}
      <ChartCard title="Marginal Abatement Cost Curve — 14 Levers" style={{ marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 240, minWidth: 800, paddingTop: 20, position: 'relative' }}>
            {/* Zero line */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: '55%',
              height: '0.5px',
              background: 'var(--stone)',
            }} />
            {/* $100 reference line */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: '5%',
              height: '0.5px',
              background: 'var(--danger)',
              borderTop: '0.5px dashed var(--danger)',
            }}>
              <span style={{ position: 'absolute', right: 0, top: -14, fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--danger)' }}>$100/t shadow price</span>
            </div>
            {MAC_LEVERS.map(lever => {
              const widthPct = Math.max(3, (lever.abatement / maxAbatement) * 100 / MAC_LEVERS.length * MAC_LEVERS.length * 0.85)
              const isNegative = lever.mac < 0
              const maxMac = 200, minMac = -65
              const range = maxMac - minMac
              const zeroY = 55 // % from top where mac=0 line sits
              const barHeightPct = Math.abs(lever.mac) / range * 40
              const barTop = isNegative ? zeroY - barHeightPct : zeroY
              const color = WAVE_COLORS[lever.wave]

              return (
                <div key={lever.id} title={`${lever.name}\nMAC: $${lever.mac}/t\nAbatement: ${lever.abatement.toLocaleString()} tCO2e\nWave ${lever.wave}`}
                  style={{
                    flex: `0 0 ${widthPct}%`,
                    position: 'relative',
                    height: '100%',
                    cursor: 'default',
                  }}>
                  <div style={{
                    position: 'absolute',
                    left: 0, right: 1,
                    top: `${barTop}%`,
                    height: `${barHeightPct}%`,
                    background: color,
                    border: '0.5px solid rgba(0,0,0,0.1)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0, right: 0,
                    fontFamily: 'var(--font-body)',
                    fontSize: 8,
                    color: 'var(--stone)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    padding: '0 1px',
                  }}>
                    {lever.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Wave legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'flex-end' }}>
          {[1,2,3,4].map(w => (
            <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, background: WAVE_COLORS[w], border: '0.5px solid var(--stone)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)' }}>Wave {w}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Reduction Rate Period Cards */}
      <SectionLabel>Reduction Rate by Period</SectionLabel>
      <div style={{ display: 'flex', gap: 12 }}>
        {PERIOD_CARDS.map(p => (
          <div key={p.period} style={{
            flex: 1,
            background: 'var(--white)',
            border: p.current ? '1.5px solid var(--ink)' : '0.5px solid var(--stone)',
            padding: '16px 20px',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {p.period}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>
              {p.rate}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', marginTop: 6 }}>
              {p.current ? 'Current period' : 'Target'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
