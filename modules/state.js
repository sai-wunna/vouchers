// data.json : { customers : [], vouchers : [], chartConfig : {}  : chartBaseSetUp : {} }

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

const goodTypes = ['b/r/n', 'b/r/wn', 'w/r/n'] // mustupdate
const goodTypeToChartLabel = {
  'b/r/n': 'Black Raw ( with shell )',
  'b/r/wn': 'Black Raw ( without shell )',
  'w/r/n': 'White Raw ( with shell )',
}

const baseSetupForChartDataSet = {
  'b/r/n': {
    borderColor: 'rgba(246, 255, 0, 0.6)',
    backgroundColor: 'rgba(246, 255, 0, 0.6)',
  },
  'b/r/wn': {
    borderColor: 'rgba(0, 60, 255, 0.6)',
    backgroundColor: 'rgba(0, 60, 255, 0.6)',
  },
  'w/r/n': {
    borderColor: 'rgba(255, 0, 0, 0.6)',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
}

// private states done

const state = {
  sortCustomersBy: 'stars',
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

async function saveNewVoucher(data, totalCharge) {
  const id = vouchers.data.length + 1
  const newVoucher = { id, ...data }
  vouchers.data.unshift(newVoucher)

  await updateStarsOfCustomerOnCreateNewVoucher(data.customerId, totalCharge)
  await updateSalesTableDataWhenCreateNewVoucher(data, totalCharge)
  await updateChartDataWhenCreateNewVoucher(data)
  return id
}
// helper of upper one |
function updateStarsOfCustomerOnCreateNewVoucher(customerId, totalCharge) {
  const stars = Math.round(totalCharge / 10000)
  const customerIdx = customers.findIndex((cus) => cus.id === customerId)
  customers[customerIdx].stars += stars
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
      const stars = Math.round(oldTotalCharge / 10000)
      customer.stars -= stars
    } else {
      const stars = Math.round(totalCharge / 10000)
      customer.stars += stars
    }
    return
  }

  // math.round make conflict, so added this condition check
  if (oldTotalCharge !== totalCharge) {
    const stars = Math.round((totalCharge - oldTotalCharge) / 10000)
    customer.stars += stars
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
  const id = updatedData.id
  const idx = customers.findIndex((cus) => cus.id === id)
  const customer = customers[idx]

  if (customer.name !== updatedData.name) {
    vouchers.data.map((voucher) => {
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
    const standardGoodInfo = { 'b/r/n': 0, 'b/r/wn': 0, 'w/r/n': 0 } // mustupdate mustupdate mustupdate

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

  const thisYear = { 'b/r/n': 0, 'b/r/wn': 0, 'w/r/n': 0 } // mustupdate mustupdate mustupdate
  let thisYearTotalCharge = 0

  let prevMonthName = ''
  const currentMonth = { 'b/r/n': 0, 'b/r/wn': 0, 'w/r/n': 0 } // mustupdate mustupdate mustupdate
  let currentMonthTotalCharge = 0

  vouchers.data.toReversed().forEach((voucher, index) => {
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

    if (index === vouchers.data.length - 1) {
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
        return {
          type,
          charge,
          percentage: Math.round((charge / thisYearTotalCharge) * 100),
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
    set.label = goodTypeToChartLabel[set.label]
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
  // const firstVoucher = vouchers.data[0]
  // const lastVoucher = vouchers.data[vouchers.data.length - 1]
  // const [y1, m1] = firstVoucher.createdOn.split('-').map((date) => Number(date))
  // const [y2, m2] = lastVoucher.createdOn.split('-').map((date) => Number(date))

  // if (y1 === y2 && m1 === m2) {
  //   return {}
  // }

  const possibleDatasets = convertToMonthlyDataSets(vouchers.data.toReversed())

  for (const [k, v] of Object.entries(possibleDatasets)) {
    chartDataSets[k] = buildMonthChartData(v)
  }

  return true
}

function buildMonthChartData(data) {
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
      // depends on good types
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
    set.label = goodTypeToChartLabel[set.label]
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
