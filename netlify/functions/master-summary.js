const path = require('path')
const XLSX = require('xlsx')

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, '../../data/TheCorporate_Emissions_Energy_2023-ver3.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets['Master Summary']
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const facilityNames = [
      'Hanoi Hub',
      'Guadalajara Gigafactory',
      'Shenzhen Systems',
      'Wrocław Precision',
      'Chennai Circuitry',
    ]

    // rows[0] = title, rows[1] = column headers
    // rows[2–6] = facility data, rows[7] = COMPANY TOTAL
    // rows[10–15] = KPI block
    const facilities = rows.slice(2, 7).map((row, i) => ({
      name: row[0] || facilityNames[i],
      country: row[1],
      scope1: Number(row[2]) || 0,
      scope1Stationary: Number(row[3]) || 0,
      scope1Mobile: Number(row[4]) || 0,
      scope2LB: Number(row[5]) || 0,
      scope2MB: Number(row[6]) || 0,
      scope3: Number(row[7]) || 0,
      totalGhgLB: Number(row[8]) || 0,
      totalGhgMB: Number(row[9]) || 0,
      renewablePct: Number(row[10]) || 0,
      riskTier: row[11] || '',
      regulatoryFlag: row[12] || '',
    }))

    const totalRow = rows[7] || []
    const companyTotal = {
      scope1: Number(totalRow[2]) || 0,
      scope1Stationary: Number(totalRow[3]) || 0,
      scope1Mobile: Number(totalRow[4]) || 0,
      scope2LB: Number(totalRow[5]) || 0,
      scope2MB: Number(totalRow[6]) || 0,
      scope3: Number(totalRow[7]) || 0,
      totalGhgLB: Number(totalRow[8]) || 0,
      totalGhgMB: Number(totalRow[9]) || 0,
      renewablePct: Number(totalRow[10]) || 0,
    }

    // KPI block rows[10–15]
    const kpiRows = rows.slice(10, 16)
    const kpi = {}
    kpiRows.forEach(row => {
      if (row[0]) kpi[String(row[0]).trim()] = row[1]
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ facilities, companyTotal, kpi }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
