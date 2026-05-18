import React, { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import { useFilters } from '../../context/FilterContext.jsx'
import KPICard from '../shared/KPICard.jsx'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const fmt = n => n >= 1_000_000
  ? (n / 1_000_000).toFixed(1) + 'M'
  : n >= 1_000
  ? Math.round(n).toLocaleString()
  : n

const SCOPE_COLORS = ['var(--ink)', 'var(--stone)', 'var(--linen)']

const S3_CATS = [
  { cat: 1,  label: 'Cat 1 — Purchased goods & services', total: 728500 },
  { cat: 11, label: 'Cat 11 — Use of sold products',       total: 320000 },
  { cat: 4,  label: 'Cat 4 — Upstream transport',          total: 132900 },
  { cat: 2,  label: 'Cat 2 — Capital goods',               total: 51200  },
  { cat: 9,  label: 'Cat 9 — Downstream transport',        total: 59900  },
  { cat: 12, label: 'Cat 12 — End of life treatment',      total: 47800  },
  { cat: 3,  label: 'Cat 3 — Fuel & energy activities',    total: 27600  },
  { cat: 7,  label: 'Cat 7 — Employee commuting',          total: 20200  },
  { cat: 5,  label: 'Cat 5 — Waste generated',             total: 7020   },
  { cat: 8,  label: 'Cat 8 — Upstream leased assets',      total: 2800   },
  { cat: 6,  label: 'Cat 6 — Business travel',             total: 2530   },
  { cat: 13, label: 'Cat 13 — Downstream leased assets',   total: 1110   },
].sort((a, b) => b.total - a.total)

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 12 }}>
      <div style={{ fontWeight: 500 }}>{payload[0].name}</div>
      <div>{payload[0].value?.toLocaleString()} tCO2e</div>
    </div>
  )
}

export default function M2GHGSummary() {
  const { data: summary, loading: l1 } = useModuleData('master-summary')
  const { s2Method } = useFilters()
  const [activeIndex, setActiveIndex] = useState(null)

  const loading = l1

  if (loading) return <LoadingSkeleton />

  const ct = summary?.companyTotal || {}
  const s1 = ct.scope1 || 26198
  const s2mb = ct.scope2MB || 140676
  const s2lb = ct.scope2LB || 167465
  const s3 = ct.scope3 || 1401560
  const s2 = s2Method === 'market' ? s2mb : s2lb
  const total = s1 + s2 + s3

  const donutData = [
    { name: 'Scope 1', value: s1 },
    { name: `Scope 2 ${s2Method === 'market' ? 'MB' : 'LB'}`, value: s2 },
    { name: 'Scope 3', value: s3 },
  ]

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <KPICard
          title="Scope 1"
          value={s1.toLocaleString()}
          unit="tCO2e"
          sub={`Stationary ${(ct.scope1Stationary || 24590).toLocaleString()} · Mobile ${(ct.scope1Mobile || 1608).toLocaleString()}`}
        />
        <KPICard
          title={`Scope 2 ${s2Method === 'market' ? '(Market-based)' : '(Location-based)'}`}
          value={s2.toLocaleString()}
          unit="tCO2e"
          sub={s2Method === 'market' ? `LB ${s2lb.toLocaleString()} · Δ ${(s2lb - s2mb).toLocaleString()} tCO2e renewables benefit` : `MB ${s2mb.toLocaleString()} · Δ ${(s2lb - s2mb).toLocaleString()} tCO2e renewables benefit`}
        />
        <KPICard
          title="Scope 3"
          value={s3.toLocaleString()}
          unit="tCO2e"
          sub={`${((s3 / total) * 100).toFixed(1)}% of total · Cat 1: 728,500 (52.0%) · Cat 11: 320,000 (22.8%)`}
        />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Donut */}
        <ChartCard title="Scope Split">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                onClick={(_, i) => setActiveIndex(activeIndex === i ? null : i)}
              >
                {donutData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={SCOPE_COLORS[i]}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.3}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label — overlaid via absolute position workaround */}
          <div style={{ textAlign: 'center', marginTop: -20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{total.toLocaleString()}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>tCO2e total</div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            {donutData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, background: SCOPE_COLORS[i], border: '0.5px solid var(--stone)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)' }}>
                  {d.name} ({((d.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* S2 + Renewable cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '20px 24px', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-emphasis)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', marginBottom: 12 }}>
              Scope 2 — LB vs Market-based
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location-based</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{s2lb.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Market-based</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{s2mb.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--success)' }}>
              {(s2lb - s2mb).toLocaleString()} tCO2e avoided through renewable coverage
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '20px 24px', flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-emphasis)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', marginBottom: 12 }}>
              Renewable Energy Progress
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12 }}>Corporate total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>16.55%</span>
            </div>
            <div style={{ height: 8, background: 'var(--linen)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '16.55%', background: 'var(--ink)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)' }}>49,000 MWh of 296,000 MWh</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)' }}>Target: 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* S3 bar chart */}
      <ChartCard title="Scope 3 — Top Categories">
        <div style={{ marginBottom: 8, display: 'flex', gap: 24 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)' }}>
            Upstream: 974,850 tCO2e
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)' }}>
            Downstream: 426,710 tCO2e
          </span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={S3_CATS} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--linen)" strokeWidth={0.5} />
            <XAxis type="number" tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={240}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--ink)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="var(--ink)" radius={0} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
