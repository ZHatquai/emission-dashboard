# Project Spec — The Corporate: Net Zero 2045 Command Dashboard

## Overview

A 7-module internal emissions dashboard for The Corporate, displaying the company's 2023 GHG baseline, net-zero trajectory, facility data, energy mix, Scope 3 breakdown, emission intensity, and project tracker. Built for two internal audiences — CEO and Sustainability team — accessed via Netlify hosted link.

**Data source:** `TheCorporate_Emissions_Energy_2023-ver3.xlsx` — 8 sheets, committed to the repository. All dashboard data is read from this file via Netlify serverless functions at runtime. When the xlsx is updated and re-committed, the dashboard reflects the new values on next deploy. No data is hardcoded in React components.

This is an iteration on a working prototype (`the_corporate_ghg_dashboard.html`). The prototype establishes correct brand tokens, sidebar navigation, and page structure. This build upgrades it with: Netlify Functions data layer, complete chart implementations, full data fidelity from the xlsx, richer interactions, and strict brand compliance throughout.

---

## Project Type

Multi-view interactive dashboard — 7 navigable modules, data fetched from Netlify Functions at load, dynamic filtering, chart interactions, state shared across modules.

---

## Build Status

Iteration. Previous version: single HTML file prototype with correct brand styling and placeholder/mock data. This build: React + Vite, data via Netlify Functions reading the xlsx, all 7 modules fully implemented.

---

## Audience & Access

- **CEO** — primary for M1, M2, M3, M7. Needs top-line numbers and strategic framing.
- **Sustainability team** — primary for M4, M5, M6. Deep-dive modules with granular breakdowns.
- Access: Netlify hosted URL. No authentication. No user accounts.

---

## Architecture — Data Layer

### How it works

```
TheCorporate_Emissions_Energy_2023-ver3.xlsx  (committed to /data/ in repo)
        │
        ▼
Netlify Functions  (/netlify/functions/)
  — read xlsx at runtime using SheetJS (xlsx npm package)
  — one function per data domain
  — return clean JSON
        │
        ▼
React app  (fetches from /.netlify/functions/*)
  — one data fetch per module on mount
  — all charts and KPIs rendered from JSON response
  — global filter state applied client-side to fetched data
```

### Why Netlify Functions (not Google Sheets)

The xlsx is the master source of truth. Netlify Functions read the file directly from the repo — when the file is updated and re-committed, the dashboard reflects new values on next deploy. No manual sync, no second source that can drift.

### Sheet → function mapping

| Sheet name | Netlify function | Modules using it |
|---|---|---|
| `Master Summary` | `/api/master-summary` | M1, M2, M3, M6 |
| `Scope 1 — Detail` | `/api/scope1` | M2, M3 |
| `Scope 2 — Detail` | `/api/scope2` | M2, M3, M4 |
| `Scope 3 — Detail` | `/api/scope3` | M2, M3, M5 |
| `Energy Mix` | `/api/energy-mix` | M4 |
| `Net Zero Projects` | `/api/projects` | M1, M7 |
| `Emission Factors` | `/api/emission-factors` | reference |
| `Data Dictionary` | not exposed | internal reference only |

### Function implementation notes for Claude Code

Each Netlify Function:
1. Reads the xlsx from `path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')`
2. Uses `xlsx` npm package: `XLSX.readFile(filePath)` then `XLSX.utils.sheet_to_json(sheet, { header: 1 })` to get raw arrays
3. Skips title/header rows (row 0 = title string, row 1 = blank or params, row 2 = column headers, rows 3–N = data)
4. Returns clean JSON with named keys

**Critical parsing notes per sheet:**

- **Master Summary:** Facility data in rows 2–6 (0-indexed after header row). Row 7 = COMPANY TOTAL. KPI block rows 10–15 — parse separately.
- **Scope 1 — Detail:** Two header groups (Stationary / Mobile) in row 1. Use column positions to flatten into single object per facility. Data rows 3–7, row 8 = TOTAL.
- **Scope 2 — Detail:** Data rows 3–7, row 8 = TOTAL. Both LB and MB present per facility.
- **Scope 3 — Detail:** Rows 3–18. Row 2 = "── UPSTREAM ──" divider, row 11 = "── DOWNSTREAM ──" divider — skip these. Rows 3–10 = upstream cats, rows 12–18 = downstream cats. Row 19 = TOTAL SCOPE 3.
- **Energy Mix:** Data rows 2–6, row 7 = TOTAL. Straightforward.
- **Net Zero Projects:** Complex. Project data in rows 4–10 (Wave 1), 12–16 (Wave 2), 18 (Wave 3), 20 (Wave 4). Wave header rows (3, 11, 17, 19) — parse for wave metadata. Portfolio summary block rows 23–33. Return: `{ projects: [...], waveSummary: {...}, gapAnalysis: {...} }`.

### M7 — Status field editability

Status edits in the browser cannot write back to the file — the architecture is read-only at runtime.

**Solution:** M7 status edits stored in `localStorage` under key `tc_project_status` as `{ [projectNumber]: "statusString" }`. On load, xlsx statuses are fetched; localStorage overrides are merged on top (localStorage wins). A "Reset to source" button clears localStorage. Display label: "Local edits active — not saved to source file."

---

## Global Filters

Applied client-side to fetched data. Persist across all modules.

| Filter | Options | Default |
|--------|---------|---------|
| Facility | All · Hanoi Hub · Guadalajara Gigafactory · Shenzhen Systems · Wrocław Precision · Chennai Circuitry | All |
| Scope | All scopes · S1 only · S2 only · S3 only · S1+S2 only | All scopes |
| S2 method | Location-based · Market-based | Market-based |
| Reporting year | 2023 | 2023 (locked — label only) |

Filter bar in topbar, visible on all modules.

---

## Functionality

1. App loads → parallel fetches from all Netlify Functions on mount
2. Loading skeleton shown per module while data fetches
3. Sidebar nav click → module updates, topbar title updates
4. Global filters applied client-side to all charts/KPIs
5. Per-module interactions: sortable tables, click-to-isolate charts, hover tooltips, expandable drill-down cards
6. M7 status edits: localStorage only, not written to xlsx

---

## Module Specifications

### M1 — Net-Zero Trajectory & Gap Tracker

**Audience:** Both | **Sources:** `Master Summary` + `Net Zero Projects`

**Alert banner (Ink background, full width, 4 stat blocks):**
- Annual reduction required: −7.2% / yr (2025–27 period)
- Portfolio coverage: 13.8% of gross carbon debt
- Remaining gap: 3,494,271 tCO2e
- 2030 SBTi gate: 784,217 tCO2e + status pill

**KPI row (4 cards):**
- 2023 Baseline (MB): 1,568,434 tCO2e — derived: S1 26,198 + S2 MB 140,676 + S3 1,401,560
- Gross carbon debt: 4,588,079 tCO2e (from Net Zero Projects portfolio summary block)
- Max DAC liability: $91.8M — warning flag, ceiling not target
- Carbon cost exposure: $156.8M (1,568,434 × $100 shadow price)

**Glide path chart (Recharts LineChart):**
- X: 2023–2045. Y: tCO2e.
- Series 1 — Required trajectory (dashed, Stone colour): 6 anchors: 2023: 1,568,434 · 2027: 1,254,747 · 2030: 784,217 · 2035: 392,109 · 2040: 156,843 · 2045: 0. Linearly interpolated between anchors.
- Series 2 — Approved lever abatement (solid, Ink): cumulative abatement stacked by wave deployment year. W1: 230,000 by 2027 · W2: +400,000 by 2032 · W3: +55,000 by 2040.
- Gap zone: Recharts ReferenceArea between the two series, Linen/red-tinted fill.
- ReferenceLine at 2027, 2030 (bold, label "SBTi Gate"), 2035, 2040, 2045.
- Tooltip: year · required tCO2e · approved abatement · gap.

**MAC / Waterfall chart:**
- 14 levers ordered by MAC ascending (most negative first, DAC $200/t last).
- Bar width ∝ abatement volume. Y position = MAC ($/tCO2e).
- Note: Recharts BarChart uses uniform widths — use custom SVG rendering or Recharts ComposedChart with custom bar shapes. Claude Code to determine best approach.
- Colour by wave: W1 Ink · W2 Stone · W3 Linen · W4/DAC #C0392B.
- Horizontal ReferenceLine at $100/t (shadow carbon price).
- Tooltip: project name · wave · abatement · CAPEX · MAC · status · primary facilities.

**Reduction rate period cards (4 cards, horizontal row):**
- 2025–27: −7.2% p.a. · "Baseline — tracking begins 2024" · Grey
- 2028–32: −9.8% p.a. · Target · Grey
- 2033–40: −5.1% p.a. · Target · Grey
- 2041–45: −7.0% p.a. · Target · Grey
- Current period (2025–27) highlighted with Ink border.

---

### M2 — Corporate GHG Summary

**Audience:** CEO primary | **Sources:** `Master Summary` + `Scope 3 — Detail`

**KPI row (3 cards — from Master Summary COMPANY TOTAL row):**
- Scope 1: 26,198 tCO2e · Stationary 24,590 + Mobile 1,608 · Chennai diesel 1,822 flagged chip · Carbon cost $2.6M in muted text
- Scope 2 MB: 140,676 tCO2e · LB 167,465 secondary · Delta: "26,789 tCO2e renewables benefit" · Shenzhen highest risk flagged
- Scope 3: 1,401,560 tCO2e · 89.3% of total · Cat 1: 728,500 (52.0%) · Cat 11: 320,000 (22.8%) · Cat 11 alert chip: "No lever — R&D required"

**Two-column layout:**

Left — Scope split donut (Recharts PieChart):
- S1: 26,198 (1.7%) · S2 MB: 140,676 (9.0%) · S3: 1,401,560 (89.3%)
- Centre label: 1,568,434 tCO2e total
- Optional outer ring: carbon cost at $100/t
- Click segment → filters M2 components to that scope

Right — Two stacked cards:
- S2 LB vs MB card: 167,465 LB · 140,676 MB · "26,789 tCO2e avoided through renewable coverage"
- Renewable progress bar: 16.55% (49,000 of 296,000 MWh). Target 100%. Facility breakdown on hover.

**S3 top categories chart (Recharts BarChart, horizontal):**
All 13 populated categories from `Scope 3 — Detail` TOTAL column, ranked descending.
Upstream/downstream divider with totals labels.

---

### M3 — Facility Heat Map & Ranking

**Audience:** Both | **Sources:** `Master Summary` + `Scope 1 — Detail` + `Scope 2 — Detail` + `Scope 3 — Detail` + `Net Zero Projects`

**World map (SVG, country-level pins):**
- 5 fixed-coordinate pins: Vietnam (21.0°N, 105.8°E) · Mexico (20.7°N, 103.4°W) · China (22.5°N, 114.1°E) · Poland (51.1°N, 17.0°E) · India (13.1°N, 80.3°E)
- Pin size ∝ Total GHG LB (from Master Summary)
- Pin colour: Red = Shenzhen, Wrocław, Chennai · Amber = Hanoi · Green = Guadalajara
- Click pin → facility drill-down card
- Use react-simple-maps or a static SVG world map asset — not full D3/GeoJSON

**Ranked facility table (all columns sortable, default: Total GHG LB descending):**
Columns: Rank · Facility · Country · S1 · S2 MB · S3 · Total GHG LB · Intensity (tCO2e/1,000 units) · Renewable % · Risk tier · Regulatory flag
Regulatory flags: CBAM (Wrocław) · RPO mandate (Chennai) · Grid instability (Hanoi) · Solar opportunity (Guadalajara)
Row click → expand facility drill-down card inline below the row.

**Facility drill-down card:**
- Header: name · country · output (units/yr) · employees · risk badge
- Emissions: S1 stationary · S1 mobile · S2 LB · S2 MB · S3 total — tCO2e + % of facility total · mini donut
- Energy: total MWh · fossil thermal · grid · renewable · RE%
- Key risk callout: facility-specific regulatory/operational risk
- Active projects: filtered from Net Zero Projects data by Primary Facilities field

**Production volumes — constants file (not in xlsx, add as `src/constants/productionVolumes.js`):**
Hanoi: 25,000,000 · Guadalajara: 10,000,000 · Shenzhen: 60,000,000 · Wrocław: 5,000,000 · Chennai: 35,000,000

---

### M4 — Energy Mix & Renewable Progress

**Audience:** Sustainability | **Sources:** `Energy Mix` + `Scope 2 — Detail`

**Stacked horizontal bar chart per facility (Recharts BarChart, layout="vertical"):**
Segments: Natural gas (MWh eq.) · Diesel stationary · LPG · Grid electricity · Renewable electricity

Data from `Energy Mix` sheet:
| Facility | Gas | Diesel | LPG | Grid | RE | Total |
|---|---|---|---|---|---|---|
| Hanoi Hub | 29,540 | 0 | 1,572 | 50,000 | 8,000 | 89,112 |
| Guadalajara | 14,770 | 0 | 786 | 50,000 | 22,000 | 87,556 |
| Shenzhen | 36,925 | 0 | 1,048 | 88,000 | 6,000 | 131,973 |
| Wrocław | 20,045 | 0 | 2,882 | 22,000 | 9,000 | 53,927 |
| Chennai | 12,660 | 7,908 | 524 | 37,000 | 4,000 | 62,092 |

Chennai diesel segment: #C0392B colour + tooltip "Grid instability root cause — 680 tCO2e stationary diesel."

**Renewable % gauges (Recharts RadialBarChart, one per facility + corporate total):**
Values from `Scope 2 — Detail` % Renewable column.
- Guadalajara 30.6% · Wrocław 29.0% · Hanoi 13.8% · Chennai 9.8% · Shenzhen 6.4% · Corporate 16.55%
- Colour: ≥25% → #2E7D32 · 10–25% → Stone · <10% → #C0392B
- Reference lines at 25% (India RPO 2030) and 100% (net-zero target)
- Below each gauge: max additional reduction if 100% RE (LB − MB delta from Scope 2 Detail)

**Fossil dependency summary card:**
- Total fossil thermal: 128,660 MWh eq. — 30.3% of total energy (from Energy Mix TOTAL row)
- By fuel: Natural gas 113,940 (88.6%) · Diesel 7,908 (6.1%) · LPG 6,812 (5.3%)
- S1 reduction levers: from Net Zero Projects data, filtered to Scope 1 & 2 levers

**LB vs MB delta bar chart (Recharts BarChart):**
Per facility: LB − MB = tCO2e avoided through current RE coverage. Data from `Scope 2 — Detail`.
| Facility | LB | MB | Avoided |
|---|---|---|---|
| Guadalajara | 32,688 | 22,700 | 9,988 |
| Wrocław | 22,506 | 15,972 | 6,534 |
| Hanoi | 28,629 | 24,680 | 3,949 |
| Shenzhen | 54,614 | 51,128 | 3,486 |
| Chennai | 29,028 | 26,196 | 2,832 |
Second bar segment (lighter fill) showing remaining gap to 100% RE.

---

### M5 — Scope 3 Category Breakdown

**Audience:** Sustainability | **Source:** `Scope 3 — Detail`

**Category bar chart (Recharts BarChart, horizontal, ranked descending by TOTAL):**
Order: Cat 1: 728,500 · Cat 11: 320,000 · Cat 4: 132,900 · Cat 9: 59,900 · Cat 12: 47,800 · Cat 2: 51,200 · Cat 3: 27,600 · Cat 7: 20,200 · Cat 5: 7,020 · Cat 8: 2,800 · Cat 6: 2,530 · Cat 13: 1,110
Cat 10, 14, 15 = 0, shown as collapsed zero rows.
Upstream/downstream divider (Cat 8 / Cat 9 boundary): "Upstream: 974,850 tCO2e" · "Downstream: 426,710 tCO2e"
Lever indicator icons on Cat 1, Cat 3, Cat 4 bars.
Cat 11 bar label: "No lever — R&D required" in #C0392B.

**Per-facility stacked bar (Recharts BarChart, stacked):**
One bar per category, stacked by the 5 facility columns from `Scope 3 — Detail`.
Facility colours: Shenzhen (Ink) · Chennai · Hanoi · Guadalajara · Wrocław (graduated within brand palette).
Click facility legend → isolates that facility's contribution across all categories.

**Click-to-isolate interaction:**
Click any category bar → others dim → metric cards update:
- Selected category tCO2e · % of total S3 · dominant facility · lever name + status (matched from Net Zero Projects) · max abatement of matched lever
- If no lever: "No lever in current portfolio — R&D workstream required."

---

### M6 — Emission Intensity & Efficiency

**Audience:** Sustainability | **Sources:** `Master Summary` + `Energy Mix` + `src/constants/productionVolumes.js`

**Info banner:**
"Production volumes: Hanoi 25M · Guadalajara 10M · Shenzhen 60M · Wrocław 5M · Chennai 35M. Source: The Corporate Assets document. Add to xlsx to automate intensity calculation."

**Radar chart (Recharts RadarChart, two overlaid polygons):**
- tCO2e / 1,000 units: Total GHG LB ÷ output volume (thousands) per facility
  - Shenzhen 10.2 · Chennai 10.2 · Hanoi 10.5 · Wrocław 23.2 · Guadalajara 24.9
- MWh / 1,000 units: Total Energy ÷ output volume (thousands) per facility
  - Shenzhen 2.2 · Chennai 1.8 · Hanoi 3.6 · Wrocław 10.8 · Guadalajara 8.8

**YoY efficiency tracker (5 facility cards):**
Each card: facility name · current intensity · prior year: "—" · Δ: "—" · status: "Baseline — tracking begins 2024."
Priority callout at bottom: Wrocław (23.2) and Guadalajara (24.9) are 2× the high-volume sites — primary improvement targets. Levers: Industrial Heat Pumps + HVAC Optimisation.

---

### M7 — Net Zero Project Tracker

**Audience:** Both | **Source:** `Net Zero Projects`

**Live indicator:** Pulsing Acid Lime dot in topbar.

**Alert banner:**
"Status field is updated manually in the dashboard. All other values are locked to the source xlsx. Changes are stored locally in this browser and are not written back to the file."

**Portfolio KPI strip (4 cards — from Net Zero Projects portfolio summary block):**
- Total approved CAPEX (W1+W2): $17.5M · OPEX saving: $5.06M/yr
- W1 approved abatement: 168,000 tCO2e (projects 1, 5, 6: Logistics Modal Shift + Smart BMS + Solar)
- Portfolio coverage: (685,000 + 458,808) ÷ 4,588,079 = 24.9%
- Remaining gap: 3,494,271 tCO2e — displayed in #C0392B, prominent

**DAC callout (Acid Lime Pattern B — 2px lime left border on Ink background):**
"168,000 tCO2e approved in W1 = $33.6M DAC liability avoided at $200/t."

**Project register table (sortable, with editable Status dropdown per row):**
Columns: # · Project name · Scope(s) · Wave · Status · Max abatement (tCO2e) · CAPEX ($M) · MAC ($/t) · OPEX saving ($M/yr) · Start year · Target completion · Primary facilities

Status colour coding:
- Approved → Ink background, Lime text (correct lime usage on black surface)
- In Planning → Stone, Ink text
- Not Started → Chalk, Stone text
- Watch → #E67E22, white text
- Deferred → Chalk, Stone text

Wave headers: collapsible sections. Wave 1 default open. Waves 2–4 collapsed.
Sortable columns: MAC · Max abatement · CAPEX · Status · Wave.

**All 14 projects (exact values from xlsx `Net Zero Projects` sheet):**

Wave 1 — 2025–2027:
1. Logistics Modal Shift — Air to Sea · Scope 3 · Approved · 90,000 tCO2e · $0M · −$30/t · $2.7M/yr · 2025–2027 · Shenzhen Systems, Chennai Circuitry
2. LED Retrofit & Lighting Controls · Scope 1 & 2 · In Planning · 15,000 tCO2e · $0.45M · −$45/t · $0.68M/yr · 2025–2026 · All 5 facilities
3. Compressed Air Leak Detection · Scope 1 & 2 · Not Started · 12,000 tCO2e · $0.15M · −$65/t · $0.78M/yr · 2025–2026 · Hanoi Hub, Shenzhen Systems, Chennai Circuitry
4. HVAC Optimisation & AI Sensors · Scope 1 & 2 · In Planning · 25,000 tCO2e · $1.2M · −$25/t · $0.63M/yr · 2025–2027 · Guadalajara Gigafactory, Shenzhen Systems
5. Smart Building Management System · Scope 1 & 2 · Approved · 33,000 tCO2e · $2.1M · −$15/t · $0.5M/yr · 2025–2027 · All 5 facilities
6. On-site Rooftop Solar PV · Scope 2 · Approved · 45,000 tCO2e · $5.4M · $5/t · −$0.3M/yr · 2025–2027 · Guadalajara Gigafactory (priority), Chennai Circuitry, Hanoi Hub
7. Electric Forklift Fleet Transition · Scope 1 · Not Started · 10,000 tCO2e · $1.2M · $15/t · $0.12M/yr · 2026–2027 · Shenzhen Systems, Hanoi Hub

Wave 2 — 2028–2032:
8. Off-site Virtual PPA — Wind / Solar · Scope 2 · In Planning · 70,000 tCO2e · $0M · $20/t · −$0.4M/yr · 2028–2032 · Shenzhen Systems (priority), Wrocław Precision
9. Supplier Energy Efficiency Program · Scope 3 · Not Started · 75,000 tCO2e · $0.5M · $25/t · $0/yr · 2028–2032 · All facilities — procurement-led
10. Bio-based Polymers for Packaging · Scope 3 · Not Started · 80,000 tCO2e · $0M · $55/t · $0/yr · 2028–2032 · Shenzhen Systems, Hanoi Hub
11. 90% Recycled Aluminium Sourcing · Scope 3 · In Planning · 140,000 tCO2e · $0M · $80/t · $0/yr · 2028–2032 · Wrocław Precision (primary), Shenzhen Systems
12. Industrial Heat Pumps · Scope 1 · Not Started · 35,000 tCO2e · $6.5M · $85/t · $0.35M/yr · 2028–2032 · Wrocław Precision, Guadalajara Gigafactory

Wave 3 — 2033–2040:
13. Supplier Renewable Energy Mandate (SBTi) · Scope 3 · Watch · 55,000 tCO2e · $0M · $100/t · $0/yr · 2033–2040 · All facilities — Tier 1 & Tier 2 suppliers

Wave 4 — 2040–2045 (DAC — Last Resort, Board approval required):
14. Permanent Carbon Removals — DAC · Removals · Not Started · 458,808 tCO2e · ceiling $91.8M · $200/t · $0/yr · 2041–2045 · Corporate-level

**Financial framing card:**
- CAPEX by wave stacked bar: W1 $10.5M · W2 $7.0M · W3 $0 · W4 ceiling $91.8M
- OPEX: W1 $5.11M/yr · W2 −$0.05M/yr (net neutral)
- Payback W1 only: 2.1 years
- Cheapest negative-MAC lever: Compressed Air Leak Detection at −$65/t

**SBTi guardrail alert flags (4 flags):**
- DAC cap: Contracted 0 / Cap 458,808 / Headroom 458,808 → Green
- 2030 gate: Target 784,217 / W1 approved 168,000 (22%) → Red · "W1 alone insufficient — full W1 deployment + W2 acceleration required"
- Facility miss protocol: >15% annual miss → COO remediation 60 days → Grey · "Monitoring begins 2024"
- Portfolio miss: >8% cumulative miss → emergency review 30 days → Grey · "Tracking begins 2024"

---

## Brand & Visual Direction

Reference `the-corporate-brand/SKILL.md` for all visual decisions. Key rules for Claude Code:

- Colors: Ink (#000000) · Stone (#B6B09F) · Linen (#EAE4D5) · Chalk (#F2F2F2) · White (#FFFFFF) · Acid Lime (#C8F135)
- Acid Lime: max 2 uses per page/module, always on Ink (#000000) background. Never decorative. Sidebar active item counts as one use globally.
- Fonts: Playfair Display 700 for display headlines/KPI values · DM Sans 300 for body/labels · DM Sans 500 for emphasis
- Square corners on all structural elements — border-radius: 0 everywhere
- No drop shadows — 0.5px hairline borders for depth
- No gradients
- Danger/error: #C0392B text only. Success: #2E7D32 text only.
- Chart series must use brand palette — no default Recharts blues/greens/purples

---

## Stack

- **Framework:** React + Vite
- **Charts:** Recharts
- **Styling:** The Corporate brand CSS custom properties (loaded via `src/styles/brand.css`, imported in `main.jsx`)
- **Data layer:** Netlify Functions (Node.js), `xlsx` npm package (SheetJS)
- **Deployment:** Netlify
- **Version control:** GitHub required

---

## Suggested File Structure

```
the-corporate-dashboard/
├── data/
│   └── TheCorporate_Emissions_Energy_2023-ver3.xlsx   ← committed to repo
├── netlify/
│   └── functions/
│       ├── master-summary.js
│       ├── scope1.js
│       ├── scope2.js
│       ├── scope3.js
│       ├── energy-mix.js
│       └── projects.js
├── src/
│   ├── constants/
│   │   └── productionVolumes.js   ← Hanoi 25M, Guadalajara 10M, etc.
│   ├── context/
│   │   └── FilterContext.jsx      ← global filter state (facility, scope, S2 method, year)
│   ├── hooks/
│   │   └── useModuleData.js       ← shared fetch + loading/error state pattern
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── GlobalFilters.jsx
│   │   ├── shared/
│   │   │   ├── KPICard.jsx
│   │   │   ├── ChartCard.jsx
│   │   │   ├── StatusPill.jsx
│   │   │   ├── AlertBanner.jsx
│   │   │   ├── SectionLabel.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   └── modules/
│   │       ├── M1Trajectory.jsx
│   │       ├── M2GHGSummary.jsx
│   │       ├── M3FacilityMap.jsx
│   │       ├── M4EnergyMix.jsx
│   │       ├── M5Scope3.jsx
│   │       ├── M6Intensity.jsx
│   │       └── M7Projects.jsx
│   ├── styles/
│   │   └── brand.css              ← TC CSS custom properties block
│   ├── App.jsx
│   └── main.jsx
├── netlify.toml
├── vite.config.js
└── package.json
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  functions = "netlify/functions"
  targetPort = 5173
```

---

## Out of Scope — Phase 2

- Write-back from dashboard to xlsx (status changes are localStorage only at launch)
- Multi-year reporting year selector (locked to 2023 — expands when a second year is committed)
- Mobile responsive layout (desktop-first)
- Export to PDF or Excel
- User authentication or role-based access
- Facility intensity auto-calculation from xlsx (production volumes in constants until xlsx is updated)

---

## Open Questions for Claude Code

1. **MAC waterfall chart (M1):** Recharts BarChart uses uniform bar widths. The MAC waterfall requires bar width ∝ abatement volume and Y position = MAC value. Choose between: (a) custom SVG rendering, (b) Recharts ComposedChart with custom bar shapes. Determine approach and note trade-offs before implementing M1.

2. **World map (M3):** The prototype uses simplified SVG rectangle approximations. For production evaluate: (a) react-simple-maps (lightweight, no full D3 required, 5 pins at fixed coordinates), (b) static SVG world map asset with pins overlaid. The map shows 5 pins only — not a choropleth — so full GeoJSON/D3 is not needed.

3. **xlsx path in Netlify Functions:** In Netlify's function runtime, use `path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')` and verify the path resolves correctly with `netlify dev` locally before deploying.

4. **Scope filter behaviour on M5:** M5 shows only Scope 3 data. The global scope filter (S1/S2/S3) has no effect on M5. When scope filter is set to S1 or S2 only, display a muted label below the filter bar: "Scope 3 data shown regardless of scope filter selection."

5. **M7 localStorage schema:** Key: `tc_project_status`. Value: `{ "1": "Approved", "3": "In Planning", ... }` keyed by project number string. On load: merge xlsx statuses (base) with localStorage overrides (localStorage wins per key). Reset button clears the entire key.
