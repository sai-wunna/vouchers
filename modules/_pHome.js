'use strict'

import _ from './dom/index.js'
import addVoucherForm from './home/_mAddVoucherForm.js'
import createReceipt from './home/_mReceiptPaper.js'
import { vouchers, getAVoucher, state } from './state.js'
import { createVoucherRow, createVoucherRows } from './home/_cVoucherRow.js'
import { openModal } from './helpers/createModal.js'
import { calculatePageDate, getFormatDate } from './helpers/getDate.js'
import createEditVoucherForm from './general/_mEditVoucherForm.js'
import notifier from './notify.js'
import lockBtn from './helpers/lockBtn.js'

export default () => {
  const $openFormModalBtn = _.createButton('+ Add', [
    'btn',
    'btn-blue',
    'float-end',
  ])
  async function handleAddFormModal() {
    openModal($addVoucherForm)
    await __setUpAddVoucherForm()
  }

  const $timePeriodHeader = _.createHeading('h2', 'December', [
    'time-period-header',
  ])

  const $prevBtn = _.createButton('←', ['btn', 'btn-ghost', 'm-1'])
  async function handlePageChangePrev(e) {
    notifier.__start('Loading . . .')
    const data = vouchers.data.slice(
      (vouchers.currentPage - 1) * 20,
      vouchers.currentPage * 20
    )
    if (data.length > 0) {
      ih_handlePageChange(data)

      vouchers.currentPage -= 1
      $nextBtn.disabled = false
    } else {
      lockBtn(e.target, 5000)
      notifier.__end('No More Pages', 'warning')
    }
  }

  const $nextBtn = _.createButton('→', ['btn', 'btn-ghost', 'm-1'])
  async function handlePageChangeNext(e) {
    notifier.__start('Loading . . .')
    const data = vouchers.data.slice(
      (vouchers.currentPage + 1) * 20,
      (vouchers.currentPage + 2) * 20
    )
    if (data.length > 0) {
      ih_handlePageChange(data, true)

      vouchers.currentPage += 1
      $prevBtn.disabled = false
    } else {
      lockBtn(e.target, 5000)
      notifier.__end('No More Pages', 'warning')
    }
  }

  async function ih_handlePageChange(data = []) {
    const formatDate = getFormatDate()
    const title = calculatePageDate(
      data[0]?.createdOn || formatDate,
      data[data.length - 1]?.createdOn || formatDate
    )
    const $pageNode = await createVoucherRows(data)

    _.emptyChild($voucherInfoTableBody)
    $voucherInfoTableBody.appendChild($pageNode)
    // set titles
    $timePeriodHeader.textContent = title
    $currentPageInfo.textContent = `Page - ${vouchers.currentPage + 1} / ${
      Math.ceil(vouchers.data.length / 20) || 1
    } ( ${$voucherInfoTableBody.childElementCount} )`

    notifier.__end('Page Has been loaded', 'success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const $currentPageInfo = _.createHeading('h6')
  const $pageControllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$currentPageInfo, _.createElement('', '', [], [$prevBtn, $nextBtn])]
  )

  const $voucherInfoTable = _.createTable(['voucher-table'], {
    classList: [],
    headers: [
      { text: 'Date', classList: ['created-date-th'] },
      { text: 'Name' },
      { text: 'Amount' },
      { text: 'Charge', classList: ['cell-md-show'] },
      { text: 'Paid' },
      { text: 'Method', classList: ['cell-md-show'] },
    ],
  })

  const $voucherInfoTableBody = _.createTBody(['data-info-box'], [])
  $voucherInfoTable.appendChild($voucherInfoTableBody)
  const $voucherTableContainer = _.createElement(
    '',
    '',
    ['voucher-table-container'],
    [$voucherInfoTable]
  )

  function ih_updatePageInfo() {
    $currentPageInfo.textContent = `Page - ${vouchers.currentPage + 1} / ${
      Math.ceil(vouchers.data.length / 20) || 1
    } ( ${$voucherInfoTableBody.childElementCount} )`

    const formatDate = getFormatDate()

    $timePeriodHeader.textContent = calculatePageDate(
      $voucherInfoTableBody.firstChild?.dataset.createdOn || formatDate,
      $voucherInfoTableBody.lastChild?.dataset.createdOn || formatDate
    )
  }

  const [$editVoucherForm, __setUpEditVoucherForm, __cleanUpEditVoucherForm] =
    createEditVoucherForm(__whenDeleteVoucher, __whenUpdateVoucher)

  function __whenDeleteVoucher() {
    const vcData = vouchers.data[(vouchers.currentPage + 1) * 20 - 1]

    if (vcData) {
      $voucherInfoTableBody.appendChild(createVoucherRows([vcData]))
    }

    ih_updatePageInfo()
  }

  function __whenUpdateVoucher(data) {
    const { id, createdOn, goodInfo, paid, paymentMethod, cancelled, name } =
      data

    let totalAmount = 0
    let totalCharge = 0

    goodInfo.forEach((info) => {
      totalAmount += Number(info.amount)
      totalCharge += Number(info.charge)
    })

    const $updatedNode = createVoucherRow(
      id,
      name,
      totalAmount,
      createdOn,
      totalCharge,
      paid,
      paymentMethod,
      cancelled
    )

    state.$editingVoucher.replaceWith($updatedNode)
    state.$editingVoucher = $updatedNode
  }

  const [$addVoucherForm, __setUpAddVoucherForm, __cleanUpAddVoucherForm] =
    addVoucherForm(__whenCreateNewVoucher)

  function __whenCreateNewVoucher() {
    const voucher = vouchers.data[0]

    if ($voucherInfoTableBody.childElementCount === 20) {
      $voucherInfoTableBody.lastChild.remove()
    }

    if (vouchers.currentPage === 0) {
      $voucherInfoTableBody.insertBefore(
        createVoucherRows([voucher]),
        $voucherInfoTableBody.firstChild
      )
    } else {
      const vcData = vouchers.data[vouchers.currentPage * 20]
      $voucherInfoTableBody.insertBefore(
        createVoucherRows([vcData]),
        $voucherInfoTableBody.firstChild
      )
    }

    ih_updatePageInfo()
  }

  const [$receiptPaper, __setUpReceiptPaper, __cleanUpReceiptPaper] =
    createReceipt()

  async function handleClickOnInfoWrapper(e) {
    if (e.target.tagName !== 'TD') return

    state.$editingVoucher = e.target.parentElement

    const id = Number(e.target.parentElement.dataset.vid)
    const { customer, receipt } = await getAVoucher(id)
    if (e.target.dataset.edit) {
      await __setUpEditVoucherForm(receipt)
      openModal($editVoucherForm)
    } else {
      await __setUpReceiptPaper(customer, receipt)
      openModal($receiptPaper)
    }
  }

  async function __setupFunc() {
    _.on('click', $prevBtn, handlePageChangePrev)
    _.on('click', $nextBtn, handlePageChangeNext)
    _.on('click', $voucherInfoTableBody, handleClickOnInfoWrapper)
    _.on('click', $openFormModalBtn, handleAddFormModal)
    await ih_handlePageChange(
      vouchers.data.slice(
        vouchers.currentPage * 20,
        (vouchers.currentPage + 1) * 20
      )
    )
  }

  async function __cleanupFunc() {
    _.removeOn('click', $prevBtn, handlePageChangePrev)
    _.removeOn('click', $nextBtn, handlePageChangeNext)
    _.removeOn('click', $voucherInfoTableBody, handleClickOnInfoWrapper)
    _.removeOn('click', $openFormModalBtn, handleAddFormModal)
    await __cleanUpEditVoucherForm()
    await __cleanUpAddVoucherForm()
    await __cleanUpReceiptPaper()
  }

  const $main = _.createElement(
    '',
    '',
    ['home-page'],
    [
      $openFormModalBtn,
      $timePeriodHeader,
      $voucherTableContainer,
      $pageControllers,
      $addVoucherForm,
      $receiptPaper,
      $editVoucherForm,
    ]
  )

  return [$main, __setupFunc, __cleanupFunc]
}
