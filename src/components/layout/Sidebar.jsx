import React from 'react'

const MODULES = [
  { id: 'M1', label: 'Trajectory & Gap' },
  { id: 'M2', label: 'GHG Summary' },
  { id: 'M3', label: 'Facility Map' },
  { id: 'M4', label: 'Energy Mix' },
  { id: 'M5', label: 'Scope 3 Breakdown' },
  { id: 'M6', label: 'Emission Intensity' },
  { id: 'M7', label: 'Project Tracker' },
]

export default function Sidebar({ activeModule, onSelect }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--ink)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '0.5px solid #222',
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{
        padding: '28px 20px 20px',
        borderBottom: '0.5px solid #222',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--white)',
          lineHeight: 1.3,
        }}>
          The Corporate
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 11,
          color: 'var(--stone)',
          marginTop: 4,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Net Zero 2045
        </div>
      </div>

      <nav style={{ padding: '12px 0', flex: 1 }}>
        {MODULES.map(m => {
          const isActive = activeModule === m.id
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 20px',
                background: isActive ? 'transparent' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--acid-lime)' : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 10,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: 11,
                letterSpacing: '0.04em',
                color: isActive ? 'var(--acid-lime)' : 'var(--stone)',
                textTransform: 'uppercase',
              }}>
                {m.id}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 500 : 300,
                fontSize: 13,
                color: isActive ? 'var(--white)' : 'var(--stone)',
              }}>
                {m.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '0.5px solid #222',
        fontFamily: 'var(--font-body)',
        fontWeight: 300,
        fontSize: 10,
        color: '#444',
        letterSpacing: '0.04em',
      }}>
        2023 Reporting Year
      </div>
    </aside>
  )
}
