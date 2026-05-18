import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import { useFilters } from '../../context/FilterContext.jsx'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const FACILITY_NAMES = [
  'Hanoi Hub',
  'Guadalajara Gigafactory',
  'Shenzhen Systems',
  'Wrocław Precision',
  'Chennai Circuitry',
]

const FACILITY_COLORS = ['var(--ink)', '#444', 'var(--stone)', 'var(--linen)', '#ccc']

// Spec data (fallback if function returns empty)
const SPEC_CATS = [
  { category: 1,  label: 'Cat 1 — Purchased goods & services',  total: 728500, isUpstream: true },
  { category: 11, label: 'Cat 11 — Use of sold products',        total: 320000, isUpstream: false },
  { category: 4,  label: 'Cat 4 — Upstream transport',           total: 132900, isUpstream: true },
  { category: 2,  label: 'Cat 2 — Capital goods',                total: 51200,  isUpstream: true },
  { category: 9,  label: 'Cat 9 — Downstream transport',         total: 59900,  isUpstream: false },
  { category: 12, label: 'Cat 12 — End of life treatment',       total: 47800,  isUpstream: false },
  { category: 3,  label: 'Cat 3 — Fuel & energy activities',     total: 27600,  isUpstream: true },
  { category: 7,  label: 'Cat 7 — Employee commuting',           total: 20200,  isUpstream: true },
  { category: 5,  label: 'Cat 5 — Waste generated',              total: 7020,   isUpstream: true },
  { category: 8,  label: 'Cat 8 — Upstream leased assets',       total: 2800,   isUpstream: true },
  { category: 6,  label: 'Cat 6 — Business travel',              total: 2530,   isUpstream: true },
  { category: 13, label: 'Cat 13 — Downstream leased assets',    total: 1110,   isUpstream: false },
].sort((a, b) => b.total - a.total)

// Levers matched by category
const CAT_LEVERS = {
  1:  { name: 'Logistics Modal Shift', status: 'Approved' },
  3:  { name: 'LED Retrofit & Compressed Air', status: 'In Planning' },
  4:  { name: 'Off-site Virtual PPA', status: 'In Planning' },
  11: null,
}

const HAS_LEVER = new Set([1, 3, 4])

export default function M5Scope3() {
  const { data, loading } = useModuleData('scope3')
  const { scope } = useFilters()
  const [selectedCat, setSelectedCat] = useState(null)

  if (loading) return <LoadingSkeleton />

  const cats = (data?.categories?.length ? data.categories : SPEC_CATS).sort((a, b) => b.total - a.total)
  const s3Total = cats.reduce((s, c) => s + c.total, 0)

  const selected = selectedCat !== null ? cats.find(c => c.category === selectedCat) : null

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 12 }}>
        <div style={{ fontWeight: 500 }}>{payload[0].payload.label}</div>
        <div>{payload[0].value?.toLocaleString()} tCO2e — {((payload[0].value / s3Total) * 100).toFixed(1)}% of S3</div>
        {payload[0].payload.category === 11 && <div style={{ color: 'var(--danger)', marginTop: 4 }}>No lever — R&D required</div>}
      </div>
    )
  }

  return (
    <div>
      {/* Scope filter override notice */}
      {(scope === 'S1' || scope === 'S2' || scope === 'S1+S2') && (
        <div style={{ background: 'var(--linen)', border: '0.5px solid var(--stone)', padding: '8px 16px', marginBottom: 12, fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)' }}>
          Scope 3 data shown regardless of scope filter selection.
        </div>
      )}

      {/* Upstream / Downstream totals */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          ['Upstream Total', 974850, 'Cat 1–8'],
          ['Downstream Total', 426710, 'Cat 9–15'],
          ['Scope 3 Grand Total', 1401560, '89.3% of corporate footprint'],
        ].map(([title, value, sub]) => (
          <div key={title} style={{ flex: 1, background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{title}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{value.toLocaleString()}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Category bar chart */}
      <ChartCard title="Scope 3 by Category — Ranked Descending" style={{ marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={cats} layout="vertical" margin={{ left: 0, right: 60, top: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--linen)" strokeWidth={0.5} />
            <XAxis type="number" tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={260}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--ink)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={0} maxBarSize={16} onClick={e => setSelectedCat(selectedCat === e.category ? null : e.category)}>
              {cats.map(c => (
                <Cell
                  key={c.category}
                  fill={selectedCat === null || selectedCat === c.category ? 'var(--ink)' : 'var(--linen)'}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Click-to-isolate metric cards */}
      {selected && (
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--ink)', padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{selected.label}</div>
            <button onClick={() => setSelectedCat(null)} style={{ background: 'transparent', border: '0.5px solid var(--stone)', color: 'var(--stone)', padding: '3px 10px', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Clear</button>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>tCO2e</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{selected.total.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>% of S3</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{((selected.total / s3Total) * 100).toFixed(1)}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lever status</div>
              {CAT_LEVERS[selected.category] ? (
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, marginTop: 4 }}>
                  {CAT_LEVERS[selected.category].name} —{' '}
                  <span style={{ color: 'var(--stone)' }}>{CAT_LEVERS[selected.category].status}</span>
                </div>
              ) : selected.category === 11 ? (
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: 'var(--danger)', marginTop: 4 }}>
                  No lever in current portfolio — R&D workstream required.
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--stone)', marginTop: 4 }}>
                  No lever in current portfolio.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
