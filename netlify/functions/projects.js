import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Net Zero Projects']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    // rows[0] = title, rows[1] = column headers, rows[2] = blank
    // rows[3] = Wave 1 header, rows[4–10] = W1 projects (7 projects)
    // rows[11] = Wave 2 header, rows[12–16] = W2 projects (5 projects)
    // rows[17] = Wave 3 header, rows[18] = W3 project (1 project)
    // rows[19] = Wave 4 header, rows[20] = W4 project (1 project)
    // rows[21–22] = blank
    // rows[23–33] = portfolio summary block

    function parseProject(row, wave) {
      if (!row || !row[0]) return null
      return {
        id: Number(row[0]) || 0,
        name: row[1] || '',
        scopes: row[2] || '',
        wave,
        status: row[3] || 'Not Started',
        maxAbatement: Number(row[4]) || 0,
        capex: Number(row[5]) || 0,
        mac: Number(row[6]) || 0,
        opexSaving: Number(row[7]) || 0,
        startYear: Number(row[8]) || 0,
        targetCompletion: Number(row[9]) || 0,
        primaryFacilities: row[10] || '',
      }
    }

    const w1Projects = rows.slice(4, 11).map(r => parseProject(r, 1)).filter(Boolean)
    const w2Projects = rows.slice(12, 17).map(r => parseProject(r, 2)).filter(Boolean)
    const w3Projects = rows.slice(18, 19).map(r => parseProject(r, 3)).filter(Boolean)
    const w4Projects = rows.slice(20, 21).map(r => parseProject(r, 4)).filter(Boolean)

    const projects = [...w1Projects, ...w2Projects, ...w3Projects, ...w4Projects]

    // Portfolio summary block rows[23–33]
    const summaryRows = rows.slice(23, 34)
    const portfolioSummary = {}
    summaryRows.forEach(row => {
      if (row[0]) portfolioSummary[String(row[0]).trim()] = row[1]
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ projects, portfolioSummary }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
