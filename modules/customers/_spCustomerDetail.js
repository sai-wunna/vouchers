'use strict'

import _ from '../dom/index.js'
import createCustomerChart from './_cCustomerChart.js'
import createVoucherCard from './_ncVoucherCard.js'
import {
  getACustomerInfo,
  getCustomerAndHisVouchersById,
  state,
} from '../state.js'
import createEditCustomerForm from './_mEditCustomerForm.js'
import { openModal } from '../helpers/createModal.js'
import createEditVoucherForm from '../general/_mEditVoucherForm.js'
import { lockNav, unlockNav } from '../helpers/navLocker.js'
import countStarsAnimate from '../helpers/starCounter.js'
import { createCustomerRow } from './_ncCustomerRow.js'

function createCustomerDetail(__whenQuitFunc) {
  let isChartSetup = false
  let $customerNodeFromList = null
  let customerInfo = null
  let customerVouchers = null
  let cleanMemoTimer = null

  const $backToCustomersBtn = _.createButton('Back', ['btn', 'btn-ghost'])
  function handleBackToCustomerPage() {
    __whenQuitFunc()
    cleanMemoTimer = setTimeout(() => {
      __sleepFunc()
    }, 10000)
    unlockNav()
  }

  const $starCounter = _.createElement('', 'stars', [
    'float-end',
    'star-counter',
  ])

  const $editCustomerBtn = _.createButton('Edit', [
    'btn-corner-right',
    'btn-dark',
  ])
  async function handleEditCustomerClick() {
    await __setUpEditCustomerForm(customerInfo)
    openModal($editCustomerForm)
  }

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
  const $chartContainer = _.createElement('', '', ['customer-chart-container'])

  const [$editVoucherForm, __setUpEditVoucherForm, __cleanUpEditVoucherForm] =
    createEditVoucherForm(__whenDeleteVoucher, __whenUpdateVoucher)

  async function __whenDeleteVoucher() {
    customerInfo = await getACustomerInfo(customerInfo.id)
    ih_updateCustomerStars()
  }

  async function __whenUpdateVoucher(data) {
    customerInfo = await getACustomerInfo(customerInfo.id)
    ih_updateCustomerStars()
    const $updatedNode = await createVoucherCard(data)
    state.$editingVoucher.replaceWith($updatedNode)
    state.$editingVoucher = $updatedNode
  }

  function ih_updateCustomerStars() {
    $starCounter.textContent = `${customerInfo.stars.toLocaleString()} stars`
    $customerNodeFromList.lastChild.textContent = `${customerInfo.stars}s`
  }

  const $customerVouchers = _.createElement('', '', ['customer-vouchers'])
  async function handleClickOnVoucher(e) {
    if (e.target.tagName === 'BUTTON') {
      const id = Number(e.target.dataset.vid)
      const voucher = customerVouchers.find((vc) => vc.id === id)
      state.$editingVoucher = e.target.parentElement
      await __setUpEditVoucherForm(voucher)
      openModal($editVoucherForm)
    } else if (e.target.tagName === 'SPAN') {
      e.target.parentElement.childNodes[6].classList.toggle(
        'hide-content-by-x-axis'
      )
    }
  }

  const [
    $editCustomerForm,
    __setUpEditCustomerForm,
    __cleanUpEditCustomerForm,
  ] = createEditCustomerForm(__whenDeleteCustomer, __whenUpdateCustomer)

  function __whenDeleteCustomer() {
    $customerNodeFromList.remove()
    $editCustomerBtn.disabled = true
  }

  function __whenUpdateCustomer() {
    const $newCustomerNode = createCustomerRow({
      id: customerInfo.id,
      name: customerInfo.name,
      address: customerInfo.address,
      stars: customerInfo.stars,
      favorite: customerInfo.favorite,
    })
    $customerNodeFromList.replaceWith($newCustomerNode)
    $customerNodeFromList = $newCustomerNode
    ih_setUpCustomerInfoBox()
  }

  function ih_appendVoucherCards(data = customerVouchers.slice(0, 4)) {
    const $fragment = _.createFragment()
    data.forEach(async (voucher) => {
      $customerVouchers.appendChild(await createVoucherCard(voucher))
    })
    $customerVouchers.appendChild($fragment)
  }

  // auto loader ---------------------------------- start
  let ioLoadedCount = 4 // stop when sortedCustomersData.length
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
          ih_appendVoucherCards(
            customerVouchers.slice(ioLoadedCount, (ioLoadedCount += 4))
          )
          $intersectionObserver.textContent = ''
          clearTimeout(timer)
        }, 500)
      })
    },
    { threshold: 1 }
  )

  function ih_setUpCustomerInfoBox() {
    $name.textContent = customerInfo.name
    $address.textContent = `Addr : ${customerInfo.address || 'Not Know'}`
    $phone.textContent =
      customerInfo.phone.length > 0
        ? `Phone : ${customerInfo.phone.join(',')}`
        : 'Phone : No Contact'
    $createdOn.textContent = `Account was created on ${customerInfo.createdOn}`
    $company.textContent = `Company : ${customerInfo.company || 'Not Know'}`
  }

  async function __sleepFunc() {
    customerInfo = null
    customerVouchers = null
    _.emptyChild($customerVouchers)
    intersectionObserver.unobserve($intersectionObserver)

    if (isChartSetup) {
      await __cleanUpChart()
    }

    _.removeOn('click', $backToCustomersBtn, handleBackToCustomerPage)
    _.removeOn('click', $customerVouchers, handleClickOnVoucher)
    _.removeOn('click', $editCustomerBtn, handleEditCustomerClick)
  }

  async function __setUpFunc(id) {
    clearTimeout(cleanMemoTimer)
    cleanMemoTimer = null
    $editCustomerBtn.disabled = false

    if (customerInfo && customerInfo.id === id) {
      lockNav(`${customerInfo.favorite ? '✨ ' : ''}${customerInfo.name}`, true)
      return
    }

    if (isChartSetup) {
      await __cleanUpChart()
      $chart.remove()
      isChartSetup = false
    }
    // set up info
    const { customerData, vouchersData } = await getCustomerAndHisVouchersById(
      id
    )
    // store temporary
    customerInfo = { ...customerData }
    $customerNodeFromList = _.getNodeById(`cusId-${customerInfo.id}`)
    customerVouchers = [...vouchersData]

    // show info
    ih_setUpCustomerInfoBox()
    await countStarsAnimate($starCounter, customerInfo.stars)

    // setUpChart
    if (customerVouchers.length > 11 && window.innerWidth > 800) {
      await __setUpChart(customerVouchers)
      $chartContainer.appendChild($chart)
      isChartSetup = true
    }

    _.emptyChild($customerVouchers)
    ih_appendVoucherCards()
    ioLoadedCount = 4
    intersectionObserver.observe($intersectionObserver)

    lockNav(`${customerInfo.favorite ? '✨ ' : ''}${customerInfo.name}`, true)

    _.on('click', $editCustomerBtn, handleEditCustomerClick)
    _.on('click', $backToCustomersBtn, handleBackToCustomerPage)
    _.on('click', $customerVouchers, handleClickOnVoucher)
  }

  async function __cleanUpFunc() {
    await __cleanUpEditCustomerForm()
    await __cleanUpEditVoucherForm()
    if (cleanMemoTimer) {
      clearTimeout(cleanMemoTimer)
      await __sleepFunc()
    }
  }

  const $main = _.createElement(
    '',
    '',
    ['customer-detail', 'd-none'],
    [
      $backToCustomersBtn,
      $starCounter,
      $customerInfo,
      $chartContainer,
      $customerVouchers,
      $intersectionObserver,
      $editCustomerForm,
      $editVoucherForm,
    ]
  )

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createCustomerDetail
