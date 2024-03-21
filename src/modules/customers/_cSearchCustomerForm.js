'use strict'

import { searchCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createCustomerRows } from './_ncCustomerRow.js'

export default ($customerList) => {
  let spamBlocker = null

  const $searchIp = _.createInput(
    'search',
    ['form-search'],
    'search_customer_ip',
    {
      placeholder: 'type here to search . . .',
    }
  )

  function handleSearch(e) {
    try {
      _.emptyChild($customerList)
      clearTimeout(spamBlocker)
      if (!e.target.value) return
      spamBlocker = setTimeout(async () => {
        const customers = await searchCustomer(
          e.target.value,
          $searchTypeSelect.value
        )
        const $customers = await createCustomerRows(customers)
        $customerList.appendChild($customers)
      }, 300)
    } catch (error) {
      console.log(error)
    }
  }

  const $searchTypeSelect = _.createSelect(['search-type-select'], '', [
    { value: 'name', text: 'Name' },
    { value: 'address', text: 'Address' },
  ])

  const $searchBox = _.createElement(
    '',
    '',
    [
      'search-box',
      'd-flex',
      'justify-content-center',
      'align-items-center',
      'g-1',
      'd-none',
    ],
    [$searchIp, _.createElement('span', 'By'), $searchTypeSelect]
  )

  function _setUpFunc() {
    _.on('input', $searchIp, handleSearch)
  }

  function _cleanUpFunc() {
    _.removeOn('input', $searchIp, handleSearch)
  }

  return [$searchBox, _setUpFunc, _cleanUpFunc]
}
