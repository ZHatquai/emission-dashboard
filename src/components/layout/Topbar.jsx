import React from 'react'
import GlobalFilters from './GlobalFilters.jsx'

const MODULE_TITLES = {
  M1: 'Net-Zero Trajectory & Gap Tracker',
  M2: 'Corporate GHG Summary',
  M3: 'Facility Heat Map & Ranking',
  M4: 'Energy Mix & Renewable Progress',
  M5: 'Scope 3 Category Breakdown',
  M6: 'Emission Intensity & Efficiency',
  M7: 'Net Zero Project Tracker',
}

export default function Topbar({ activeModule }) {
  const isM7 = activeModule === 'M7'

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--white)',
      borderBottom: '0.5px solid var(--stone)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      zIndex: 90,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 11,
          color: 'var(--stone)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {activeModule}
        </span>
        <span style={{ color: 'var(--stone)', fontSize: 11 }}>—</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--fw-emphasis)',
          fontSize: 14,
          color: 'var(--ink)',
        }}>
          {MODULE_TITLES[activeModule]}
        </span>
        {isM7 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginLeft: 8,
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--acid-lime)',
              display: 'inline-block',
              animation: 'livePulse 1.5s ease-in-out infinite',
            }} />
            <style>{`
              @keyframes livePulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.8); }
              }
            `}</style>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live</span>
          </span>
        )}
      </div>
      <GlobalFilters />
    </header>
  )
}
