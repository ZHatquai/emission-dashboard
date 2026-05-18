import React from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import { PRODUCTION_VOLUMES } from '../../constants/productionVolumes.js'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const INTENSITY_DATA = [
  { facility: 'Shenzhen', ghgIntensity: 10.2, energyIntensity: 2.2 },
  { facility: 'Chennai',  ghgIntensity: 10.2, energyIntensity: 1.8 },
  { facility: 'Hanoi',    ghgIntensity: 10.5, energyIntensity: 3.6 },
  { facility: 'Wrocław',  ghgIntensity: 23.2, energyIntensity: 10.8 },
  { facility: 'Guadalajara', ghgIntensity: 24.9, energyIntensity: 8.8 },
]

const YOY_CARDS = [
  { name: 'Hanoi Hub',                intensity: 10.5 },
  { name: 'Guadalajara Gigafactory',  intensity: 24.9 },
  { name: 'Shenzhen Systems',         intensity: 10.2 },
  { name: 'Wrocław Precision',        intensity: 23.2 },
  { name: 'Chennai Circuitry',        intensity: 10.2 },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 12 }}>
      {payload.map((p, i) => (
        <div key={i}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function M6Intensity() {
  const { data: summary, loading: l1 } = useModuleData('master-summary')
  const { data: energyData, loading: l2 } = useModuleData('energy-mix')

  if (l1 || l2) return <LoadingSkeleton />

  return (
    <div>
      {/* Info banner */}
      <div style={{ background: 'var(--linen)', border: '0.5px solid var(--stone)', padding: '10px 16px', marginBottom: 20, fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--stone)' }}>
        Production volumes: Hanoi 25M · Guadalajara 10M · Shenzhen 60M · Wrocław 5M · Chennai 35M. Source: The Corporate Assets document. Add to xlsx to automate intensity calculation.
      </div>

      {/* Radar Chart */}
      <ChartCard title="Emission & Energy Intensity by Facility" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={INTENSITY_DATA} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="var(--linen)" />
            <PolarAngleAxis dataKey="facility"
              tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--ink)' }} />
            <PolarRadiusAxis angle={30} domain={[0, 30]}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'var(--stone)' }} />
            <Radar
              name="tCO2e / 1,000 units"
              dataKey="ghgIntensity"
              stroke="var(--ink)"
              fill="var(--ink)"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
            <Radar
              name="MWh / 1,000 units"
              dataKey="energyIntensity"
              stroke="var(--stone)"
              fill="var(--stone)"
              fillOpacity={0.15}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          {[
            ['var(--ink)', 'solid', 'tCO2e / 1,000 units'],
            ['var(--stone)', 'dashed', 'MWh / 1,000 units'],
          ].map(([color, dash, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 0, borderTop: `2px ${dash} ${color}` }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)' }}>{label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* YoY tracker cards */}
      <SectionLabel>Year-on-Year Efficiency Tracker</SectionLabel>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {YOY_CARDS.map(f => {
          const isPriority = f.name === 'Wrocław Precision' || f.name === 'Guadalajara Gigafactory'
          return (
            <div key={f.name} style={{
              flex: 1,
              background: 'var(--white)',
              border: isPriority ? '1.5px solid var(--ink)' : '0.5px solid var(--stone)',
              padding: '16px 18px',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {f.name}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                {f.intensity}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', marginBottom: 6 }}>
                tCO2e / 1,000 units
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 9, color: 'var(--stone)' }}>Prior year</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: 'var(--stone)' }}>—</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 9, color: 'var(--stone)' }}>Δ</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: 'var(--stone)' }}>—</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', marginTop: 8 }}>
                Baseline — tracking begins 2024
              </div>
            </div>
          )
        })}
      </div>

      {/* Priority callout */}
      <div style={{ background: 'var(--chalk)', border: '0.5px solid var(--stone)', padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-emphasis)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', marginBottom: 8 }}>
          Priority Targets
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13 }}>
          <strong>Wrocław (23.2)</strong> and <strong>Guadalajara (24.9)</strong> are 2× the high-volume average —
          primary intensity improvement targets. Recommended levers:{' '}
          <span style={{ fontWeight: 500 }}>Industrial Heat Pumps</span> (Wave 2 · $85/t) and{' '}
          <span style={{ fontWeight: 500 }}>HVAC Optimisation</span> (Wave 1 · −$25/t).
        </div>
      </div>
    </div>
  )
}
