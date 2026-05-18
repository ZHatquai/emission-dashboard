const path = require('path')
const XLSX = require('xlsx')

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Scope 2 — Detail']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const facilityNames = [
      'Hanoi Hub',
      'Guadalajara Gigafactory',
      'Shenzhen Systems',
      'Wrocław Precision',
      'Chennai Circuitry',
    ]

    // rows[0] = title, rows[1] = column headers
    // rows[2] = blank or sub-header
    // rows[3–7] = facility data, rows[8] = TOTAL
    const facilities = rows.slice(3, 8).map((row, i) => ({
      name: row[0] || facilityNames[i],
      lb: Number(row[1]) || 0,
      mb: Number(row[2]) || 0,
      renewableMWh: Number(row[3]) || 0,
      totalMWh: Number(row[4]) || 0,
      renewablePct: Number(row[5]) || 0,
      lbMbDelta: Number(row[1] - row[2]) || 0,
    }))

    const totalRow = rows[8] || []
    const total = {
      lb: Number(totalRow[1]) || 0,
      mb: Number(totalRow[2]) || 0,
      renewableMWh: Number(totalRow[3]) || 0,
      totalMWh: Number(totalRow[4]) || 0,
      renewablePct: Number(totalRow[5]) || 0,
      lbMbDelta: Number(totalRow[1] - totalRow[2]) || 0,
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ facilities, total }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
