'use strict'

import _ from '../dom/index.js'
import appendCustomStyles from '../helpers/appendCustomStyles.js'
import { goodTypesData, state, vouchers } from '../state'

export default () => {
  const $heading = _.createHeading('h6', 'App Config')

  const $starToChargeRtLb = _.createLabel(
    'Star To Charge Ratio :',
    'edit_app_conf_star',
    ['form-label']
  )
  const $starToChargeIp = _.createInput(
    'number',
    ['form-control'],
    'edit_app_conf_star',
    { min: 1, max: 10000 }
  )
  function handleStarChange(e) {
    const ratio = Number(e.target.value)
    if (ratio > 100000 || ratio < 1) return

    state.appConfig.starToChargeRatio = ratio
  }
  const $starToChargeBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$starToChargeRtLb, $starToChargeIp]
  )

  const $currencyLb = _.createLabel('Currency :', 'edit_app_conf_currency', [
    'form-label',
  ])
  const $currencyIp = _.createInput(
    '',
    ['form-control'],
    'edit_app_conf_currency'
  )
  function handleCurrencyChange(e) {
    const currency = e.target.value
    state.appConfig.currency = currency || '$'
    if (!currency) {
      e.target.value = '$'
    }
  }
  const $currencyBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$currencyLb, $currencyIp]
  )

  const $receiptBgThemeBox = _.createElement(
    '',
    '',
    ['receipt-bg-theme-box'],
    []
  )

  async function handleClickOnReceiptBgThemeBox(e) {
    const color = e.target.dataset?.color
    if (!color) return

    // set active color
    _.getNode('.active-receipt-bg-color').classList.remove(
      'active-receipt-bg-color'
    )
    e.target.classList.add('active-receipt-bg-color')

    state.appConfig.receiptBgColor = color
    await appendCustomStyles(goodTypesData, color)
  }

  function ih_createColorSelector(color, selected) {
    const classList = ['receipt-bg-color-sample']
    if (selected) {
      classList.push('active-receipt-bg-color')
    }

    const colorSample = _.createElement('', '', classList)
    colorSample.style.backgroundColor = color
    colorSample.dataset.color = color

    return colorSample
  }

  const $receiptBgColorBox = _.createElement(
    '',
    '',
    ['form-group'],
    [_.createSpan('Receipt Color'), $receiptBgThemeBox]
  )

  const $main = _.createElement(
    '',
    '',
    ['app-config-box'],
    [$heading, $starToChargeBox, $currencyBox, $receiptBgColorBox]
  )

  function __setUpFunc() {
    _.on('change', $starToChargeIp, handleStarChange)
    _.on('change', $currencyIp, handleCurrencyChange)
    _.on('click', $receiptBgThemeBox, handleClickOnReceiptBgThemeBox)
    $starToChargeIp.value = state.appConfig.starToChargeRatio
    $currencyIp.value = state.appConfig.currency
    if (vouchers.length > 0) {
      $starToChargeIp.disabled = true
    }
    _.emptyChild($receiptBgThemeBox)
    const currentColor = state.appConfig.receiptBgColor
    for (const color of state.availableReceiptBgColors) {
      $receiptBgThemeBox.appendChild(
        ih_createColorSelector(color, color === currentColor)
      )
    }
  }

  function __cleanUpFunc() {
    _.removeOn('change', $starToChargeIp, handleStarChange)
    _.removeOn('change', $currencyIp, handleCurrencyChange)
    _.removeOn('click', $receiptBgThemeBox, handleClickOnReceiptBgThemeBox)
    $starToChargeIp.disabled = false
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
