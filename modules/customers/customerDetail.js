'use strict'

import _ from '../dom/index.js'
// import createCustomerChart from './customerChart.js'
import createVoucherCard from './voucherCard.js'
import { getCustomerAndHisVouchersById } from '../state.js'
import createEditCustomerForm from './editCustomerForm.js'
import { openModal } from '../general/createModal.js'
import createEditVoucherForm from '../general/editVoucherForm.js'
import { lockNav, unlockNav } from '../general/navLocker.js'
import countStarsAnimate from '../general/starCounter.js'

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

  async function handleClickOnVoucher(e) {
    if (e.target.tagName === 'BUTTON') {
      const id = parseInt(e.target.dataset.vid)
      const voucher = customerVouchers.find((vc) => vc.id === id)
      await __setUpEditVoucherForm(
        voucher,
        e.target.parentElement,
        customerInfo.name
      )
      openModal($editVoucherForm)
      // edit btn evt handler
    } else if (e.target.tagName === 'SPAN') {
      e.target.parentElement.childNodes[6].classList.toggle(
        'hide-content-by-x-axis'
      )
      // toggle note
    }
  }

  async function handleEditCustomerClick() {
    await __setUpEditCustomerForm(customerInfo, $name, $address, $phone)
    openModal($editCustomerForm)
  }

  function appendVoucherCards(data = customerVouchers.slice(0, 10)) {
    const $fragment = _.createFragment()
    data.forEach(async (voucher) => {
      $customerVouchers.appendChild(await createVoucherCard(voucher))
    })
    $customerVouchers.appendChild($fragment)
  }

  // auto loader ---------------------------------- start
  let ioLoadedCount = 10 // stop when sortedCustomersData.length
  let ioScrollBack = false // this is weird, but works ( instead of entry.target.isIntercepting)
  const $intersectionObserver = _.createElement('', '', [
    'cus-vouchers-intersection-observer',
    'text-center',
  ])

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      ioScrollBack = !ioScrollBack
      if (ioScrollBack) {
        return
      }
      if (ioLoadedCount > customerVouchers.length) {
        return
      }
      entries.forEach((entry) => {
        $intersectionObserver.textContent = 'Loading . . .'
        // loaded += 10
        const timer = setTimeout(async () => {
          appendVoucherCards(
            customerVouchers.slice(ioLoadedCount, (ioLoadedCount += 10))
          )
          $intersectionObserver.textContent = ''
          clearTimeout(timer)
        }, 500)
      })
    },
    { threshold: 1 }
  )

  async function __sleepFunc() {
    customerInfo = null
    customerVouchers = null
    _.emptyChild($customerVouchers)
    intersectionObserver.unobserve($intersectionObserver)
    // under construction
    // await __cleanUpChart()

    _.removeOn('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.removeOn('click', $customerVouchers, handleClickOnVoucher)
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
    await countStarsAnimate($starCounter, stars)

    // setUpChart
    // await __setUpChart(customerInfo)

    _.emptyChild($customerVouchers)
    appendVoucherCards()
    ioLoadedCount = 10
    intersectionObserver.observe($intersectionObserver)

    lockNav(`${favorite ? '⭐' : ''}${name}`)

    _.on('click', $editCustomerBtn, handleEditCustomerClick)
    _.on('click', $backToCustomersBtn, handleBackToAllCustomersPage)
    _.on('click', $customerVouchers, handleClickOnVoucher)
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
      $intersectionObserver,
      $editCustomerForm,
      $editVoucherForm,
    ]
  )

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createCustomerDetail
