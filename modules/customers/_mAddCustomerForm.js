'use strict'

import { saveNewCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createModal } from '../helpers/createModal.js'
import notifier from '../notify.js'
import { getFormatDate } from '../helpers/getDate.js'

export default (__whenCreateNewCustomer) => {
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
      const phone =
        $phoneIp.value.trim().length > 0 ? $phoneIp.value.split(',') : ''
      const company = $companyIp.value
      const date = getFormatDate()
      await saveNewCustomer(name, address, phone, date, company)
      await __whenCreateNewCustomer()
      notifier.__end('Successfully Created', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  const [$main, __cleanUpModal] = createModal($form, __sleepFunc)

  function __sleepFunc() {
    _.removeOn('click', $createBtn, handleClick)
    $nameIp.value = $addressIp.value = $phoneIp.value = null
  }

  function __setUpFunc() {
    $nameIp.focus()
    _.on('click', $createBtn, handleClick)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
