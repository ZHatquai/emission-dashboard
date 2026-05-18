import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts'
import { useModuleData } from '../../hooks/useModuleData.js'
import KPICard from '../shared/KPICard.jsx'
import ChartCard from '../shared/ChartCard.jsx'
import SectionLabel from '../shared/SectionLabel.jsx'
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx'

const FUEL_COLORS = {
  gas: 'var(--ink)',
  diesel: 'var(--danger)',
  lpg: 'var(--stone)',
  grid: '#888',
  renewable: 'var(--success)',
}

const FUEL_LABELS = {
  gas: 'Natural Gas',
  diesel: 'Diesel',
  lpg: 'LPG',
  grid: 'Grid Electricity',
  renewable: 'Renewable',
}

const RE_PCT = {
  'Guadalajara Gigafactory': 30.6,
  'Wrocław Precision': 29.0,
  'Hanoi Hub': 13.8,
  'Chennai Circuitry': 9.8,
  'Shenzhen Systems': 6.4,
  Corporate: 16.55,
}

function reColor(pct) {
  if (pct >= 25) return 'var(--success)'
  if (pct >= 10) return 'var(--stone)'
  return 'var(--danger)'
}

const LB_MB_DATA = [
  { name: 'Guadalajara', lb: 32688, mb: 22700, avoided: 9988 },
  { name: 'Wrocław', lb: 22506, mb: 15972, avoided: 6534 },
  { name: 'Hanoi', lb: 28629, mb: 24680, avoided: 3949 },
  { name: 'Shenzhen', lb: 54614, mb: 51128, avoided: 3486 },
  { name: 'Chennai', lb: 29028, mb: 26196, avoided: 2832 },
]

export default function M4EnergyMix() {
  const { data: energyData, loading: l1 } = useModuleData('energy-mix')
  const { data: s2Data, loading: l2 } = useModuleData('scope2')

  if (l1 || l2) return <LoadingSkeleton />

  const facilities = energyData?.facilities || []
  const total = energyData?.total || {}

  const stackedData = facilities.map(f => ({
    name: f.name?.split(' ')[0] || f.name,
    fullName: f.name,
    ...f,
  }))

  const gaugeData = [...Object.entries(RE_PCT)].map(([name, pct]) => ({
    name,
    value: pct,
    fill: reColor(pct),
  }))

  return (
    <div>
      {/* Fossil dependency KPI */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <KPICard
          title="Total Fossil Thermal"
          value="128,660"
          unit="MWh eq."
          sub="30.3% of total energy — Gas 88.6% · Diesel 6.1% · LPG 5.3%"
        />
        <KPICard title="Corporate Renewable %" value="16.55%" sub="49,000 of 296,000 MWh — Target: 100%" />
        <KPICard title="S2 LB–MB Delta (Corporate)" value="26,789" unit="tCO2e" sub="Avoided through current RE coverage" />
      </div>

      {/* Stacked horizontal bar */}
      <ChartCard title="Energy Mix by Facility (MWh)" style={{ marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stackedData} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--linen)" strokeWidth={0.5} />
            <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={80}
              tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--ink)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 11, border: '0.5px solid var(--stone)' }}
              formatter={(v, name) => [`${v?.toLocaleString()} MWh`, FUEL_LABELS[name] || name]}
            />
            {['gas', 'diesel', 'lpg', 'grid', 'renewable'].map(fuel => (
              <Bar key={fuel} dataKey={fuel} stackId="a" fill={FUEL_COLORS[fuel]} radius={0} name={fuel} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          {Object.entries(FUEL_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, background: FUEL_COLORS[key], border: '0.5px solid rgba(0,0,0,0.1)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)' }}>{label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* RE% Gauges */}
      <SectionLabel>Renewable Energy % — Facility Gauges</SectionLabel>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {gaugeData.map(g => (
          <div key={g.name} style={{
            background: 'var(--white)',
            border: '0.5px solid var(--stone)',
            padding: '16px',
            flex: '1 1 120px',
            textAlign: 'center',
            minWidth: 120,
          }}>
            <div style={{ position: 'relative', height: 80 }}>
              <ResponsiveContainer width="100%" height={80}>
                <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0}
                  data={[{ value: g.value, fill: g.fill }]}>
                  <RadialBar background={{ fill: 'var(--linen)' }} dataKey="value" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: g.fill,
                textAlign: 'center',
              }}>
                {g.value}%
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 10, color: 'var(--stone)', marginTop: 6, lineHeight: 1.3 }}>
              {g.name === 'Corporate' ? 'Corporate' : g.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* LB vs MB delta chart */}
      <ChartCard title="Scope 2 Avoided Emissions — RE Coverage Impact (tCO2e)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={LB_MB_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--linen)" strokeWidth={0.5} />
            <XAxis dataKey="name" tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--stone)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: 11, border: '0.5px solid var(--stone)' }} formatter={v => [`${v?.toLocaleString()} tCO2e`]} />
            <Bar dataKey="mb" fill="var(--ink)" radius={0} name="Market-based" />
            <Bar dataKey="avoided" fill="var(--success)" radius={0} name="Avoided (LB−MB)" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--stone)', marginTop: 8 }}>
          Dark = S2 Market-based · Green = tCO2e avoided through renewable coverage
        </div>
      </ChartCard>
    </div>
  )
}
