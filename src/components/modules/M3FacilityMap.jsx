import React, { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useModuleData } from '../../hooks/useModuleData.js'
import { useFilters } from '../../context/FilterContext.jsx'
import { PRODUCTION_VOLUMES } from '../../constants/productionVolumes.js'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const FACILITY_COORDS = {
  'Hanoi Hub':                { coords: [105.8, 21.0], color: '#E67E22' },
  'Guadalajara Gigafactory':  { coords: [-103.4, 20.7], color: 'var(--success)' },
  'Shenzhen Systems':         { coords: [114.1, 22.5], color: 'var(--danger)' },
  'Wrocław Precision':        { coords: [17.0, 51.1], color: 'var(--danger)' },
  'Chennai Circuitry':        { coords: [80.3, 13.1], color: 'var(--danger)' },
}

const REGULATORY_FLAGS = {
  'Hanoi Hub': 'Grid instability',
  'Guadalajara Gigafactory': 'Solar opportunity',
  'Shenzhen Systems': 'Grid carbon intensity',
  'Wrocław Precision': 'CBAM exposure',
  'Chennai Circuitry': 'RPO mandate',
}

const RISK_TIERS = {
  'Shenzhen Systems': 'High',
  'Wrocław Precision': 'High',
  'Chennai Circuitry': 'High',
  'Hanoi Hub': 'Medium',
  'Guadalajara Gigafactory': 'Low',
}

export default function M3FacilityMap() {
  const { data: summary, loading: l1 } = useModuleData('master-summary')
  const { data: s3Data, loading: l2 } = useModuleData('scope3')
  const { facility: filterFacility, s2Method } = useFilters()
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [sortKey, setSortKey] = useState('totalGhgLB')
  const [sortDir, setSortDir] = useState('desc')

  if (l1 || l2) return <LoadingSkeleton />

  const facilities = (summary?.facilities || []).map(f => {
    const vol = PRODUCTION_VOLUMES[f.name] || 1
    const totalGhgLB = f.totalGhgLB || (f.scope1 + f.scope2LB + f.scope3)
    return {
      ...f,
      totalGhgLB,
      intensity: Math.round((totalGhgLB / (vol / 1000)) * 10) / 10,
      riskTier: RISK_TIERS[f.name] || '—',
      regulatoryFlag: REGULATORY_FLAGS[f.name] || '—',
    }
  })

  const maxGhg = Math.max(...facilities.map(f => f.totalGhgLB))

  const filtered = filterFacility === 'All' ? facilities : facilities.filter(f => f.name === filterFacility)

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey]
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    return sortDir === 'asc' ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1)
  })

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const thStyle = {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-emphasis)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--stone)',
    padding: '8px 10px',
    textAlign: 'left',
    borderBottom: '0.5px solid var(--stone)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    background: 'var(--chalk)',
  }
  const tdStyle = {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: 12,
    padding: '9px 10px',
    borderBottom: '0.5px solid var(--linen)',
    verticalAlign: 'middle',
  }

  const sel = facilities.find(f => f.name === selectedFacility)

  return (
    <div>
      {/* World Map */}
      <ChartCard title="Global Facility Locations — Pin size ∝ Total GHG LB" style={{ marginBottom: 12 }}>
        <ComposableMap projectionConfig={{ scale: 147, center: [20, 10] }} style={{ background: 'var(--chalk)', width: '100%', height: 340 }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--linen)"
                  stroke="var(--stone)"
                  strokeWidth={0.3}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>
          {facilities.map(f => {
            const info = FACILITY_COORDS[f.name]
            if (!info) return null
            const r = 4 + (f.totalGhgLB / maxGhg) * 16
            return (
              <Marker key={f.name} coordinates={info.coords} onClick={() => setSelectedFacility(selectedFacility === f.name ? null : f.name)}>
                <circle r={r} fill={info.color} fillOpacity={0.85} stroke="var(--white)" strokeWidth={1} style={{ cursor: 'pointer' }} />
                <text textAnchor="middle" y={-r - 4} style={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'var(--ink)' }}>
                  {f.name.split(' ')[0]}
                </text>
              </Marker>
            )
          })}
        </ComposableMap>

        {/* Pin colour legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'flex-end' }}>
          {[['var(--danger)', 'High risk'], ['#E67E22', 'Medium risk'], ['var(--success)', 'Low risk']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)' }}>{label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Facility Drill-down Card */}
      {sel && (
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--ink)', padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{sel.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)', marginTop: 4 }}>
                {sel.country} · {(PRODUCTION_VOLUMES[sel.name] / 1_000_000).toFixed(0)}M units/yr · Risk: {sel.riskTier}
              </div>
            </div>
            <button onClick={() => setSelectedFacility(null)} style={{ background: 'transparent', border: '0.5px solid var(--stone)', color: 'var(--stone)', padding: '3px 10px', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              Close
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            {[
              ['S1 Total', `${sel.scope1?.toLocaleString()} tCO2e`],
              ['S2 Market-based', `${sel.scope2MB?.toLocaleString()} tCO2e`],
              ['S2 Location-based', `${sel.scope2LB?.toLocaleString()} tCO2e`],
              ['S3 Total', `${sel.scope3?.toLocaleString()} tCO2e`],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'var(--chalk)', padding: '12px 16px', border: '0.5px solid var(--stone)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)' }}>
            Regulatory flag: <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{sel.regulatoryFlag}</span> · Intensity: <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{sel.intensity} tCO2e / 1,000 units</span>
          </div>
        </div>
      )}

      {/* Facility Ranking Table */}
      <SectionLabel>Facility Ranking</SectionLabel>
      <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[
                ['Rank', null], ['Facility', 'name'], ['Country', 'country'],
                ['S1', 'scope1'], ['S2 MB', 'scope2MB'], ['S3', 'scope3'],
                ['Total GHG LB', 'totalGhgLB'], ['Intensity', 'intensity'],
                ['RE%', 'renewablePct'], ['Risk', 'riskTier'], ['Flag', 'regulatoryFlag'],
              ].map(([label, key]) => (
                <th key={label} style={thStyle} onClick={() => key && handleSort(key)}>
                  {label} {key && sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => (
              <tr
                key={f.name}
                onClick={() => setSelectedFacility(selectedFacility === f.name ? null : f.name)}
                style={{ cursor: 'pointer', background: selectedFacility === f.name ? 'var(--linen)' : undefined }}
              >
                <td style={tdStyle}>{i + 1}</td>
                <td style={{ ...tdStyle, fontWeight: 'var(--fw-emphasis)' }}>{f.name}</td>
                <td style={tdStyle}>{f.country}</td>
                <td style={tdStyle}>{f.scope1?.toLocaleString()}</td>
                <td style={tdStyle}>{f.scope2MB?.toLocaleString()}</td>
                <td style={tdStyle}>{f.scope3?.toLocaleString()}</td>
                <td style={{ ...tdStyle, fontWeight: 'var(--fw-emphasis)' }}>{f.totalGhgLB?.toLocaleString()}</td>
                <td style={tdStyle}>{f.intensity}</td>
                <td style={{ ...tdStyle, color: f.renewablePct >= 25 ? 'var(--success)' : f.renewablePct >= 10 ? 'var(--ink)' : 'var(--danger)' }}>
                  {typeof f.renewablePct === 'number' ? `${(f.renewablePct * 100).toFixed(1)}%` : '—'}
                </td>
                <td style={{ ...tdStyle, color: f.riskTier === 'High' ? 'var(--danger)' : f.riskTier === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                  {f.riskTier}
                </td>
                <td style={{ ...tdStyle, fontSize: 11, color: 'var(--stone)' }}>{f.regulatoryFlag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
