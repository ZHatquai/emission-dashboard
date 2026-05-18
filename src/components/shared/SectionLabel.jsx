import React from 'react'

export default function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-emphasis)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--stone)',
      borderBottom: '0.5px solid var(--stone)',
      paddingBottom: 8,
      marginBottom: 16,
      marginTop: 24,
    }}>
      {children}
    </div>
  )
}
