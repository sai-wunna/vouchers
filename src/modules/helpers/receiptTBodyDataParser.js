import { goodTypeShortKeyToLabel } from '../state'

const tHeader = {
  headers: [
    { text: 'Type' },
    { text: 'Rate' },
    { text: 'Amount' },
    { text: 'Charge' },
  ],
}

function convertToTBDataNTotalAmount(data = []) {
  const tBodyRows = []
  let totalCharge = 0
  data.forEach((row) => {
    const rowData = []
    for (const [k, v] of Object.entries(row)) {
      let value = v
      if (k === 'charge') {
        totalCharge += Number(v)
      }
      if (k === 'type') {
        value = goodTypeShortKeyToLabel[v]
      }
      rowData.push({ text: isNaN(value) ? value : value.toLocaleString() })
    }
    tBodyRows.push({ data: rowData })
  })
  return [totalCharge, tBodyRows]
}

export { tHeader, convertToTBDataNTotalAmount }
