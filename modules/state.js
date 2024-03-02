import {
  customers,
  vouchers,
  chartConfig,
  tableData,
  chartBaseSetUp,
  chartData,
} from './data.js' // temporary
import { getMonthName } from './helpers/getDate.js'

//--------rules
// -- all data must be unshift to arr, to make newer first

// data.json : { customers : [], vouchers : [], chartConfig : {}  : chartBaseSetUp : {} }
// then calculate and store to state

// const customers = []
// const vouchers = {data : [],currentPage : 1, pages : []}
// const chartConfig = {}
// const tableData = {}
// const chartBaseSetUp = {}
// const chartData = {}

// ------- handle vouchers start -/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//

// function setVoucherPages() {
//   const pages = []
//   let page = []
//   const endPoint = vouchers.data.length - 1

//   for (let i = 0; i < endPoint + 1; i++) {
//     page.push(vouchers.data[i])

//     if (page.length === 30 || i === endPoint) {
//       pages.push(page)
//       page = []
//     }
//   }
//   return pages
// }
function setVoucherPages() {
  const pages = []
  let page = []
  const endPoint = vouchers.data.length - 1

  for (let i = 0; i < endPoint + 1; i++) {
    page.push(vouchers.data[i])

    if (page.length === 30 || i === endPoint) {
      // Clone the page array before pushing it into pages
      pages.push([...page])
      page = []
    }
  }
  return pages
}

function saveNewVoucher(
  customerId,
  name,
  goodInfo,
  paid,
  createdOn,
  note,
  paymentMethod
) {
  const id = vouchers.data.length + 1
  const newVoucher = {
    id,
    name,
    customerId,
    goodInfo,
    paid,
    createdOn,
    note,
    paymentMethod,
  }
  vouchers.data.unshift(newVoucher)
  if (vouchers.pages[0]) {
    vouchers.pages[0].unshift(newVoucher)
  } else {
    vouchers.pages.push([newVoucher])
  }
  return id
}

function getAVoucher(receiptId) {
  const receipt = vouchers.data.find((vc) => vc.id === receiptId)
  const customer = customers.find((cus) => cus.id === receipt.customerId)
  return { receipt: { ...receipt }, customer: { ...customer } }
}

function updateVoucher(data) {
  const id = parseInt(data.id)
  const idx = vouchers.data.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }

  for (const [k, v] of Object.entries(data)) {
    vouchers.data[idx][k] = v
  }

  const oldData = { ...vouchers.data[idx] }
  const newData = {
    ...data,
    customerId: oldData.customerId,
    name: oldData.name,
  }
  // watch whether data in pages updated or not ( cancelled or not )
  // update chart and table data too!!! compare to decrease or increase amount
  return newData
}

function deleteVoucher(vid) {
  const id = parseInt(vid)
  const idx = vouchers.data.findIndex((voucher) => voucher.id === id)
  if (idx === -1) {
    return false
  }

  // Find the page index and the index within the page
  let pageIndex = -1
  let idxInPage = -1

  // Binary search for the page containing the voucher
  let left = 0
  let right = vouchers.pages.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const firstIdInPage = vouchers.pages[mid][0].id
    const lastIdInPage = vouchers.pages[mid][vouchers.pages[mid].length - 1].id
    if (id < firstIdInPage) {
      right = mid - 1
    } else if (id > lastIdInPage) {
      left = mid + 1
    } else {
      pageIndex = mid
      idxInPage = vouchers.pages[mid].findIndex((voucher) => voucher.id === id)
      break
    }
  }

  if (pageIndex === -1 || idxInPage === -1) {
    return false
  }

  vouchers.data.splice(idx, 1)
  vouchers.pages[pageIndex].splice(idxInPage, 1)

  return true
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
  const customersData = customers.find((cus) => cus.id === id)
  const vouchersData = vouchers.data.filter((vc) => vc.customerId === id)
  return { customer: customersData, vouchers: vouchersData }
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
    customers[idx] = updatedData
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
    const vouchersCount = vouchers.data.findIndex()
    const idx = customers.findIndex((cus) => cus.id === id)
    customers.splice(idx, 1)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
// when update ( add amount ) or add voucher
function giveStarsToCustomer(cusId, stars) {
  try {
    const id = parseInt(cusId)
    const idx = customers.findIndex((cus) => cus.id === id)
    customers[idx].stars = customers[idx].stars + parseInt(stars)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
// when update ( cancel or reduce amount ) or delete
function removeStarsFromCustomer(cusId, stars) {
  try {
    const id = parseInt(cusId)
    const idx = customers.findIndex((cus) => cus.id === id)
    customers[idx].stars = customers[idx].stars - parseInt(stars)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

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
    vouchers.pages = await [...setVoucherPages()]

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

// test ------------ need to remove
vouchers.pages = [...setVoucherPages()]

export {
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
