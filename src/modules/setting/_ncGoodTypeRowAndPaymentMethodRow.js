'use strict'

import _ from '../dom/index.js'

function createGoodTypeRow(shortKey, goodType, borderColor, bgColor) {
  const $colorSample = _.createSpan('Color Sample', ['color-sample'])
  $colorSample.style.backgroundColor = bgColor
  $colorSample.style.border = `4px solid ${borderColor}`
  const $removeBtn = _.createButton('x', ['btn-corner-right', 'btn-ghost'])
  $removeBtn.dataset.key = shortKey
  return _.createElement(
    '',
    '',
    ['good-type-info-row'],
    [
      $removeBtn,
      $colorSample,
      _.createSpan(`Short Key : ${shortKey}`),
      _.createElement('', `Goods Type : ${goodType}`),
    ]
  )
}

function createPaymentMethodRow(shortKey, method) {
  const $removeBtn = _.createButton('x', ['btn-corner-right', 'btn-ghost'])
  $removeBtn.dataset.key = shortKey
  return _.createElement(
    '',
    '',
    ['payment-method-info-row'],
    [
      $removeBtn,
      _.createElement('', `Short Key : ${shortKey}`),
      _.createElement('', `Method : ${method}`),
    ]
  )
}

export { createGoodTypeRow, createPaymentMethodRow }
