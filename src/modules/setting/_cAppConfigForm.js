'use strict'

import _ from '../dom/index.js'
import { state, vouchers } from '../state'

export default () => {
  const $heading = _.createHeading('h6', 'App Config', ['my-1'])

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

  const $main = _.createElement(
    '',
    '',
    ['app-config-box'],
    [$heading, $starToChargeBox, $currencyBox]
  )

  function __setUpFunc() {
    _.on('change', $starToChargeIp, handleStarChange)
    _.on('change', $currencyIp, handleCurrencyChange)
    $starToChargeIp.value = state.appConfig.starToChargeRatio
    $currencyIp.value = state.appConfig.currency
    if (vouchers.length > 0) {
      $starToChargeIp.disabled = true
    }
  }

  function __cleanUpFunc() {
    _.removeOn('change', $starToChargeIp, handleStarChange)
    _.removeOn('change', $currencyIp, handleCurrencyChange)
    $starToChargeIp.disabled = false
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
