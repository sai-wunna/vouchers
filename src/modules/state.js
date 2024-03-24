/* data.json
 {
    user :{
      company: 'Test Company',
      address: 'Far far away in the galaxy',
      phone: '09-007-007-007, 09-231-231-231',
      receiptThanks: 'Thanks For Your Choice'
    },
    appConfig: {
      starToChargeRatio: 10,
      currency: '$',
      receiptBgColor: '#6d9c99',
    },
    customers : [],
    vouchers : [],
    chartConfig : {},
    goodTypesData : [],
    paymentMethods : [],
    version : '',
    timePeriod : ''
  }
*/

const state = {
  user: {
    company: 'Test Company',
    address: 'Far far away in the galaxy',
    phone: '09-007-007-007, 09-231-231-231',
    receiptThanks: 'Thanks For Your Choice',
  },
  appConfig: {
    starToChargeRatio: 10,
    currency: '$',
    receiptBgColor: '#6d9c99',
  },
  chartConfig: {
    chartType: 'line',
    datasetsConf: {
      borderWidth: 1,
      tension: 0.5,
      pointRadius: 3,
      fill: 'origin',
    },
  },
  // under are standard assets
  availableReceiptBgColors: [
    '#729c6d',
    '#6d859c',
    '#9c6d6d',
    '#6d9c99',
    '#856d9c',
  ],
  voucherCurrentPage: 0,
  sortCustomersBy: 'stars',
  $editingVoucher: null, // doc node
  importedFileData: {
    totalVouchers: 0,
    totalCustomers: 0,
    version: '',
    timePeriod: '',
  },
}

const chartDataSets = {}
const salesTableData = {}
const customers = []
const vouchers = []

const goodTypesData = [
  {
    shortKey: 'KFC',
    type: 'Fried Chicken',
    borderColor: 'rgb(112, 97, 188)',
    bgColor: 'rgba(112, 97, 188,0.6)',
  },
  {
    shortKey: 'BB-tea',
    type: 'Bubble Tea',
    borderColor: 'rgb(206, 86, 86)',
    bgColor: 'rgba(206, 86, 86,0.6)',
  },
  {
    shortKey: 'Ch-Sandwich',
    type: 'Cheese Sandwich',
    borderColor: 'rgb(153, 154, 62)',
    bgColor: 'rgba(153, 154, 62,0.6)',
  },
]

const paymentMethods = [
  { shortKey: 'Cash', method: 'Cash Only' },
  { shortKey: 'Online Pay', method: 'Online pay' },
  { shortKey: 'semi-payment', method: 'Some Cash and some with pay' },
]

const monthNames = [
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
]

const goodTypes = []
const goodTypeShortKeyToLabel = {}

const baseSetupForChartDataSet = {}

// ------ handle goodTypes setup start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

function setUpGoodTypesDatasets() {
  // empty existed data
  goodTypes.splice(0, goodTypes.length)
  for (const key in goodTypeShortKeyToLabel) {
    delete goodTypeShortKeyToLabel[key]
  }
  for (const key in baseSetupForChartDataSet) {
    delete baseSetupForChartDataSet[key]
  }

  goodTypesData.forEach((typeInfo) => {
    const { type, shortKey, borderColor, bgColor } = typeInfo

    goodTypes.push(shortKey)
    goodTypeShortKeyToLabel[shortKey] = type

    baseSetupForChartDataSet[shortKey] = {
      borderColor,
      backgroundColor: bgColor,
    }
  })
}
// temporary
setUpGoodTypesDatasets()

// ------ handle goodTypes setup end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle vouchers start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

async function saveNewVoucher(data, totalCharge) {
  const id = vouchers.length + 1
  const newVoucher = { id, ...data }
  vouchers.unshift(newVoucher)

  await updateStarsOfCustomerOnCreateNewVoucher(data.customerId, totalCharge)
  await updateSalesTableDataWhenCreateNewVoucher(data, totalCharge)
  await updateChartDataWhenCreateNewVoucher(data)
  return id
}
// helper of upper one |
function updateStarsOfCustomerOnCreateNewVoucher(customerId, totalCharge) {
  const stars = Math.round(totalCharge / state.appConfig.starToChargeRatio)
  const customerIdx = customers.findIndex((cus) => cus.id === customerId)
  customers[customerIdx].stars += stars
}

function getAVoucher(vid) {
  const receipt = vouchers.find((vc) => vc.id === vid)
  const customer = customers.find((cus) => cus.id === receipt.customerId)
  return { receipt: { ...receipt }, customer: { ...customer } }
}

async function updateVoucher(data, totalCharge) {
  const id = Number(data.id)
  const idx = vouchers.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }
  const oldData = { ...vouchers[idx] }
  const newData = {
    ...data,
    customerId: oldData.customerId,
    name: oldData.name,
  }

  for (const [k, v] of Object.entries(data)) {
    vouchers[idx][k] = v
  }

  if (oldData.cancelled && newData.cancelled) {
    return newData
  }

  // update stars of customer
  await updateStarsOfCustomerOnUpdateVoucher(oldData, newData, totalCharge)
  await updateSalesTableDataWhenUpdateVoucher(oldData, newData, totalCharge)
  await updateChartDataWhenUpdateVoucher(oldData, newData)
  return newData
}
// | helper of upper one |
function updateStarsOfCustomerOnUpdateVoucher(oldData, newData, totalCharge) {
  const customerIdx = customers.findIndex(
    (cus) => cus.id === oldData.customerId
  )
  const customer = customers[customerIdx]

  const oldTotalCharge = oldData.goodInfo.reduce(
    (total, info) => total + info.charge,
    0
  )

  if (newData.cancelled !== oldData.cancelled) {
    if (newData.cancelled) {
      const stars = Math.round(
        oldTotalCharge / state.appConfig.starToChargeRatio
      )
      customer.stars -= stars
    } else {
      const stars = Math.round(totalCharge / state.appConfig.starToChargeRatio)
      customer.stars += stars
    }
    return
  }

  // math.round make conflict, so added this condition check
  if (oldTotalCharge !== totalCharge) {
    const stars = Math.round(
      (totalCharge - oldTotalCharge) / state.appConfig.starToChargeRatio
    )
    customer.stars += stars
  }
}

async function deleteVoucher(vid) {
  const id = Number(vid)
  const idx = vouchers.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }
  const voucher = { ...vouchers[idx] }
  vouchers.splice(idx, 1)
  if (!voucher.cancelled) {
    await updateStarsOfCustomerOnDeleteVoucher(voucher)
    await updateSalesTableDataWhenDeleteVoucher(voucher)
    await updateChartDataWhenDeleteVoucher(voucher)
  }
  return true
}
// | helper of upper one |
function updateStarsOfCustomerOnDeleteVoucher(voucher) {
  const customerIdx = customers.findIndex(
    (cus) => cus.id === voucher.customerId
  )
  const totalCharge = voucher.goodInfo.reduce(
    (total, info) => total + info.charge,
    0
  )
  const stars = Math.round(totalCharge / state.appConfig.starToChargeRatio)
  customers[customerIdx].stars -= stars
}

// ------- handle vouchers end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle customers start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

async function sortCustomersBy(type) {
  const sortingFunctions = {
    stars: (a, b) => b.stars - a.stars,
    favorite: (a, b) => {
      if (a.favorite && !b.favorite) {
        return -1 // `a` is favorite and `b` is not, so `a` comes first
      } else if (!a.favorite && b.favorite) {
        return 1 // `b` is favorite and `a` is not, so `b` comes first
      } else {
        return 0 // Both have the same favorite status, no change in order
      }
    },
    olderFirst: (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
    newerFirst: (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
  }

  return await customers.sort(sortingFunctions[type])
}

function getACustomerInfo(id) {
  return customers.find((cus) => cus.id === id)
}

function getCustomerAndHisVouchersById(id) {
  const customerData = customers.find((cus) => cus.id === id)
  const vouchersData = vouchers.filter((vc) => vc.customerId === id)
  return { customerData, vouchersData }
}

function saveNewCustomer(
  name,
  address = 'unknown',
  phone = [],
  createdOn,
  company = ''
) {
  const customer = {
    id: customers.length + 1,
    name,
    address,
    phone,
    createdOn,
    company,
    stars: 0,
  }
  customers.unshift(customer)
  return customer
}

function updateCustomer(updatedData) {
  const id = updatedData.id
  const idx = customers.findIndex((cus) => cus.id === id)
  const customer = customers[idx]

  if (customer.name !== updatedData.name) {
    vouchers.map((voucher) => {
      if (voucher.customerId === id) {
        voucher.name = updatedData.name
      }
    })
  }

  for (const [k, v] of Object.entries(updatedData)) {
    customer[k] = v
  }
  return true
}

function searchCustomer(query, type, limit = 10) {
  const key = query.toLowerCase()
  const results = []

  for (const customer of customers) {
    if (customer[type].toLowerCase().includes(key)) {
      results.push(customer)
    }
    if (results.length === limit) break
  }

  return results
}

function deleteCustomer(cusId) {
  try {
    const id = Number(cusId)
    const vouchersCount = vouchers.findIndex(
      (voucher) => voucher.customerId === id
    )
    const idx = customers.findIndex((cus) => cus.id === id)
    if (vouchersCount !== -1 || idx === -1) {
      return false
    }
    customers.splice(idx, 1)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

// ------- handle customers end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle salesTableData start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// under construction as amount is renamed to charge
function updateSalesTableDataWhenCreateNewVoucher(data, totalCharge) {
  const thisYear = salesTableData.thisYear

  if (!thisYear) {
    // this only happens in first time
    buildSalesTableData()
    return
  }

  const newGoodInfo = {}
  data.goodInfo.forEach((info) => {
    newGoodInfo[info.type] = { charge: info.charge }
  })

  const monthName = monthNames[Number(data.createdOn.split('-')[1]) - 1]

  const existedTableData = salesTableData[monthName]

  if (existedTableData) {
    existedTableData.total += totalCharge

    existedTableData.goodInfo.forEach((info) => {
      if (newGoodInfo[info.type]) {
        info.charge += newGoodInfo[info.type].charge
      }
    })

    existedTableData.goodInfo.forEach((info) => {
      info.percentage = Math.round((info.charge / existedTableData.total) * 100)
    })

    existedTableData.percentage = `${Math.round(
      (existedTableData.total / thisYear.total) * 100
    )}%`
  } else {
    const standardGoodInfo = {}
    goodTypes.forEach((type) => {
      standardGoodInfo[type] = 0
    })

    // store charge from newGoodInfo to standardGoodInfo
    for (const type in standardGoodInfo) {
      if (newGoodInfo[type]) {
        standardGoodInfo[type] = newGoodInfo[type].charge
      }
    }

    const newMonth = {
      goodInfo: [],
      total: totalCharge,
      percentage: `${Math.round(
        (totalCharge / (thisYear.total + totalCharge)) * 100
      )}%`,
    }

    for (const key in standardGoodInfo) {
      const charge = standardGoodInfo[key]
      newMonth.goodInfo.push({
        type: key,
        charge,
        percentage: Math.round((charge / totalCharge) * 100),
      })
    }

    salesTableData[monthName] = { ...newMonth }
  }

  // update thisYear
  thisYear.goodInfo.forEach((info) => {
    if (newGoodInfo[info.type]) {
      const charge = newGoodInfo[info.type].charge
      info.charge += charge
    }
  })

  thisYear.total += totalCharge

  thisYear.goodInfo.forEach((info) => {
    info.percentage = Math.round((info.charge / thisYear.total) * 100)
  })

  // update percentage for all periods as charge changed
  for (const [k, v] of Object.entries(salesTableData)) {
    const percentage = Math.round((v.total / thisYear.total) * 100)
    v.percentage = `${isNaN(percentage) ? 0 : percentage}%`
  }
}

function updateSalesTableDataWhenUpdateVoucher(
  oldData,
  newData,
  newTotalCharge
) {
  const tableData =
    salesTableData[monthNames[Number(oldData.createdOn.split('-')[1]) - 1]]
  const thisYear = salesTableData.thisYear

  const oldGoodInfo = {}
  let oldTotalCharge = 0

  oldData.goodInfo.forEach((info) => {
    const { type, charge } = info
    oldGoodInfo[type] = charge
    oldTotalCharge += charge
  })

  const newGoodInfo = {}

  newData.goodInfo.forEach((info) => {
    newGoodInfo[info.type] = info.charge
  })

  if (oldData.cancelled !== newData.cancelled) {
    if (newData.cancelled) {
      // minus old charges
      tableData.goodInfo.forEach((info) => {
        if (oldGoodInfo[info.type]) {
          info.charge -= oldGoodInfo[info.type]
        }
      })

      thisYear.goodInfo.forEach((info) => {
        if (oldGoodInfo[info.type]) {
          info.charge -= oldGoodInfo[info.type]
        }
      })

      tableData.total -= oldTotalCharge
      thisYear.total -= oldTotalCharge
    } else {
      // plus new charges
      tableData.goodInfo.forEach((info) => {
        if (newGoodInfo[info.type]) {
          info.charge += newGoodInfo[info.type]
        }
      })

      thisYear.goodInfo.forEach((info) => {
        if (newGoodInfo[info.type]) {
          info.charge += newGoodInfo[info.type]
        }
      })

      tableData.total += newTotalCharge
      thisYear.total += newTotalCharge
    }
  } else {
    // calculate gap between new and old data
    const gap = {}
    /*
  // sample 
  const old = { 'b/r/n' : 300000 , 'b/r/wn' : 450000 }
  const new = { 'b/r/wn' : 500000 , 'w/r/n'  : 500000 }

  */

    goodTypes.forEach((type) => {
      if (oldGoodInfo[type] && newGoodInfo[type]) {
        gap[type] = oldGoodInfo[type] - newGoodInfo[type]
      } else if (oldGoodInfo[type]) {
        gap[type] = oldGoodInfo[type]
      } else {
        gap[type] = -newGoodInfo[type]
      }
    })

    // gap calculation done

    tableData.goodInfo.forEach((info) => {
      if (gap[info.type]) {
        info.charge -= gap[info.type]
      }
    })

    thisYear.goodInfo.forEach((info) => {
      if (gap[info.type]) {
        info.charge -= gap[info.type]
      }
    })

    const gapCharge = oldTotalCharge - newTotalCharge
    tableData.total -= gapCharge
    thisYear.total -= gapCharge
  }

  tableData.goodInfo.forEach((info) => {
    const percentage = Math.round((info.charge / tableData.total) * 100)
    info.percentage = isNaN(percentage) ? 0 : percentage
  })

  thisYear.goodInfo.forEach((info) => {
    info.percentage = Math.round((info.charge / thisYear.total) * 100)
  })
  // update percentage for all periods as charge changed
  for (const [k, v] of Object.entries(salesTableData)) {
    const percentage = Math.round((v.total / thisYear.total) * 100)
    v.percentage = `${isNaN(percentage) ? 0 : percentage}%`
  }
}

function updateSalesTableDataWhenDeleteVoucher(voucher) {
  const monthName = monthNames[Number(voucher.createdOn.split('-')[1]) - 1]
  const tableData = salesTableData[monthName]
  const thisYear = salesTableData.thisYear

  const deletedGoodInfo = {}
  let totalCharge = 0
  voucher.goodInfo.forEach((info) => {
    const { type, charge } = info
    deletedGoodInfo[type] = charge
    totalCharge += charge
  })

  tableData.goodInfo.forEach((info) => {
    if (deletedGoodInfo[info.type]) {
      info.charge -= deletedGoodInfo[info.type]
    }
  })
  tableData.total -= totalCharge

  thisYear.goodInfo.forEach((info) => {
    if (deletedGoodInfo[info.type]) {
      info.charge -= deletedGoodInfo[info.type]
    }
  })
  thisYear.total -= totalCharge

  tableData.goodInfo.forEach((info) => {
    const percentage = Math.round((info.charge / tableData.total) * 100)
    info.percentage = isNaN(percentage) ? 0 : percentage
  })

  for (const [k, v] of Object.entries(salesTableData)) {
    const percentage = Math.round((v.total / thisYear.total) * 100)
    v.percentage = `${isNaN(percentage) ? 0 : percentage}%`
  }
}

function buildSalesTableData() {
  // empty, so can refresh
  for (const key in salesTableData) {
    delete salesTableData[key]
  }

  const thisYear = {}
  let thisYearTotalCharge = 0

  let prevMonthName = ''
  const currentMonth = {}
  let currentMonthTotalCharge = 0

  goodTypes.forEach((type) => {
    thisYear[type] = 0
    currentMonth[type] = 0
  })

  vouchers.toReversed().forEach((voucher, index) => {
    if (voucher.cancelled) return

    const month = monthNames[Number(voucher.createdOn.split('-')[1]) - 1]

    if (!salesTableData[month]) {
      salesTableData[month] = { percentage: '', goodInfo: [], total: 0 }

      if (prevMonthName) {
        for (const [type, charge] of Object.entries(currentMonth)) {
          salesTableData[prevMonthName].goodInfo.push({
            type,
            charge,
            percentage: Math.round((charge / currentMonthTotalCharge) * 100),
          })
          currentMonth[type] = 0
        }
        salesTableData[prevMonthName].total = currentMonthTotalCharge
        currentMonthTotalCharge = 0
      }
      prevMonthName = month
    }

    voucher.goodInfo.forEach((info) => {
      const charge = info.charge
      currentMonth[info.type] += charge
      currentMonthTotalCharge += charge

      thisYear[info.type] += charge
      thisYearTotalCharge += charge
    })

    if (index === vouchers.length - 1) {
      for (const [type, charge] of Object.entries(currentMonth)) {
        salesTableData[prevMonthName].goodInfo.push({
          type,
          charge,
          percentage: Math.round((charge / currentMonthTotalCharge) * 100),
        })
      }
      salesTableData[prevMonthName].total = currentMonthTotalCharge
    }
  })

  for (const key in salesTableData) {
    salesTableData[key].percentage = `${Math.round(
      (salesTableData[key].total / thisYearTotalCharge) * 100
    )}%`
  }

  salesTableData.thisYear = {
    percentage: '100%',
    total: thisYearTotalCharge,
    goodInfo: [
      ...Object.entries(thisYear).map(([type, charge]) => {
        const percentage = Math.round((charge / thisYearTotalCharge) * 100)
        return {
          type,
          charge,
          percentage: isNaN(percentage) ? 0 : percentage,
        }
      }),
    ],
  }
}

// ------- handle salesTableData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle chartData start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

async function updateChartDataWhenCreateNewVoucher(voucher) {
  const [year, month, day] = voucher.createdOn
    .split('-')
    .map((one) => Number(one))

  const goodInfo = {}

  voucher.goodInfo.forEach(({ type, charge }) => {
    goodInfo[type] = charge
  })

  const monthName = monthNames[Number(month) - 1]
  const existedChart = chartDataSets[monthName]

  if (existedChart) {
    existedChart.datasets.forEach((dataset) => {
      const charge = goodInfo[dataset.label]
      if (charge) {
        dataset.data[day - 1] += charge
      }
    })
  } else {
    chartDataSets[monthName] = buildMonthChartData([voucher])
  }

  // update this year chart ( easiest and fastest way )
  await buildForThisYearChartData()
}

async function updateChartDataWhenUpdateVoucher(oldData, newData) {
  const [year, month, day] = oldData.createdOn
    .split('-')
    .map((one) => Number(one))

  const existedChart = chartDataSets[monthNames[Number(month) - 1]]

  const oldGoodInfo = {}

  oldData.goodInfo.forEach((info) => {
    const { type, charge } = info
    oldGoodInfo[type] = charge
  })

  const newGoodInfo = {}

  newData.goodInfo.forEach((info) => {
    const { type, charge } = info
    newGoodInfo[type] = charge
  })

  if (oldData.cancelled !== newData.cancelled) {
    if (newData.cancelled) {
      // minus old data
      existedChart.datasets.forEach((dataset) => {
        const charge = oldGoodInfo[dataset.label]
        if (charge) {
          dataset.data[day - 1] -= charge
        }
      })
    } else {
      // plus new data
      existedChart.datasets.forEach((dataset) => {
        const charge = newGoodInfo[dataset.label]

        if (charge) {
          dataset.data[day - 1] += charge
        }
      })
    }
  } else {
    // find gap and update
    const gap = {}
    /*
      // sample 
      const old = { 'b/r/n' : 300000 , 'b/r/wn' : 450000 }
      const new = { 'b/r/wn' : 500000 , 'w/r/n'  : 500000 }
    */

    goodTypes.forEach((type) => {
      if (oldGoodInfo[type] && newGoodInfo[type]) {
        gap[type] = oldGoodInfo[type] - newGoodInfo[type]
      } else if (oldGoodInfo[type]) {
        gap[type] = oldGoodInfo[type]
      } else {
        gap[type] = -newGoodInfo[type]
      }
    })

    existedChart.datasets.forEach((dataset) => {
      const charge = gap[dataset.label]
      if (charge) {
        dataset.data[day - 1] -= charge
      }
    })
  }

  // update this year chart ( easiest and fastest way )
  await buildForThisYearChartData()
}

async function updateChartDataWhenDeleteVoucher(voucher) {
  const [year, month, day] = voucher.createdOn
    .split('-')
    .map((one) => Number(one))

  const goodInfo = {}

  voucher.goodInfo.forEach(({ type, charge }) => {
    goodInfo[type] = charge
  })

  const monthName = monthNames[Number(month) - 1]
  const existedChart = chartDataSets[monthName]

  existedChart.datasets.forEach((dataset) => {
    const charge = goodInfo[dataset.label]
    if (charge) {
      dataset.data[day - 1] -= charge
    }
  })

  // update this year chart ( easiest and fastest way )
  await buildForThisYearChartData()
}

// provided by chatgpt -
function deepCopy(obj) {
  // Check if obj is null or not an object
  if (obj === null || typeof obj !== 'object') {
    return obj // Return the original value if it's not an object
  }

  // Create an empty object/array to store the copied properties
  const newObj = Array.isArray(obj) ? [] : {}

  // Iterate over each property in the object
  for (let key in obj) {
    // Check if the property is an own property (not inherited)
    if (obj.hasOwnProperty(key)) {
      // Recursively copy nested objects/arrays
      newObj[key] = deepCopy(obj[key])
    }
  }

  return newObj
}

function getChartData(period) {
  const data = chartDataSets[period]
  if (!data) {
    return false
  }
  const chartData = deepCopy(data)
  chartData.datasets.forEach((set, index) => {
    set.label = goodTypeShortKeyToLabel[set.label]
    chartData.datasets[index] = {
      ...set,
      ...state.chartConfig.datasetsConf,
    }
  })

  return chartData
}

// monthly data chart start -------------------------------------------------

function getDaysArray(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  const daysInMonth = new Date(year, month, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return daysArray
}

function buildMonthlyChartData() {
  const possibleDatasets = convertToMonthlyDataSets(vouchers.toReversed())

  for (const [k, v] of Object.entries(possibleDatasets)) {
    chartDataSets[k] = buildMonthChartData(v)
  }

  return true
}

function buildMonthChartData(data) {
  const labels = getDaysArray(data[0].createdOn)
  const altDatasets = {}
  goodTypes.forEach((type) => {
    altDatasets[type] = Array.from({ length: labels.length }, () => 0)
  })

  data.forEach((voucher) => {
    if (voucher.cancelled) {
      return
    }
    const currentDay = Number(voucher.createdOn.split('-')[2]) - 1
    voucher.goodInfo.forEach((info) => {
      altDatasets[info.type][currentDay] += info.charge
    })
  })

  const chartData = { labels, datasets: [] }

  for (const [k, v] of Object.entries(altDatasets)) {
    chartData.datasets.push({
      data: [...v],
      label: k,
      backgroundColor: baseSetupForChartDataSet[k].backgroundColor,
      borderColor: baseSetupForChartDataSet[k].borderColor,
    })
  }
  return chartData
}

function convertToMonthlyDataSets(data) {
  const datasets = {}

  let currentMonth = ''

  for (const voucher of data) {
    if (voucher.cancelled) {
      continue
    }
    const month = monthNames[Number(voucher.createdOn.split('-')[1]) - 1]
    if (month === currentMonth) {
      datasets[currentMonth].push(voucher)
    } else {
      currentMonth = month
      datasets[currentMonth] = [voucher]
    }
  }

  return datasets
}

// monthly data chart done -------------------------------------------------

// build customer and total data chart start -------------------------------

function buildCustomerChartData(vouchers) {
  const chartData = buildTotalChartData(vouchers)

  chartData.datasets.forEach((set, index) => {
    set.label = goodTypeShortKeyToLabel[set.label]
    chartData.datasets[index] = {
      ...set,
      ...state.chartConfig.datasetsConf,
    }
  })

  return chartData
}

function buildTotalChartData(vouchers) {
  const labels = []
  const chartData = { labels, datasets: [] }

  if (vouchers.length < 12) {
    return chartData
  }

  const possibleColumnsDataSet = buildTotalChartDataSet(vouchers.toReversed())

  const altDatasets = {}

  goodTypes.forEach((type) => {
    altDatasets[type] = Array.from(
      { length: possibleColumnsDataSet.length },
      () => 0
    )
  })

  possibleColumnsDataSet.forEach((dataSet, index) => {
    const labelIdx = Math.round(dataSet.length / 2)
    const label =
      dataSet[labelIdx]?.createdOn || dataSet[labelIdx - 1].createdOn
    labels.push(label)

    dataSet.forEach((voucher) => {
      if (voucher.cancelled) {
        return
      }
      voucher.goodInfo.forEach((info) => {
        altDatasets[info.type][index] += info.charge
      })
    })
  })

  for (const [k, v] of Object.entries(altDatasets)) {
    chartData.datasets.push({
      label: k,
      data: [...v],
      backgroundColor: baseSetupForChartDataSet[k].backgroundColor,
      borderColor: baseSetupForChartDataSet[k].borderColor,
    })
  }

  return chartData
}

function buildTotalChartDataSet(data) {
  const possibleColumnsSet = []
  const possibleCounts = Math.round(data.length / 12)

  for (let i = 0; i < data.length; i += possibleCounts) {
    possibleColumnsSet.push(data.slice(i, i + possibleCounts))
  }
  return possibleColumnsSet
}

function buildForThisYearChartData() {
  chartDataSets.thisYear = buildTotalChartData(vouchers)
}

// build customer and total data chart end ---------------------------------

// ------- handle chartData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

export {
  state,
  customers,
  vouchers,
  // ----- setup
  goodTypesData,
  paymentMethods,
  goodTypeShortKeyToLabel,
  setUpGoodTypesDatasets,
  // ----- voucher
  getAVoucher,
  saveNewVoucher,
  updateVoucher,
  deleteVoucher,
  // ----- customer
  sortCustomersBy,
  getACustomerInfo,
  getCustomerAndHisVouchersById,
  searchCustomer,
  deleteCustomer,
  saveNewCustomer,
  updateCustomer,
  // ------- table data
  salesTableData,
  buildSalesTableData,
  // ------ chart data
  getChartData,
  buildCustomerChartData,
  buildTotalChartData,
  buildForThisYearChartData,
  buildMonthlyChartData,
}
