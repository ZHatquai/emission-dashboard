import React from 'react'

export default function KPICard({ title, value, unit, sub, danger, lime }) {
  return (
    <div style={{
      background: lime ? 'var(--ink)' : 'var(--white)',
      border: '0.5px solid var(--stone)',
      padding: '20px 24px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: lime ? 'var(--stone)' : 'var(--stone)',
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--fw-display)',
        fontSize: 28,
        lineHeight: 1.1,
        color: lime ? 'var(--acid-lime)' : danger ? 'var(--danger)' : 'var(--ink)',
      }}>
        {value}
        {unit && (
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, marginLeft: 6, color: lime ? 'var(--stone)' : 'var(--stone)' }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 12,
          color: lime ? 'var(--stone)' : 'var(--stone)',
          lineHeight: 1.4,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}
