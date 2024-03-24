'use strict'

import _ from '../dom/index.js'
import { createModal } from '../helpers/createModal.js'
import {
  tHeader,
  convertToTBDataNTotalAmount,
} from '../helpers/receiptTBodyDataParser.js'
import { state } from '../state.js'

export default () => {
  const {
    user: { company, phone, address, receiptThanks },
    appConfig: { currency },
  } = state
  // header
  const $vid = _.createElement('small', '', ['float-end'])
  const $receiptHeader = _.createElement(
    '',
    '',
    ['receipt-header'],
    [
      $vid,
      _.createHeading('h2', company),
      _.createElement('small', address),
      _.createElement('br'),
      _.createElement('small', phone),
      _.createElement('br'),
    ]
  )

  // body
  const $createdDate = _.createHeading('h6', '', ['float-end'])
  const $name = _.createNode('h6')
  const $address = _.createNode('p')
  const $phones = _.createNode('p')
  const $receiptCusInfo = _.createElement(
    '',
    '',
    ['receipt-customer-info'],
    [$createdDate, $name, $address, $phones]
  )
  const $receiptTable = _.createTable(['receipt-table'], tHeader, { rows: [] })
  const $receiptBody = _.createElement(
    '',
    '',
    ['receipt-body'],
    [$receiptCusInfo, $receiptTable]
  )

  // footer
  // here note box -----
  const $noteToggler = _.createHeading('h4', 'Note')
  const $note = _.createSpan()
  const $updatedDate = _.createNode('i')
  const $secretBox = _.createElement(
    '',
    '',
    ['receipt-secret', 'hide-content-by-x-axis'],
    [$note, _.createElement('br'), $updatedDate]
  )
  // listener
  let show = true
  function toggleSecretBox(e) {
    e.preventDefault()
    $secretBox.classList.toggle('hide-content-by-x-axis')
    show = !show
  }
  // footer data
  const $totalChargeHeader = _.createNode('h6')
  const $totalPaidHeader = _.createNode('h6')
  const $receiptFooter = _.createElement(
    '',
    '',
    ['receipt-footer'],
    [
      _.createElement(
        '',
        '',
        ['receipt-summary'],
        [
          $noteToggler,
          _.createElement(
            '',
            '',
            ['receipt-payment-info'],
            [$totalChargeHeader, $totalPaidHeader]
          ),
        ]
      ),
      $secretBox,
      _.createElement('', receiptThanks, ['receipt-thanks']),
    ]
  )

  const $box = _.createElement(
    '',
    '',
    ['receipt-box'],
    [$receiptHeader, $receiptBody, $receiptFooter]
  )

  const [$main, __cleanUpModal] = createModal($box, __sleepFunc)

  function __sleepFunc() {
    _.removeOn('click', $noteToggler, toggleSecretBox)
  }

  function __setUpFunc(customer, receipt) {
    const { name, address, phone } = customer
    const { id, goodInfo, createdOn, paid, updatedOn, note } = receipt
    // set header
    $vid.textContent = `vid-${id}`

    // set body
    $createdDate.textContent = createdOn
    $name.textContent = name
    $address.textContent = `Addr : ${address || 'unknown'}`
    $phones.textContent = `Phone : ${
      phone.length > 0 ? phone.join(', ') : 'unknown'
    }`

    const [totalCharge, rows] = convertToTBDataNTotalAmount(goodInfo) // convert to tBodyData
    const $tableBody = _.createTBody('', rows)
    $receiptTable.lastChild.replaceWith($tableBody)
    // set footer
    $totalChargeHeader.textContent = `Total ${totalCharge.toLocaleString()}${currency}`
    $totalPaidHeader.textContent = `Paid ${paid.toLocaleString()}${currency}`
    $note.textContent = `${note ? `Note - ${note}` : 'No Notes !!!'}`
    $updatedDate.textContent = `${
      updatedOn ? `This Voucher was updated on ${updatedOn}` : ''
    }`
    _.on('click', $noteToggler, toggleSecretBox)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
