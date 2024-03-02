function convertToChartData(dataSet) {
  // -- data must be within a year
  // -- need precise categories
  const whiteSales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const blackSales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  dataSet.forEach((data) => {
    let whiteAmount = 0
    let blackAmount = 0
    data.goodInfo.forEach((info) => {
      if (info.type.split('/')[0] === 'b') {
        blackAmount += parseInt(info.charge)
      } else {
        whiteAmount += parseInt(info.charge)
      }
    })
    const month = parseInt(data.createdOn.split('-')[1]) - 1
    whiteSales[month] = whiteSales[month] + whiteAmount
    blackSales[month] = blackSales[month] + blackAmount
  })
  return [whiteSales, blackSales]
}
// under construction

// const [whitSalesData, blackSalesData] = convertToChartData(vouchers)

function getYearlySalesData(config) {
  return {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'April',
      'May',
      'June',
      'July',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'White Sales',
        data: whitSalesData,
        borderColor: 'rgba(246, 255, 0, 0.6)',
        backgroundColor: 'rgba(246, 255, 0, 0.6)',
        ...config.datasetsConf,
      },
      {
        label: 'Black Sales',
        data: blackSalesData,
        borderColor: 'rgba(0, 60, 255, 0.6)',
        backgroundColor: 'rgba(0, 60, 255, 0.6)',
        ...config.datasetsConf,
      },
    ],
  }
}
