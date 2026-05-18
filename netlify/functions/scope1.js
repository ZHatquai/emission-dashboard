const path = require('path')
const XLSX = require('xlsx')

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Scope 1 — Detail']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const facilityNames = [
      'Hanoi Hub',
      'Guadalajara Gigafactory',
      'Shenzhen Systems',
      'Wrocław Precision',
      'Chennai Circuitry',
    ]

    // rows[0] = title, rows[1] = group headers (Stationary/Mobile), rows[2] = column sub-headers
    // rows[3–7] = facility data, rows[8] = TOTAL
    const facilities = rows.slice(3, 8).map((row, i) => ({
      name: row[0] || facilityNames[i],
      stationary: Number(row[1]) || 0,
      mobile: Number(row[2]) || 0,
      total: Number(row[3]) || 0,
    }))

    const totalRow = rows[8] || []
    const total = {
      stationary: Number(totalRow[1]) || 0,
      mobile: Number(totalRow[2]) || 0,
      total: Number(totalRow[3]) || 0,
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
