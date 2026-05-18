import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import KPICard from '../shared/KPICard.jsx'
import AlertBanner from '../shared/AlertBanner.jsx'
import StatusPill from '../shared/StatusPill.jsx'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const LS_KEY = 'tc_project_status'

const STATUS_OPTIONS = ['Approved', 'In Planning', 'Not Started', 'Watch', 'Deferred']

const CAPEX_DATA = [
  { wave: 'W1', capex: 10.5 },
  { wave: 'W2', capex: 7.0 },
  { wave: 'W3', capex: 0 },
  { wave: 'W4 (DAC)', capex: 91.8 },
]

const SBTI_FLAGS = [
  { label: 'DAC Cap', detail: 'Contracted 0 / Cap 458,808 / Headroom 458,808', ok: true },
  { label: '2030 Gate', detail: 'W1 approved 168,000 (22% of 784,217 target). W2 acceleration required.', ok: false },
  { label: 'Facility Miss Protocol', detail: '>15% annual miss → COO remediation 60 days. Monitoring begins 2024.', ok: null },
  { label: 'Portfolio Miss Protocol', detail: '>8% cumulative miss → emergency review 30 days. Tracking begins 2024.', ok: null },
]

export default function M7Projects() {
  const { data: projectData, loading } = useModuleData('projects')
  const [localStatuses, setLocalStatuses] = useState({})
  const [hasLocalEdits, setHasLocalEdits] = useState(false)
  const [openWaves, setOpenWaves] = useState({ 1: true, 2: false, 3: false, 4: false })
  const [sortKey, setSortKey] = useState('mac')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
      setLocalStatuses(stored)
      setHasLocalEdits(Object.keys(stored).length > 0)
    } catch {}
  }, [])

  function handleStatusChange(projectId, newStatus) {
    const updated = { ...localStatuses, [String(projectId)]: newStatus }
    setLocalStatuses(updated)
    setHasLocalEdits(true)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  function handleReset() {
    localStorage.removeItem(LS_KEY)
    setLocalStatuses({})
    setHasLocalEdits(false)
  }

  if (loading) return <LoadingSkeleton />

  const rawProjects = projectData?.projects || []

  // Merge xlsx base with localStorage overrides
  const projects = rawProjects.map(p => ({
    ...p,
    status: localStatuses[String(p.id)] || p.status,
  }))

  function sortProjects(list) {
    return [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
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

  const waves = [1, 2, 3, 4]

  return (
    <div>
      {/* Alert Banner */}
      <AlertBanner message="Status field is updated manually in the dashboard. All other values are locked to the source xlsx. Changes are stored locally in this browser and are not written back to the file." />

      {hasLocalEdits && (
        <div style={{
          background: 'var(--linen)',
          border: '0.5px solid var(--stone)',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 12,
          color: 'var(--stone)',
        }}>
          Local edits active — not saved to source file.
          <button onClick={handleReset} style={{
            background: 'transparent',
            border: '0.5px solid var(--stone)',
            color: 'var(--stone)',
            padding: '3px 10px',
            fontSize: 11,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}>
            Reset to source
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <KPICard title="Total Approved CAPEX (W1+W2)" value="$17.5M" sub="OPEX saving: $5.06M/yr" />
        <KPICard title="W1 Approved Abatement" value="168,000" unit="tCO2e" sub="Projects 1, 5, 6: Logistics + Smart BMS + Solar" />
        <KPICard title="Portfolio Coverage" value="24.9%" sub="(685,000 + 458,808) ÷ 4,588,079" />
        <KPICard title="Remaining Gap" value="3,494,271" unit="tCO2e" danger sub="After full portfolio deployment" />
      </div>

      {/* DAC Callout */}
      <div style={{
        background: 'var(--ink)',
        borderLeft: '2px solid var(--acid-lime)',
        padding: '14px 20px',
        marginBottom: 20,
        fontFamily: 'var(--font-body)',
        fontWeight: 300,
        fontSize: 13,
        color: 'var(--white)',
      }}>
        168,000 tCO2e approved in W1 = <strong>$33.6M DAC liability avoided</strong> at $200/t.
      </div>

      {/* Project Register Table */}
      <SectionLabel>Project Register</SectionLabel>
      <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', marginBottom: 20, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
          <thead>
            <tr>
              {[
                ['#', 'id'], ['Project', 'name'], ['Scopes', 'scopes'], ['Wave', 'wave'],
                ['Status', 'status'], ['Max Abatement (tCO2e)', 'maxAbatement'],
                ['CAPEX ($M)', 'capex'], ['MAC ($/t)', 'mac'],
                ['OPEX Saving ($M/yr)', 'opexSaving'], ['Start', 'startYear'],
                ['Completion', 'targetCompletion'], ['Facilities', 'primaryFacilities'],
              ].map(([label, key]) => (
                <th key={key} style={thStyle} onClick={() => handleSort(key)}>
                  {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {waves.map(wave => {
              const waveProjects = sortProjects(projects.filter(p => p.wave === wave))
              if (!waveProjects.length) return null

              const waveLabels = { 1: 'Wave 1 — 2025–2027', 2: 'Wave 2 — 2028–2032', 3: 'Wave 3 — 2033–2040', 4: 'Wave 4 — 2041–2045 (DAC)' }
              const isOpen = openWaves[wave]

              return (
                <React.Fragment key={wave}>
                  <tr
                    onClick={() => setOpenWaves(o => ({ ...o, [wave]: !o[wave] }))}
                    style={{ cursor: 'pointer', background: 'var(--chalk)' }}
                  >
                    <td colSpan={12} style={{
                      ...tdStyle,
                      fontFamily: 'var(--font-body)',
                      fontWeight: 'var(--fw-emphasis)',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--ink)',
                      borderBottom: '0.5px solid var(--stone)',
                    }}>
                      {isOpen ? '▾' : '▸'} {waveLabels[wave]}
                    </td>
                  </tr>
                  {isOpen && waveProjects.map(p => (
                    <tr key={p.id}>
                      <td style={tdStyle}>{p.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 'var(--fw-emphasis)' }}>{p.name}</td>
                      <td style={tdStyle}>{p.scopes}</td>
                      <td style={tdStyle}>W{p.wave}</td>
                      <td style={{ ...tdStyle, padding: '6px 10px' }}>
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 11,
                            background: 'var(--chalk)',
                            border: '0.5px solid var(--stone)',
                            color: 'var(--ink)',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}>{p.maxAbatement?.toLocaleString()}</td>
                      <td style={tdStyle}>{p.capex > 0 ? `$${p.capex}M` : p.wave === 4 ? 'Ceiling $91.8M' : '$0'}</td>
                      <td style={{ ...tdStyle, color: p.mac < 0 ? 'var(--success)' : 'var(--ink)' }}>{p.mac < 0 ? p.mac : `$${p.mac}`}/t</td>
                      <td style={tdStyle}>{p.opexSaving > 0 ? `$${p.opexSaving}M` : p.opexSaving < 0 ? `-$${Math.abs(p.opexSaving)}M` : '—'}</td>
                      <td style={tdStyle}>{p.startYear || '—'}</td>
                      <td style={tdStyle}>{p.targetCompletion || '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 10, color: 'var(--stone)' }}>{p.primaryFacilities}</td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Framing + SBTi Guardrails */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="CAPEX by Wave ($M)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CAPEX_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--linen)" strokeWidth={0.5} />
              <XAxis dataKey="wave" tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 12, border: '0.5px solid var(--stone)' }} />
              <Bar dataKey="capex" fill="var(--ink)" radius={0} name="CAPEX ($M)" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', marginTop: 8 }}>
            W1 payback: 2.1 yrs · Cheapest lever: Compressed Air −$65/t
          </div>
        </ChartCard>

        <div>
          <SectionLabel>SBTi Guardrail Flags</SectionLabel>
          {SBTI_FLAGS.map((f, i) => (
            <div key={i} style={{
              background: 'var(--white)',
              border: '0.5px solid var(--stone)',
              padding: '12px 16px',
              marginBottom: 8,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 14,
                color: f.ok === true ? 'var(--success)' : f.ok === false ? 'var(--danger)' : 'var(--stone)',
                flexShrink: 0,
              }}>
                {f.ok === true ? '✓' : f.ok === false ? '✕' : '○'}
              </span>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-emphasis)', fontSize: 12 }}>{f.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
