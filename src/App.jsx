import React, { useState } from 'react'
import { FilterProvider } from './context/FilterContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import M1Trajectory from './components/modules/M1Trajectory.jsx'
import M2GHGSummary from './components/modules/M2GHGSummary.jsx'
import M3FacilityMap from './components/modules/M3FacilityMap.jsx'
import M4EnergyMix from './components/modules/M4EnergyMix.jsx'
import M5Scope3 from './components/modules/M5Scope3.jsx'
import M6Intensity from './components/modules/M6Intensity.jsx'
import M7Projects from './components/modules/M7Projects.jsx'

const MODULES = { M1: M1Trajectory, M2: M2GHGSummary, M3: M3FacilityMap, M4: M4EnergyMix, M5: M5Scope3, M6: M6Intensity, M7: M7Projects }

export default function App() {
  const [activeModule, setActiveModule] = useState('M1')
  const ActiveComponent = MODULES[activeModule]

  return (
    <FilterProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--chalk)' }}>
        <Sidebar activeModule={activeModule} onSelect={setActiveModule} />
        <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar activeModule={activeModule} />
          <main style={{
            marginTop: 'var(--topbar-height)',
            padding: '28px 32px',
            flex: 1,
            maxWidth: 1400,
            width: '100%',
          }}>
            <ActiveComponent />
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
