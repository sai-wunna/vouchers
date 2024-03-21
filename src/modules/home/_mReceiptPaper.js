'use strict'

import _ from '../dom/index.js'
import { createModal } from '../helpers/createModal.js'
import {
  tHeader,
  convertToTBDataNTotalAmount,
} from '../helpers/receiptTBodyDataParser.js'

export default () => {
  // header
  const $vid = _.createElement('small', '', ['float-end'])
  const $receiptHeader = _.createElement(
    '',
    '',
    ['receipt-header'],
    [
      $vid,
      _.createHeading('h2', 'Hello World'),
      _.createElement('small', 'Pakokku, No 11, 16th street, Myanmar'),
      _.createElement('br'),
      _.createElement('small', '09-123-123-123, 09-321-321-321'),
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
  const $logo = _.createHeading('h4', 'LoGo')
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
          $logo,
          _.createElement(
            '',
            '',
            ['receipt-payment-info'],
            [$totalChargeHeader, $totalPaidHeader]
          ),
        ]
      ),
      $secretBox,
      _.createElement('', 'Thanks For Your Choice', ['receipt-thanks']),
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
    _.removeOn('click', $logo, toggleSecretBox)
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
    $totalChargeHeader.textContent = `Total ${totalCharge.toLocaleString()}ks`
    $totalPaidHeader.textContent = `Paid ${paid.toLocaleString()}ks`
    $note.textContent = `${note ? `Note - ${note}` : 'No Notes !!!'}`
    $updatedDate.textContent = `${
      updatedOn ? `This Voucher was updated on ${updatedOn}` : ''
    }`
    _.on('click', $logo, toggleSecretBox)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
