'use strict'

import _ from '../dom/index.js'
import {
  tHeader,
  convertToTBDataNTotalAmount,
} from '../helpers/receiptTBodyDataParser.js'
import { state } from '../state.js'

function createVoucherCard(data) {
  const {
    id,
    createdOn,
    updatedOn,
    note,
    goodInfo,
    paymentMethod,
    paid,
    cancelled,
  } = data

  const currency = state.appConfig.currency

  const $editBtn = _.createButton('Edit', ['btn-corner-right', 'btn-blue'])
  $editBtn.dataset.vid = id

  const [totalCharge, rows] = convertToTBDataNTotalAmount(goodInfo) // convert to tBodyData

  const classList = ['customer-voucher', 'p-relative']
  if (totalCharge > paid) {
    classList.push('ongoing-voucher')
  }
  if (cancelled) {
    classList.push('cancelled-voucher')
  }

  return _.createElement('', '', classList, [
    $editBtn,
    _.createElement('span', createdOn),
    _.createElement(
      '',
      '',
      ['receipt-body'],
      [_.createTable(['receipt-table'], tHeader, { rows })]
    ),
    _.createHeading('h6', paymentMethod, ['float-start']),
    _.createHeading('h6', `Total ${totalCharge.toLocaleString()}${currency}`, [
      'text-end',
    ]),
    _.createHeading('h6', `Paid ${paid.toLocaleString()}${currency}`, [
      'text-end',
    ]),
    _.createElement(
      '',
      '',
      ['receipt-secret', 'hide-content-by-x-axis'],
      [
        _.createElement('', note || 'No Note !!!'),
        _.createElement(
          'i',
          updatedOn ? `This data was updated on ${updatedOn}` : ''
        ),
      ]
    ),
  ])
}

export default createVoucherCard
