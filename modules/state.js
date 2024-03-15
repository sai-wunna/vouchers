// -- all data must be unshift to arr, to make newer first

// data.json : { customers : [], vouchers : [], chartConfig : {}  : chartBaseSetUp : {} }
// then calculate and store to state

const state = {
  $editingVoucher: null,
  importedFileData: {
    totalVouchers: 0,
    totalCustomers: 0,
    version: '',
    timePeriod: '',
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
}

const chartDataSets = {}
const salesTableData = {}
const customers = []
const vouchers = {
  currentPage: 0,
  data: [],
}

// const salesTableData = {}
// const chartBaseSetUp = {}
// const chartData = {}

// ------- handle vouchers start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

function saveNewVoucher(data, totalCharge) {
  const id = vouchers.data.length + 1
  const newVoucher = { id, ...data }
  vouchers.data.unshift(newVoucher)
  // give customer stars by money spent
  const stars = Math.round(totalCharge / 10000)
  const customerIdx = customers.findIndex((cus) => cus.id === data.customerId)
  customers[customerIdx].stars += stars
  return id
}

function getAVoucher(vid) {
  const receipt = vouchers.data.find((vc) => vc.id === vid)
  const customer = customers.find((cus) => cus.id === receipt.customerId)
  return { receipt: { ...receipt }, customer: { ...customer } }
}

async function updateVoucher(data, totalCharge) {
  const id = Number(data.id)
  const idx = vouchers.data.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }
  const oldData = { ...vouchers.data[idx] }
  const newData = {
    ...data,
    customerId: oldData.customerId,
    name: oldData.name,
  }

  for (const [k, v] of Object.entries(data)) {
    vouchers.data[idx][k] = v
  }
  // update stars of customer
  await updateStarsOfCustomerOnUpdateVoucher(oldData, newData, totalCharge)
  return newData
}
// | helper of upper one |
function updateStarsOfCustomerOnUpdateVoucher(oldData, newData, totalCharge) {
  const customerIdx = customers.findIndex(
    (cus) => cus.id === oldData.customerId
  )

  const oldTotalCharge = oldData.goodInfo.reduce(
    (total, info) => total + info.charge,
    0
  )

  if (newData.cancelled !== oldData.cancelled) {
    if (newData.cancelled) {
      const stars = Math.round(oldTotalCharge / 10000)
      customers[customerIdx].stars -= stars
    } else {
      const stars = Math.round(totalCharge / 10000)
      customers[customerIdx].stars += stars
    }
  }

  if (
    !newData.cancelled &&
    !oldData.cancelled &&
    oldTotalCharge !== totalCharge
  ) {
    const stars = Math.round((totalCharge - oldTotalCharge) / 10000)
    customers[customerIdx].stars += stars
  }
}

async function deleteVoucher(vid) {
  const id = Number(vid)
  const idx = vouchers.data.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }
  const voucher = { ...vouchers.data[idx] }
  vouchers.data.splice(idx, 1)
  if (!voucher.cancelled) {
    await updateStarsOfCustomerOnDeleteVoucher(voucher)
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
  const stars = Math.round(totalCharge / 10000)
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
    newerFirst: (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
    olderFirst: (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
  }

  return await customers.sort(sortingFunctions[type])
}

function getACustomerInfo(id) {
  return customers.find((cus) => cus.id === id)
}

function getCustomerAndHisVouchersById(id) {
  const customerData = customers.find((cus) => cus.id === id)
  const vouchersData = vouchers.data.filter((vc) => vc.customerId === id)
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
  try {
    const id = updatedData.id
    const idx = customers.findIndex((cus) => cus.id === id)

    if (customers[idx].name !== updatedData.name) {
      vouchers.data.map((voucher) => {
        if (voucher.customerId === id) {
          voucher.name = updatedData.name
        }
      })
    }

    for (const [k, v] of Object.entries(updatedData)) {
      customers[idx][k] = v
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
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
    const vouchersCount = vouchers.data.findIndex(
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

function buildSalesTableData() {
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

  // empty, so can calculate
  for (const key in salesTableData) {
    delete salesTableData[key]
  }

  const thisYear = { 'b/r/n': 0, 'b/r/wn': 0, 'w/r/n': 0 }
  let thisYearTotalAmount = 0

  let prevMonthName = ''
  const currentMonth = { 'b/r/n': 0, 'b/r/wn': 0, 'w/r/n': 0 } // depends on types
  let currentMonthTotalAmount = 0

  vouchers.data.toReversed().forEach((voucher, index) => {
    const month = monthNames[Number(voucher.createdOn.split('-')[1]) - 1]

    if (!salesTableData[month]) {
      salesTableData[month] = { percentage: '', goodInfo: [], total: 0 }

      if (prevMonthName) {
        for (const [type, amount] of Object.entries(currentMonth)) {
          salesTableData[prevMonthName].goodInfo.push({
            type,
            amount,
            percentage: Math.round((amount / currentMonthTotalAmount) * 100),
          })
          currentMonth[type] = 0
        }
        salesTableData[prevMonthName].total = currentMonthTotalAmount
        currentMonthTotalAmount = 0
      }
      prevMonthName = month
    }

    voucher.goodInfo.forEach((info) => {
      const charge = info.charge
      currentMonth[info.type] += charge
      currentMonthTotalAmount += charge

      thisYear[info.type] += charge
      thisYearTotalAmount += charge
    })

    if (index === vouchers.data.length - 1) {
      for (const [type, amount] of Object.entries(currentMonth)) {
        salesTableData[prevMonthName].goodInfo.push({
          type,
          amount,
          percentage: Math.round((amount / currentMonthTotalAmount) * 100),
        })
      }
      salesTableData[prevMonthName].total = currentMonthTotalAmount
    }
  })

  for (const key in salesTableData) {
    salesTableData[key].percentage = `${Math.round(
      (salesTableData[key].total / thisYearTotalAmount) * 100
    )}%`
  }

  salesTableData.thisYear = {
    percentage: '100%',
    total: thisYearTotalAmount,
    goodInfo: [
      ...Object.entries(thisYear).map(([type, amount]) => {
        return {
          type,
          amount,
          percentage: Math.round((amount / thisYearTotalAmount) * 100),
        }
      }),
    ],
  }

  return true
}

// ------- handle salesTableData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle chartData start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

function getChartData(period) {
  const data = chartDataSets[period]
  if (!data) {
    return false
  }
  data.datasets.forEach((set, index) => {
    data.datasets[index] = { ...set, ...state.chartConfig.datasetsConf }
  })
  return data
}

const baseSetupForChartDataSet = {
  'b/r/n': {
    label: 'Black Raw ( with shell )',
    borderColor: 'rgba(246, 255, 0, 0.6)',
    backgroundColor: 'rgba(246, 255, 0, 0.6)',
  },
  'b/r/wn': {
    label: 'Black Raw ( without shell )',
    borderColor: 'rgba(0, 60, 255, 0.6)',
    backgroundColor: 'rgba(0, 60, 255, 0.6)',
  },
  'w/r/n': {
    label: 'White Raw ( with shell )',
    borderColor: 'rgba(255, 0, 0, 0.6)',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
  // more to add --- depends on good types
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
  const isValidData = isValidToBuildMonthlyChart(vouchers.data)

  if (!isValidData) {
    console.log('Invalid Data to Build Data')
    return {}
  }

  const possibleDatasets = convertToMonthlyDataSets(vouchers.data.toReversed())

  for (const [k, v] of Object.entries(possibleDatasets)) {
    chartDataSets[k] = buildMonthlyChartDataSets(v)
  }

  return true
}

function buildMonthlyChartDataSets(data) {
  const labels = getDaysArray(data[0].createdOn)
  const altDatasets = {
    'b/r/n': Array.from({ length: labels.length }, () => 0),
    'b/r/wn': Array.from({ length: labels.length }, () => 0),
    'w/r/n': Array.from({ length: labels.length }, () => 0),
  } // depends on good types

  data.forEach((voucher) => {
    if (voucher.cancelled) {
      return
    }
    const currentDay = Number(voucher.createdOn.split('-')[2]) - 1
    voucher.goodInfo.forEach((info) => {
      if (info.type === 'b/r/n') {
        if (altDatasets['b/r/n'][currentDay]) {
          altDatasets['b/r/n'][currentDay] += info.charge
        } else {
          altDatasets['b/r/n'][currentDay] = info.charge
        }
      } else if (info.type === 'b/r/wn') {
        if (altDatasets['b/r/wn'][currentDay]) {
          altDatasets['b/r/wn'][currentDay] += info.charge
        } else {
          altDatasets['b/r/wn'][currentDay] = info.charge
        }
      } else {
        if (altDatasets['w/r/n'][currentDay]) {
          altDatasets['w/r/n'][currentDay] += info.charge
        } else {
          altDatasets['w/r/n'][currentDay] = info.charge
        }
      }
    })
  })

  const chartData = { labels, datasets: [] }

  for (const [k, v] of Object.entries(altDatasets)) {
    chartData.datasets.push({
      data: [...v],
      label: baseSetupForChartDataSet[k].label,
      backgroundColor: baseSetupForChartDataSet[k].backgroundColor,
      borderColor: baseSetupForChartDataSet[k].borderColor,
      // ...state.chartConfig.datasetsConf,
    })
  }
  return chartData
}

function convertToMonthlyDataSets(data) {
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

function isValidToBuildMonthlyChart(data) {
  const [y1, m1] = data[0].createdOn.split('-').map((date) => Number(date))
  const [y2, m2] = data[data.length - 1].createdOn
    .split('-')
    .map((date) => Number(date))

  if (y1 === y2 && m1 === m2) {
    return false
  }
  return true
}
// monthly data chart done -------------------------------------------------

// build customer and total data chart start -------------------------------

function buildCustomerChartData(vouchers) {
  const chartData = buildTotalChartData(vouchers)
  chartData.datasets.forEach((set, index) => {
    chartData.datasets[index] = { ...set, ...state.chartConfig.datasetsConf }
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
  const altDatasets = { 'b/r/n': [], 'b/r/wn': [], 'w/r/n': [] } // depends on good types

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
        if (info.type === 'b/r/n') {
          if (altDatasets['b/r/n'][index]) {
            altDatasets['b/r/n'][index] += info.charge
          } else {
            altDatasets['b/r/n'][index] = info.charge
          }
        } else if (info.type === 'b/r/wn') {
          if (altDatasets['b/r/wn'][index]) {
            altDatasets['b/r/wn'][index] += info.charge
          } else {
            altDatasets['b/r/wn'][index] = info.charge
          }
        } else {
          if (altDatasets['w/r/n'][index]) {
            altDatasets['w/r/n'][index] += info.charge
          } else {
            altDatasets['w/r/n'][index] = info.charge
          }
        }
      })
    })
  })

  for (const [k, v] of Object.entries(altDatasets)) {
    chartData.datasets.push({
      label: baseSetupForChartDataSet[k].label,
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
  chartDataSets.thisYear = buildTotalChartData(vouchers.data)
}

// build customer and total data chart end ---------------------------------

// ------- handle chartData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

export {
  state,
  customers,
  vouchers,
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
