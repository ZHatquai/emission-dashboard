import React from 'react'
import { useFilters } from '../../context/FilterContext.jsx'

const FACILITIES = [
  'All',
  'Hanoi Hub',
  'Guadalajara Gigafactory',
  'Shenzhen Systems',
  'Wrocław Precision',
  'Chennai Circuitry',
]

const SCOPES = [
  { value: 'All', label: 'All Scopes' },
  { value: 'S1', label: 'S1 Only' },
  { value: 'S2', label: 'S2 Only' },
  { value: 'S3', label: 'S3 Only' },
  { value: 'S1+S2', label: 'S1 + S2' },
]

const selectStyle = {
  fontFamily: 'var(--font-body)',
  fontWeight: 300,
  fontSize: 12,
  background: 'transparent',
  border: '0.5px solid var(--stone)',
  color: 'var(--ink)',
  padding: '4px 8px',
  cursor: 'pointer',
  outline: 'none',
}

export default function GlobalFilters() {
  const { facility, setFacility, scope, setScope, s2Method, setS2Method } = useFilters()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <select value={facility} onChange={e => setFacility(e.target.value)} style={selectStyle}>
        {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      <select value={scope} onChange={e => setScope(e.target.value)} style={selectStyle}>
        {SCOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <div style={{ display: 'flex', border: '0.5px solid var(--stone)' }}>
        {['market', 'location'].map(method => (
          <button
            key={method}
            onClick={() => setS2Method(method)}
            style={{
              ...selectStyle,
              border: 'none',
              background: s2Method === method ? 'var(--ink)' : 'transparent',
              color: s2Method === method ? 'var(--white)' : 'var(--stone)',
              padding: '4px 10px',
            }}
          >
            {method === 'market' ? 'MB' : 'LB'}
          </button>
        ))}
      </div>

      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 300,
        fontSize: 11,
        color: 'var(--stone)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginLeft: 4,
      }}>
        2023
      </span>
    </div>
  )
}
