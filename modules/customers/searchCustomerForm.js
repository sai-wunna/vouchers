'use strict'

import { searchCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createCustomerRows } from './createCustomerRow.js'

function createSearchBox($customerList) {
  // here handle

  let spamBlocker = null
  function handleSearch(e) {
    _.emptyChild($customerList)
    clearTimeout(spamBlocker)
    if (!e.target.value) return
    spamBlocker = setTimeout(async () => {
      const customers = await searchCustomer(
        e.target.value.toLowerCase(),
        $searchTypeSelect.value.toLowerCase()
      )
      const $customers = await createCustomerRows(customers)
      $customerList.appendChild($customers)
    }, 300)
  }

  const $searchIp = _.createInput('search', ['form-search'], '', {
    placeholder: 'type here to search . . .',
  })

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

export default createSearchBox
