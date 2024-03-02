'use strict'

import _ from './dom/index.js'
import createVoucherForm from './home/createVoucherForm.js'
import createReceipt from './home/createReceipt.js'
import { vouchers, getAVoucher } from './state.js'
import { createVoucherRows } from './home/createVoucherRow.js'
import { openModal } from './general/createModal.js'
import { calculatePageDate, getFormatDate } from './helpers/getDate.js'
import createEditVoucherForm from './general/editVoucherForm.js'
import notifier from './notify.js'
// need to update vouchers pages
function createHomePage() {
  const memoizedPageNodes = {}

  function cleanFarMemoizedPageNodes(pageNo, nextPage = true) {
    const totalPageCount = vouchers.pages.length
    const memoizedPageCount = Object.keys(memoizedPageNodes).length

    if (totalPageCount < 6 && memoizedPageCount < 6) {
      return
    }

    const pageToDelete = nextPage ? pageNo - 5 : pageNo + 5

    if (memoizedPageNodes.hasOwnProperty(pageToDelete)) {
      delete memoizedPageNodes[pageToDelete]
    }
  }

  const $month = _.createHeading('h2', 'December', ['month-header'])
  // memoize 5 pages
  const $prevBtn = _.createButton('←', ['btn', 'btn-ghost', 'm-1'])

  async function handlePageChangePrev(e) {
    notifier.__start('Loading . . .')
    if (memoizedPageNodes.hasOwnProperty([vouchers.currentPage - 1])) {
      cleanFarMemoizedPageNodes(vouchers.currentPage - 1, false)
      handlePageChangeWithMemo((vouchers.currentPage -= 1))
      $nextBtn.disabled = false
      return
    }
    if (vouchers.currentPage > 0) {
      handlePageChange((vouchers.currentPage -= 1))
      $nextBtn.disabled = false
    } else {
      e.target.disabled = true
      notifier.__end('No More Pages', 'warning')
    }
  }

  const $nextBtn = _.createButton('→', ['btn', 'btn-ghost', 'm-1'])
  async function handlePageChangeNext(e) {
    notifier.__start('Loading . . .')
    if (memoizedPageNodes.hasOwnProperty([vouchers.currentPage + 1])) {
      cleanFarMemoizedPageNodes(vouchers.currentPage + 1, true)
      handlePageChangeWithMemo((vouchers.currentPage += 1))
      $prevBtn.disabled = false
      return
    }
    if (vouchers.currentPage < vouchers.pages.length - 1) {
      handlePageChange((vouchers.currentPage += 1))
      $prevBtn.disabled = false
    } else {
      e.target.disabled = true
      notifier.__end('No More Pages', 'warning')
    }
  }

  function handlePageChangeWithMemo(pageNo) {
    const { $pageNode, title } = memoizedPageNodes[pageNo]
    appendVoucherPage(title, $pageNode)
  }

  async function handlePageChange(pageNo) {
    // if empty
    const data = vouchers.pages[pageNo] || []

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
    $month.textContent = title
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
  // split as it is used frequently
  const $voucherInfoTableBody = _.createTBody(['data-info-box'], [])
  $voucherInfoTable.appendChild($voucherInfoTableBody)

  const [$editVoucherForm, __setUpEditVoucherForm, __cleanUpEditVoucherForm] =
    createEditVoucherForm()
  const [$addVoucherForm, __setUpAddVoucherForm, __cleanUpAddVoucherForm] =
    createVoucherForm()
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
    handlePageChange(0)
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
      $month,
      $voucherInfoTable,
      $controllers,
      $addVoucherForm,
      $receiptPaper,
      $editVoucherForm,
    ]
  )

  return [$main, __setupFunc, __cleanupFunc]
}

export default createHomePage
