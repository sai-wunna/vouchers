'use strict'

import _ from '../dom/index.js'
//  for add form
function createVoucherRow(
  id,
  name,
  totalAmount,
  createdOn,
  totalCharge,
  paid,
  paymentMethod,
  cancelled
) {
  const classList = []
  if (Number(totalCharge) > Number(paid)) {
    classList.push('ongoing-voucher-info')
  }

  if (cancelled) {
    classList.push('cancelled-voucher-info')
  }

  const $date = _.createElement('td', createdOn.substring(5), [
    'vc-created-date',
  ])
  $date.dataset.edit = true

  const $tr = _.createElement('tr', '', classList, [
    $date,
    _.createElement('td', name.slice(0, 20)),
    _.createElement('td', `${totalAmount}`),
    _.createElement('td', totalCharge.toLocaleString(), ['cell-md-show']),
    _.createElement('td', paid.toLocaleString()),
    _.createElement('td', paymentMethod, ['cell-md-show']),
  ])

  $tr.dataset.vid = id
  $tr.dataset.createdOn = createdOn

  return $tr
}
//  for showing in table

function createVoucherRows(data) {
  const $fragment = _.createFragment()

  data.forEach((rowData) => {
    const { paid, goodInfo, createdOn, name, paymentMethod, id, cancelled } =
      rowData
    let totalAmount = 0
    let totalCharge = 0
    for (const singleGoodInfo of goodInfo) {
      totalAmount += parseInt(singleGoodInfo.amount)
      totalCharge += Number(singleGoodInfo.charge)
    }

    const $tr = createVoucherRow(
      id,
      name,
      totalAmount,
      createdOn,
      totalCharge,
      paid,
      paymentMethod,
      cancelled
    )

    $fragment.appendChild($tr)
  })
  return $fragment
}

export { createVoucherRow, createVoucherRows }
