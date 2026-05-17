# The Corporate — Net Zero 2045 Command Dashboard

## What This Is
An internal 7-module emissions dashboard for The Corporate, displaying the 2023 GHG baseline,
net-zero trajectory, facility data, energy mix, Scope 3 breakdown, emission intensity, and
project tracker. Accessed by CEO and Sustainability team via a Netlify-hosted URL. No authentication.

## Commands
```
npm install          # install dependencies
npm run dev          # dev server (run via: netlify dev)
npm run build        # production build
netlify dev          # local dev with functions (required — use this, not npm run dev alone)
```

## Tech Stack
React + Vite · Recharts · Netlify Functions (Node.js + SheetJS/xlsx) · Deployed on Netlify via GitHub

## Project Structure
```
data/
  TheCorporate_Emissions_Energy_2023-ver3.xlsx   ← master data source, committed to repo
netlify/
  functions/
    master-summary.js · scope1.js · scope2.js · scope3.js · energy-mix.js · projects.js
src/
  constants/productionVolumes.js   ← facility output volumes (hardcoded until xlsx updated)
  context/FilterContext.jsx         ← global filter state
  hooks/useModuleData.js            ← shared fetch + loading/error pattern
  components/
    layout/    Sidebar.jsx · Topbar.jsx · GlobalFilters.jsx
    shared/    KPICard · ChartCard · StatusPill · AlertBanner · SectionLabel · LoadingSkeleton
    modules/   M1Trajectory · M2GHGSummary · M3FacilityMap · M4EnergyMix · M5Scope3 · M6Intensity · M7Projects
  styles/brand.css   ← TC CSS custom properties (imported in main.jsx)
  App.jsx · main.jsx
netlify.toml · vite.config.js · package.json
```

## Assets
`data/TheCorporate_Emissions_Energy_2023-ver3.xlsx` — 8-sheet master source. All dashboard
data originates here. Committed to repo. Updated file → redeploy → dashboard reflects new values.

## Brand
All visual decisions defer to `the-corporate-brand/SKILL.md`.

Hard rules — never override:
- Acid Lime (#C8F135) max 2 uses per module/page. Always on #000000 background only. Never decorative. Sidebar active state counts as one use globally.
- border-radius: 0 on all structural elements — buttons, cards, containers, inputs
- No drop shadows. No gradients. Use 0.5px hairline borders for depth only.
- Error/danger: #C0392B text only. Success: #2E7D32 text only. Never as fills.
- Chart series: brand palette only. No default Recharts blues, greens, or purples.

## Data
All values fetched at runtime from Netlify Functions reading the xlsx. No data hardcoded in
React components. One function per data domain — see sheet→function mapping in `docs/project-spec.md`.

Exception: facility production volumes are hardcoded in `src/constants/productionVolumes.js`
(Hanoi 25M · Guadalajara 10M · Shenzhen 60M · Wrocław 5M · Chennai 35M) until the xlsx is updated.

## Reference Docs
Claude reads these before building any module:
- `docs/project-spec.md` — full module specs, chart logic, exact data values, xlsx parsing rules per sheet, open architecture questions

## Business Rules
- S2 method defaults to Market-based. Never Location-based by default.
- Reporting year locked to 2023. Display as label only — no year selector.
- M7 status edits: localStorage only under key `tc_project_status`. Never written to xlsx. On load: merge xlsx base with localStorage overrides (localStorage wins per key). Reset button clears the entire key. Display label: "Local edits active — not saved to source file."
- M5 (Scope 3) ignores the global scope filter. Always shows Scope 3 data. When filter is set to S1 or S2 only, show muted label: "Scope 3 data shown regardless of scope filter selection."
- Facility filter default: All. Scope filter default: All scopes.
- Resolve before building M1: MAC waterfall approach — custom SVG vs. Recharts ComposedChart with custom bar shapes. Note trade-offs and decide.
- Resolve before building M3: World map approach — react-simple-maps vs. static SVG with 5 coordinate pins. Full D3/GeoJSON not needed.
- Verify xlsx path in Netlify Functions locally with `netlify dev` before deploying.

## Git & Deployment
- Version control: GitHub
- Deployment: Netlify (auto-deploys from main branch)
- Do not run git push, git clone, or git commit unless explicitly asked

## Out of Scope — Do Not Build
- Write-back from dashboard to xlsx (M7 status = localStorage only)
- Multi-year reporting year selector (2023 locked — expands in a future phase)
- Mobile responsive layout (desktop-first only)
- Export to PDF or Excel
- User authentication or role-based access
- Facility intensity auto-calculation from xlsx (use constants until xlsx is updated)
