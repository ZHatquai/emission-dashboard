import React from 'react'

const STATUS_STYLES = {
  'Approved':     { background: 'var(--ink)', color: 'var(--acid-lime)' },
  'In Planning':  { background: 'var(--stone)', color: 'var(--ink)' },
  'Not Started':  { background: 'var(--chalk)', color: 'var(--stone)' },
  'Watch':        { background: '#E67E22', color: '#fff' },
  'Deferred':     { background: 'var(--chalk)', color: 'var(--stone)' },
}

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Not Started']
  return (
    <span style={{
      ...style,
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: 11,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-emphasis)',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      border: '0.5px solid var(--stone)',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}
