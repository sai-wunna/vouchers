'use strict'

import _ from '../dom/index.js'
import { state } from '../state.js'

export default () => {
  const $heading = _.createHeading('h6', 'Profile', ['text-center'])

  const $companyLb = _.createLabel('Company : ', 'edit_profile_company', [
    'form-label',
  ])
  const $companyIp = _.createInput('', ['form-control'], 'edit_profile_company')
  function handleCompanyIpChange(e) {
    state.user.company = e.target.value || 'Test Company'
  }
  const $companyBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$companyLb, $companyIp]
  )

  const $addressLb = _.createLabel('Address : ', 'edit_profile_address', [
    'form-label',
  ])
  const $addressIp = _.createInput('', ['form-control'], 'edit_profile_address')
  function handleAddressIpChange(e) {
    state.user.address = e.target.value || 'Unstable Location'
  }
  const $addressBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$addressLb, $addressIp]
  )

  const $phoneLb = _.createLabel('Phone : ', 'edit_profile_phone', [
    'form-label',
  ])
  const $phoneIp = _.createInput('', ['form-control'], 'edit_profile_phone')
  function handlePhoneIpChange(e) {
    state.user.phone = e.target.value || 'No Stable Phone'
  }
  const $phoneBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$phoneLb, $phoneIp]
  )

  const $thanksLb = _.createLabel('In Receipt : ', 'edit_profile_thanks', [
    'form-label',
  ])
  const $thanksIp = _.createInput('', ['form-control'], 'edit_profile_thanks')
  function handleThanksIpChange(e) {
    state.user.receiptThanks = e.target.value || ''
  }
  const $receiptThanksBox = _.createElement(
    '',
    '',
    ['form-group'],
    [$thanksLb, $thanksIp]
  )

  const $main = _.createElement(
    '',
    '',
    ['set-up-profile-box'],
    [$heading, $companyBox, $addressBox, $phoneBox, $receiptThanksBox]
  )

  function __setUpFunc() {
    _.on('change', $companyIp, handleCompanyIpChange)
    _.on('change', $addressIp, handleAddressIpChange)
    _.on('change', $phoneIp, handlePhoneIpChange)
    _.on('change', $thanksIp, handleThanksIpChange)
    $companyIp.value = state.user.company
    $addressIp.value = state.user.address
    $phoneIp.value = state.user.phone
    $thanksIp.value = state.user.receiptThanks
  }

  function __cleanUpFunc() {
    _.removeOn('change', $companyIp, handleCompanyIpChange)
    _.removeOn('change', $addressIp, handleAddressIpChange)
    _.removeOn('change', $phoneIp, handlePhoneIpChange)
    _.removeOn('change', $thanksIp, handleThanksIpChange)
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
