'use strict'

import _ from './dom/index.js'
import addVoucherForm from './home/addVoucherForm.js'
import createReceipt from './home/createReceipt.js'
import { vouchers, getAVoucher } from './state.js'
import { createVoucherRows } from './home/createVoucherRow.js'
import { openModal } from './general/createModal.js'
import { calculatePageDate, getFormatDate } from './helpers/getDate.js'
import createEditVoucherForm from './general/editVoucherForm.js'
import notifier from './notify.js'

function createHomePage() {
  const memoizedPageNodes = {}

  function cleanFarMemoizedPageNodes(pageNo, nextPage = true) {
    const totalPageCount = Math.floor(vouchers.data.length / 20)
    const memoizedPageCount = Object.keys(memoizedPageNodes).length
    if (totalPageCount < 6 && memoizedPageCount < 6) {
      return
    }
    const pageToDelete = nextPage ? pageNo - 5 : pageNo + 5
    if (memoizedPageNodes.hasOwnProperty(pageToDelete)) {
      delete memoizedPageNodes[pageToDelete]
    }
  }

  const $timePeriodHeader = _.createHeading('h2', 'December', [
    'time-period-header',
  ])

  const $prevBtn = _.createButton('←', ['btn', 'btn-ghost', 'm-1'])
  async function handlePageChangePrev(e) {
    notifier.__start('Loading . . .')
    if (memoizedPageNodes.hasOwnProperty(vouchers.currentPage - 1)) {
      cleanFarMemoizedPageNodes(vouchers.currentPage - 1, false)
      handlePageChangeWithMemo((vouchers.currentPage -= 1))
      $nextBtn.disabled = false
      return
    }
    const data = vouchers.data.slice(
      (vouchers.currentPage - 1) * 20,
      vouchers.currentPage * 20
    )
    if (data.length > 0) {
      handlePageChange(data, (vouchers.currentPage -= 1))
      $nextBtn.disabled = false
    } else {
      e.target.disabled = true
      notifier.__end('No More Pages', 'warning')
    }
  }

  const $nextBtn = _.createButton('→', ['btn', 'btn-ghost', 'm-1'])
  async function handlePageChangeNext(e) {
    notifier.__start('Loading . . .')
    if (memoizedPageNodes.hasOwnProperty(vouchers.currentPage + 1)) {
      cleanFarMemoizedPageNodes(vouchers.currentPage + 1, true)
      handlePageChangeWithMemo((vouchers.currentPage += 1))
      $prevBtn.disabled = false
      return
    }
    const data = vouchers.data.slice(
      (vouchers.currentPage + 1) * 20,
      (vouchers.currentPage + 2) * 20
    )
    if (data.length > 0) {
      handlePageChange(data, (vouchers.currentPage += 1))
      $prevBtn.disabled = false
    } else {
      e.target.disabled = true
      notifier.__end('No More Pages', 'warning')
    }
  }

  function handlePageChangeWithMemo(pageNo) {
    const { $pageNode, title } = memoizedPageNodes[pageNo]
    appendVoucherPage(title, $pageNode.cloneNode(true))
  }

  async function handlePageChange(data = [], pageNo) {
    const formatDate = getFormatDate()
    const title = calculatePageDate(
      data[0]?.createdOn || formatDate,
      data[data.length - 1]?.createdOn || formatDate
    )
    const $pageNode = await createVoucherRows(data)
    memoizedPageNodes[pageNo] = { title, $pageNode: $pageNode.cloneNode(true) }

    appendVoucherPage(title, $pageNode)
  }

  function appendVoucherPage(title, $pageNode) {
    _.emptyChild($voucherInfoTableBody)
    $timePeriodHeader.textContent = title
    $voucherInfoTableBody.appendChild($pageNode)
    notifier.__end('Page Has been loaded', 'success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const $openFormModalBtn = _.createButton('Add', ['btn', 'btn-blue'])
  async function handleAddFormModal() {
    await __setUpAddVoucherForm()
    openModal($addVoucherForm)
  }

  const $controllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$openFormModalBtn, _.createElement('', '', [], [$prevBtn, $nextBtn])]
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

  const [$editVoucherForm, __setUpEditVoucherForm, __cleanUpEditVoucherForm] =
    createEditVoucherForm()
  const [$addVoucherForm, __setUpAddVoucherForm, __cleanUpAddVoucherForm] =
    addVoucherForm()
  const [$receiptPaper, __setUpReceiptPaper, __cleanUpReceiptPaper] =
    createReceipt()

  async function handleClickOnInfoWrapper(e) {
    if (e.target.tagName !== 'TD') return
    const id = parseInt(e.target.parentElement.dataset.vid)
    const { customer, receipt } = await getAVoucher(id)
    if (e.target.dataset.edit) {
      await __setUpEditVoucherForm(
        receipt,
        e.target.parentElement,
        customer.name
      )
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
    handlePageChange(
      vouchers.data.slice(
        vouchers.currentPage * 20,
        (vouchers.currentPage + 1) * 20
      ),
      vouchers.currentPage
    )
  }

  function __cleanupFunc() {
    _.removeOn('click', $prevBtn, handlePageChangePrev)
    _.removeOn('click', $nextBtn, handlePageChangeNext)
    _.removeOn('click', $voucherInfoTableBody, handleClickOnInfoWrapper)
    _.removeOn('click', $openFormModalBtn, handleAddFormModal)
    __cleanUpEditVoucherForm()
    __cleanUpAddVoucherForm()
    __cleanUpReceiptPaper()
  }

  const $main = _.createElement(
    '',
    '',
    ['home-page'],
    [
      $timePeriodHeader,
      $voucherTableContainer,
      $controllers,
      $addVoucherForm,
      $receiptPaper,
      $editVoucherForm,
    ]
  )

  return [$main, __setupFunc, __cleanupFunc]
}

export default createHomePage
