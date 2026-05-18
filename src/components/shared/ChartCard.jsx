import React from 'react'

export default function ChartCard({ title, children, style }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '0.5px solid var(--stone)',
      padding: '20px 24px',
      ...style,
    }}>
      {title && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-emphasis)',
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--stone)',
          marginBottom: 16,
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
