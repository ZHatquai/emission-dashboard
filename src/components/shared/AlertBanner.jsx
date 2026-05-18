import React from 'react'

export default function AlertBanner({ stats, message, warning }) {
  if (message) {
    return (
      <div style={{
        background: warning ? 'var(--linen)' : 'var(--ink)',
        color: warning ? 'var(--ink)' : 'var(--stone)',
        padding: '12px 24px',
        fontFamily: 'var(--font-body)',
        fontWeight: 300,
        fontSize: 12,
        border: warning ? '0.5px solid var(--stone)' : 'none',
        marginBottom: 20,
      }}>
        {message}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--ink)',
      display: 'flex',
      gap: 0,
      marginBottom: 20,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: 1,
          padding: '16px 24px',
          borderRight: i < stats.length - 1 ? '0.5px solid #333' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--stone)',
            marginBottom: 4,
          }}>
            {s.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            color: s.danger ? 'var(--danger)' : s.lime ? 'var(--acid-lime)' : 'var(--white)',
          }}>
            {s.value}
          </div>
          {s.sub && (
            <div style={{ fontSize: 11, color: 'var(--stone)', marginTop: 2 }}>{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  )
}
