import { tableData, chartBaseSetUp, chartData } from './data.js' // temporary

//--------rules
// -- all data must be unshift to arr, to make newer first

// data.json : { customers : [], vouchers : [], chartConfig : {}  : chartBaseSetUp : {} }
// then calculate and store to state

const customers = []
const vouchers = {
  currentPage: 0,
  data: [],
}
const chartConfig = {
  chartType: 'line',
  datasetsConf: {
    borderWidth: 1,
    tension: 0.5,
    pointRadius: 3,
    fill: 'origin',
  },
}
// const tableData = {}
// const chartBaseSetUp = {}
// const chartData = {}

const importedFileData = {}

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

function getAVoucher(receiptId) {
  const receipt = vouchers.data.find((vc) => vc.id === receiptId)
  const customer = customers.find((cus) => cus.id === receipt.customerId)
  return { receipt: { ...receipt }, customer: { ...customer } }
}

async function updateVoucher(data, totalCharge) {
  const id = parseInt(data.id)
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

  if (newData.cancelled !== oldData.cancelled) {
    const stars = Math.round(totalCharge / 10000)
    if (newData.cancelled) {
      customers[customerIdx].stars -= stars
    } else {
      customers[customerIdx].stars += stars
    }
  }
  const oldTotalCharge = oldData.goodInfo.reduce(
    (total, info) => total + info.charge,
    0
  )

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
  const id = parseInt(vid)
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
    favorite: (a, b) => b.favorite - a.favorite,
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
    const id = parseInt(cusId)
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
// // when update ( add amount ) or add voucher
// function giveStarsToCustomer(cusId, stars) {
//   try {
//     const id = parseInt(cusId)
//     const idx = customers.findIndex((cus) => cus.id === id)
//     customers[idx].stars = customers[idx].stars + parseInt(stars)
//     return true
//   } catch (error) {
//     console.log(error)
//     return false
//   }
// }
// // when update ( cancel or reduce amount ) or delete
// function removeStarsFromCustomer(cusId, stars) {
//   try {
//     const id = parseInt(cusId)
//     const idx = customers.findIndex((cus) => cus.id === id)
//     customers[idx].stars = customers[idx].stars - parseInt(stars)
//     return true
//   } catch (error) {
//     console.log(error)
//     return false
//   }
// }

// ------- handle customers end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle tableData start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//
// ------- handle tableData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// ------- handle chartData start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

function calculateChartData() {
  // calculate data to meet required patterns
}

function initiateChartData() {
  // calculate and inset to chartData
}

function getChartDataByPeriod(period) {
  const data = chartData[period]
  return {
    labels: data.labels,
    // it depends on categories
    datasets: [
      {
        data: data.datasets[0].data,
        ...chartBaseSetUp['b/r/n'],
        ...chartConfig.datasetsConf,
      },
      {
        data: data.datasets[1].data,
        ...chartBaseSetUp['b/r/wn'],
        ...chartConfig.datasetsConf,
      },
      {
        data: data.datasets[2].data,
        ...chartBaseSetUp['w/r/n'],
        ...chartConfig.datasetsConf,
      },
    ],
  }
}
// depends on category -- under construction
// function calculateCustomerChartData(cusId) {
//   const id = parseInt(cusId)
//   const vouchers = vouchers.data.filter((voucher) => voucher.customerId === id)
//   const labels = []
//   const datasets = [{ data: [] }, { data: [] }, { data: [] }]
//   vouchers.forEach((voucher) => {
//     const month = getMonthName(voucher.createdOn)
//     voucher.goodInfo.forEach((info) => {})
//   })
//   return { labels, datasets }
// }

// async function getCustomerChart(cusId) {
//   const data = await calculateCustomerChartData()
//   return {
//     labels: data.labels,
//     // it depends on categories
//     datasets: [
//       {
//         data: data.datasets[0].data,
//         ...chartBaseSetUp['b/r/n'],
//         ...chartConfig.datasetsConf,
//       },
//       {
//         data: data.datasets[1].data,
//         ...chartBaseSetUp['b/r/wn'],
//         ...chartConfig.datasetsConf,
//       },
//       {
//         data: data.datasets[2].data,
//         ...chartBaseSetUp['w/r/n'],
//         ...chartConfig.datasetsConf,
//       },
//     ],
//   }
// }

// ------- handle chartData end -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// _____________ initialize __________________________
async function initiateState({
  vouchers,
  customers: customerData,
  chartBaseSetUp: chartBaseSetUpData,
  chartConfig: chartConfigData,
}) {
  try {
    vouchers.data.push(...vouchers)

    customers.push(...customerData)

    for (const [k, v] of Object.entries(chartBaseSetUpData)) {
      chartBaseSetUp[k] = v
    }

    for (const [k, v] of Object.entries(chartConfigData)) {
      chartConfig[k] = v
    }
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export {
  importedFileData,
  // ---------
  customers,
  vouchers,
  chartConfig,
  chartData,
  tableData,
  // --------
  initiateChartData,
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
  getChartDataByPeriod,
}
