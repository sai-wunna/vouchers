'use strict'

import _ from '../dom/index.js'
// import createCustomerChart from './customerChart.js'
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
  let $customerNodeFromList = null
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
    createEditVoucherForm(__whenDeleteVoucher, __whenUpdateVoucher)

  async function __whenDeleteVoucher() {
    customerInfo = await getACustomerInfo(customerInfo.id)
    updateCustomerStars()
  }

  async function __whenUpdateVoucher(data) {
    customerInfo = await getACustomerInfo(customerInfo.id)
    updateCustomerStars()
    const $updatedNode = await createVoucherCard(data)
    state.$editingVoucher.replaceWith($updatedNode)
    state.$editingVoucher = $updatedNode
  }

  function updateCustomerStars() {
    $starCounter.textContent = `${customerInfo.stars.toLocaleString()} stars`
    $customerNodeFromList.lastChild.textContent = `${customerInfo.stars}s`
  }

  const $customerVouchers = _.createElement('', '', ['customer-vouchers'])

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
    setUpCustomerInfoBox()
  }

  function handleBackToCustomerPage() {
    __whenQuitFunc()
    cleanMemoTimer = setTimeout(() => {
      __sleepFunc()
    }, 10000)
    unlockNav()
  }

  async function handleClickOnVoucher(e) {
    if (e.target.tagName === 'BUTTON') {
      const id = parseInt(e.target.dataset.vid)
      const voucher = customerVouchers.find((vc) => vc.id === id)
      state.$editingVoucher = e.target.parentElement
      await __setUpEditVoucherForm(voucher, customerInfo.name)
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
    await __setUpEditCustomerForm(customerInfo)
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

  function setUpCustomerInfoBox() {
    $name.textContent = customerInfo.name
    $address.textContent = `Addr : ${customerInfo.address}`
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
    // under construction
    // await __cleanUpChart()

    _.removeOn('click', $backToCustomersBtn, handleBackToCustomerPage)
    _.removeOn('click', $customerVouchers, handleClickOnVoucher)
    _.removeOn('click', $editCustomerBtn, handleEditCustomerClick)
  }

  async function __setUpFunc(id) {
    clearTimeout(cleanMemoTimer)
    $editCustomerBtn.disabled = false

    if (customerInfo?.id === id) {
      lockNav(`${customerInfo.favorite ? '⭐' : ''}${customerInfo.name}`)
      return
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
    setUpCustomerInfoBox()
    await countStarsAnimate($starCounter, customerInfo.stars)

    // setUpChart
    // await __setUpChart(customerInfo)

    _.emptyChild($customerVouchers)
    appendVoucherCards()
    ioLoadedCount = 10
    intersectionObserver.observe($intersectionObserver)

    lockNav(`${customerInfo.favorite ? '⭐' : ''}${customerInfo.name}`)

    _.on('click', $editCustomerBtn, handleEditCustomerClick)
    _.on('click', $backToCustomersBtn, handleBackToCustomerPage)
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
