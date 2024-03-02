const tHeader = {
  headers: [
    { text: 'Type' },
    { text: 'Amount' },
    { text: 'Rate' },
    { text: 'Charge' },
  ],
}

function convertToTBDataNTotalAmount(data = []) {
  const tBodyRows = []
  let totalCharge = 0
  data.forEach((row) => {
    const rowData = []
    for (const [k, v] of Object.entries(row)) {
      if (k === 'charge') {
        totalCharge += parseInt(v)
      }
      rowData.push({ text: v })
    }
    tBodyRows.push({ data: rowData })
  })
  return [totalCharge, tBodyRows]
}

export { tHeader, convertToTBDataNTotalAmount }
