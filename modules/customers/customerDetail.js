'use strict'

import _ from '../dom/index.js'
// import createCustomerChart from './customerChart.js'
import createVoucherCard from './voucherCard.js'
import { getCustomerAndHisVouchersById } from '../state.js'
import createEditCustomerForm from './editCustomerForm.js'
import { openModal } from '../general/createModal.js'
import createEditVoucherForm from '../general/editVoucherForm.js'
import { lockNav, unlockNav } from '../general/navLocker.js'

function createCustomerDetail($allCustomersBox) {
  let customerInfo = null
  let customerVouchers = null
  let cleanMemoTimer = null

  const $backToCustomersBtn = _.createButton('Back', ['btn', 'btn-ghost'])
  const $starCounter = _.createElement('', 'stars', [
    'float-end',
    'star-counter',
  ])

  const $editCustomerBtn = _.createButton('Edit', [
    'btn-corner-right',
    'btn-dark',
  ])
  const $name = _.createHeading('h5')
  const $address = _.createHeading('h6')
  const $phone = _.createHeading('h6')
  const $createdOn = _.createElement('i')
  const $company = _.createHeading('h6')
  const $customerInfo = _.createElement(
    '',
    '',
    ['customer-info'],
    [
      $backToCustomersBtn,
      $editCustomerBtn,
      $name,
      $address,
      $phone,
      $company,
      $createdOn,
    ]
  )
  // under construction
  // const [$chart, __setUpChart, __cleanUpChart] = createCustomerChart()
  const [$editVoucherForm, __setUpEditVoucherForm, __cleanUpEditVoucherForm] =
    createEditVoucherForm()

  const $customerVouchers = _.createElement('', '', ['customer-vouchers'])

  const [
    $editCustomerForm,
    __setUpEditCustomerForm,
    __cleanUpEditCustomerForm,
  ] = createEditCustomerForm()

  function handleBackToAllCustomersPage() {
    $allCustomersBox.classList.remove('d-none')
    $main.classList.add('d-none')
    cleanMemoTimer = setTimeout(() => {
      __sleepFunc()
    }, 10000)
    unlockNav()
  }

  async function handleEditVoucherClick(e) {
    if (e.target.tagName !== 'BUTTON') return
    const id = parseInt(e.target.dataset.vid)
    const voucher = customerVouchers.find((vc) => vc.id === id)
    await __setUpEditVoucherForm(
      voucher,
      e.target.parentElement,
      customerInfo.name
    )
    openModal($editVoucherForm)
  }

  async function handleEditCustomerClick() {
    await __setUpEditCustomerForm(customerInfo, $name, $address, $phone)
    openModal($editCustomerForm)
  }

  function countStarsAnimate(stars) {
    let counter = 0
    $starCounter.classList.add('star-counting')
    const intervalId = setInterval(() => {
      if (counter > stars) {
        clearInterval(intervalId)
        $starCounter.textContent = `${stars.toLocaleString()} stars`
        $starCounter.classList.remove('star-counting')
        return
      }
      $starCounter.textContent = calValue(counter)
    })
    function calValue(num) {
      if (num > 9999) {
        counter += 1000
        return `${num.toLocaleString()} stars`
      } else if (num > 999) {
        counter += 100
        return `${num.toLocaleString()} stars`
      } else {
        counter += 10
        return `${num.toLocaleString()} stars`
      }
    }
  }

  async function __sleepFunc() {
    customerInfo = null
    customerVouchers = null // clear voucher arr
    _.emptyChild($customerVouchers) // remove voucher nodes

    // under construction
    // await __cleanUpChart()

    _.removeOn('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.removeOn('click', $customerVouchers, handleEditVoucherClick)
    _.removeOn('click', $editCustomerBtn, handleEditCustomerClick)
  }

  async function __setUpFunc(id) {
    clearTimeout(cleanMemoTimer)
    if (customerInfo?.id === id) {
      lockNav(`${customerInfo.favorite ? '⭐' : ''}${customerInfo.name}`)
      return
    }
    // set up info
    const { customerData, vouchersData } = await getCustomerAndHisVouchersById(
      id
    )
    // store temporary
    customerVouchers = [...vouchersData]
    customerInfo = { ...customerData }

    const { name, address, phone, createdOn, stars, favorite, company } =
      customerInfo

    // show info
    $name.textContent = name
    $address.textContent = `Addr : ${address}`
    $phone.textContent =
      phone.length > 0 ? `Phone : ${phone.join(',')}` : 'Phone : No Contact'
    $createdOn.textContent = `Account was created on ${createdOn}`
    $company.textContent = `Company : ${company || 'Not Know'}`
    await countStarsAnimate(stars)

    // setUpChart
    // await __setUpChart(customerInfo)

    // clear old vouchers
    _.emptyChild($customerVouchers)
    // show customer detail
    lockNav(`${favorite ? '⭐' : ''}${name}`)

    customerVouchers.forEach(async (voucher) => {
      $customerVouchers.appendChild(await createVoucherCard(voucher))
    })

    _.on('click', $editCustomerBtn, handleEditCustomerClick)
    _.on('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.on('click', $customerVouchers, handleEditVoucherClick)
  }

  function __cleanUpFunc() {
    __cleanUpEditCustomerForm()
    __cleanUpEditVoucherForm()
    if (cleanMemoTimer) {
      clearTimeout(cleanMemoTimer)
      __sleepFunc()
    }
  }

  const $main = _.createElement(
    '',
    '',
    ['customer-detail'],
    [
      $backToCustomersBtn,
      $starCounter,
      $customerInfo,
      // $chart,
      $customerVouchers,
      $editCustomerForm,
      $editVoucherForm,
    ]
  )

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createCustomerDetail
