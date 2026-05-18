const path = require('path')
const XLSX = require('xlsx')

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Energy Mix']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const facilityNames = [
      'Hanoi Hub',
      'Guadalajara Gigafactory',
      'Shenzhen Systems',
      'Wrocław Precision',
      'Chennai Circuitry',
    ]

    // rows[0] = title, rows[1] = column headers
    // rows[2–6] = facility data, rows[7] = TOTAL
    const facilities = rows.slice(2, 7).map((row, i) => ({
      name: row[0] || facilityNames[i],
      gas: Number(row[1]) || 0,
      diesel: Number(row[2]) || 0,
      lpg: Number(row[3]) || 0,
      grid: Number(row[4]) || 0,
      renewable: Number(row[5]) || 0,
      total: Number(row[6]) || 0,
    }))

    const totalRow = rows[7] || []
    const total = {
      gas: Number(totalRow[1]) || 0,
      diesel: Number(totalRow[2]) || 0,
      lpg: Number(totalRow[3]) || 0,
      grid: Number(totalRow[4]) || 0,
      renewable: Number(totalRow[5]) || 0,
      total: Number(totalRow[6]) || 0,
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
