import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Scope 3 — Detail']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const facilityNames = [
      'Hanoi Hub',
      'Guadalajara Gigafactory',
      'Shenzhen Systems',
      'Wrocław Precision',
      'Chennai Circuitry',
    ]

    // rows[0] = title, rows[1] = column headers
    // rows[2] = UPSTREAM divider — skip
    // rows[3–10] = upstream categories (Cat 1, 2, 3, 4, 5, 6, 7, 8)
    // rows[11] = DOWNSTREAM divider — skip
    // rows[12–18] = downstream categories (Cat 9, 10, 11, 12, 13, 14, 15)
    // rows[19] = TOTAL SCOPE 3

    const catNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    const upstreamRows = rows.slice(3, 11)   // 8 upstream cats
    const downstreamRows = rows.slice(12, 19) // 7 downstream cats
    const allCatRows = [...upstreamRows, ...downstreamRows]

    const categories = allCatRows.map((row, i) => {
      const catNum = catNumbers[i]
      const facilities = {}
      facilityNames.forEach((name, fi) => {
        facilities[name] = Number(row[fi + 1]) || 0
      })
      return {
        category: catNum,
        label: row[0] || `Category ${catNum}`,
        isUpstream: catNum <= 8,
        facilities,
        total: Number(row[6]) || 0,
      }
    })

    const totalRow = rows[19] || []
    const total = {
      upstream: 0,
      downstream: 0,
      grand: Number(totalRow[6]) || 0,
    }
    categories.forEach(c => {
      if (c.isUpstream) total.upstream += c.total
      else total.downstream += c.total
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ categories, total }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
