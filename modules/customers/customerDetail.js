'use strict'

import _ from '../dom/index.js'
import createCustomerChart from './customerChart.js'
import createVoucherCard from './voucherCard.js'
import { getCustomerAndHisVouchersById } from '../state.js'
import createEditCustomerForm from './editCustomerForm.js'
import { openModal } from '../general/createModal.js'
import createEditVoucherForm from '../general/editVoucherForm.js'
import { enterSubPage, existSubPage } from '../general/subPageInOut.js'

function createCustomerDetail($allCustomersBox) {
  let customerInfo = null
  let customerVouchers = null
  let cleanMemoTimer = null

  const $backToCustomersBtn = _.createButton('Back', ['btn', 'btn-ghost'])
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

  const [$chart, __setUpChart, __cleanUpChart] = createCustomerChart()
  const [$editVoucherForm, __setUpEditForm, __cleanUpEditForm] =
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
    existSubPage()
  }

  async function handleEditVoucherClick(e) {
    if (e.target.tagName !== 'BUTTON') return
    const id = parseInt(e.target.dataset.vid)
    const voucher = customerVouchers.find((vc) => vc.id === id)
    await __setUpEditForm(voucher, e.target.parentElement, customerInfo.name)
    openModal($editVoucherForm)
  }

  async function handleEditCustomerClick() {
    await __setUpEditCustomerForm(customerInfo, $name, $address, $phone)
    openModal($editCustomerForm)
  }

  async function __sleepFunc() {
    customerInfo = null
    customerVouchers = null // clear voucher arr
    _.emptyChild($customerVouchers) // remove voucher nodes

    await __cleanUpChart()
    _.removeOn('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.removeOn('click', $customerVouchers, handleEditVoucherClick)
    _.removeOn('click', $editCustomerBtn, handleEditCustomerClick)
  }

  async function __setUpFunc(id) {
    clearTimeout(cleanMemoTimer)
    if (customerInfo?.id === parseInt(id)) {
      return
    }
    // set up info
    const { customer, vouchers } = await getCustomerAndHisVouchersById(id)
    // store temporary
    customerVouchers = [...vouchers]
    customerInfo = { ...customer }

    const { name, address, phone, createdOn, stars, favorite, company } =
      customerInfo
    // show info
    $name.textContent = `${name} (⭐${stars})`
    $address.textContent = address
    $phone.textContent = phone.length > 0 ? phone.join(',') : 'No Phone Contact'
    $createdOn.textContent = `Account was created on ${createdOn}`
    $company.textContent = `Company : ${company || 'Not Know'} `
    // setUpChart
    await __setUpChart(customerInfo)
    // clear old vouchers
    _.emptyChild($customerVouchers)
    // show customer detail
    enterSubPage(`${favorite ? '⭐' : ''}${name}`)

    vouchers.forEach(async (voucher) => {
      $customerVouchers.appendChild(await createVoucherCard(voucher))
    })

    _.on('click', $editCustomerBtn, handleEditCustomerClick)
    _.on('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.on('click', $customerVouchers, handleEditVoucherClick)
  }

  function __cleanUpFunc() {
    __cleanUpEditCustomerForm()
    __cleanUpEditForm()
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
      $customerInfo,
      $chart,
      $customerVouchers,
      $editCustomerForm,
      $editVoucherForm,
    ]
  )

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createCustomerDetail
