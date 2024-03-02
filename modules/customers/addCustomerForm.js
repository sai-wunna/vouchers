'use strict'

import { saveNewCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createModal } from '../general/createModal.js'
import notifier from '../notify.js'
import { createCustomerRow } from './createCustomerRow.js'
import { getFormatDate } from '../helpers/getDate.js'

function createAddCustomerForm($customerList) {
  const $createBtn = _.createButton('Create', [
    'btn',
    'btn-blue',
    'float-end',
    'm-1',
  ])
  const $nameIp = _.createInput('', ['form-control'], 'new_cus_name')
  const $addressIp = _.createInput('', ['form-control'], 'new_cus_address')
  const $phoneIp = _.createInput('', ['form-control'], 'new_cus_phone')
  const $companyIp = _.createInput('', ['form-control'], 'new_cus_company')
  const $form = _.createElement(
    '',
    '',
    ['create-customer-form'],
    [
      _.createHeading('h2', 'Hello Customer', ['text-center']),
      _.createLabel('Name', 'new_cus_name', ['form-label']),
      $nameIp,
      _.createLabel('Address', 'new_cus_address', ['form-label']),
      $addressIp,
      _.createLabel('Phone', 'new_cus_phone', ['form-label']),
      $phoneIp,
      _.createLabel('Company', 'new_cus_company', ['form-label']),
      $companyIp,
      $createBtn,
    ]
  )

  async function handleClick() {
    try {
      notifier.__start('Creating user', 'info')
      const name = $nameIp.value
      const address = $addressIp.value
      const phone = $phoneIp.value.split(',')
      const company = $companyIp.value
      const date = getFormatDate()
      const newCustomer = await saveNewCustomer(
        name,
        address,
        phone,
        date,
        company
      )
      const $newCustomer = await createCustomerRow(newCustomer)
      $customerList.insertBefore($newCustomer, $customerList.firstChild)
      notifier.__end('Successfully Created', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  function __setUpFunc() {
    _.on('click', $createBtn, handleClick)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }
  // remove listener when modal close
  const [$main, __cleanUpModal] = createModal($form, () => {
    _.removeOn('click', $createBtn, handleClick)
    $nameIp.value = $addressIp.value = $phoneIp.value = ''
  })

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createAddCustomerForm
