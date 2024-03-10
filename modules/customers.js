'use strict'

import _ from './dom/index.js'
import { createCustomerRows } from './customers/createCustomerRow.js'
import searchCustomerForm from './customers/searchCustomerForm.js'
import createCustomerDetail from './customers/customerDetail.js'
import { sortCustomersBy } from './state.js'
import createAddCustomerForm from './customers/addCustomerForm.js'
import { openModal } from './general/createModal.js'
import lockBtn from './helpers/lockBtn.js'

function createCustomersPage() {
  let sortedCustomersData = []
  const $allCustomersBox = _.createElement('', '', ['all-customers'])

  const $customerList = _.createElement('ul', '', ['customer-list'])

  async function handleClickOnCustomerList(e) {
    if (![e.target.tagName, e.target.parentElement.tagName].includes('LI'))
      return
    // if not LI return, else open customer detail
    const id = e.target.id || e.target.parentElement.id

    await __setUpCustomerDetail(parseInt(id.split('-')[1]))
    // here go to customer detail ( toggle components )
    $allCustomersBox.classList.add('d-none')
    $customerDetail.classList.remove('d-none')
  }

  const [$searchCustomerForm, __setUpSearchBox, __cleanUpSearchBox] =
    searchCustomerForm($customerList)

  const [$addCustomerForm, __setUpAddCustomerForm, __cleanUpAddCustomerForm] =
    createAddCustomerForm($customerList)

  const [$customerDetail, __setUpCustomerDetail, __cleanUpCustomerDetail] =
    createCustomerDetail($allCustomersBox)

  const $addCustomerBtn = _.createButton('Add', ['btn', 'btn-blue'])
  function handleAddCustomerModal() {
    __setUpAddCustomerForm()
    openModal($addCustomerForm)
  }

  let searchMode = false
  const $searchCustomerBtn = _.createButton('Search', ['btn', 'btn-blue'])

  async function handleSearchCustomerModal(e) {
    lockBtn(e.target)
    _.emptyChild($customerList)
    if (searchMode) {
      e.target.textContent = 'Search'
      e.target.classList.remove('btn-red')
      $searchCustomerForm.classList.add('d-none')
      $sortSelectBox.classList.remove('d-none')
      $addCustomerBtn.classList.remove('d-none')
      // reattach observer
      ioLoadedCount = 10
      ioScrollBack = false
      intersectionObserver.observe($intersectionObserver)
      appendCustomerRows()
    } else {
      e.target.textContent = 'X'
      $searchCustomerForm.classList.remove('d-none')
      $sortSelectBox.classList.add('d-none')
      $addCustomerBtn.classList.add('d-none')
      e.target.classList.add('btn-red')
      // reset observer
      intersectionObserver.unobserve($intersectionObserver)
    }
    searchMode = !searchMode
  }

  const $sortUsersSelect = _.createSelect(['search-type-select'], '', [
    { value: 'stars', text: 'Stars' },
    { value: 'favorite', text: 'Favorite' },
    { value: 'olderFirst', text: 'Latest First' },
    { value: 'newerFirst', text: 'Oldest First' },
  ])

  async function handleSortUsers(e) {
    sortedCustomersData = await sortCustomersBy(e.target.value)
    _.emptyChild($customerList)
    appendCustomerRows()
    ioLoadedCount = 10
    ioScrollBack = true
  }

  const $sortSelectBox = _.createElement(
    '',
    '',
    [],
    [_.createElement('span', 'Sort By'), $sortUsersSelect]
  )

  const $controllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$addCustomerBtn, $sortSelectBox, $searchCustomerForm, $searchCustomerBtn]
  )

  // auto loader ---------------------------------- start
  let ioLoadedCount = 10 // stop when sortedCustomersData.length
  let ioScrollBack = false // this is weird, but works ( instead of entry.target.isIntercepting)
  const $intersectionObserver = _.createElement('', '', [
    'customers-intersection-observer',
    'text-center',
  ])

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      ioScrollBack = !ioScrollBack
      if (ioScrollBack) {
        return
      }
      if (ioLoadedCount > sortedCustomersData.length) {
        return
      }
      entries.forEach((entry) => {
        $intersectionObserver.textContent = 'Loading . . .'
        // loaded += 10
        const timer = setTimeout(async () => {
          appendCustomerRows(
            sortedCustomersData.slice(ioLoadedCount, (ioLoadedCount += 10))
          )
          $intersectionObserver.textContent = ''
          clearTimeout(timer)
        }, 500)
      })
    },
    { threshold: 1 }
  )
  // auto loader ---------------------------------- end
  async function appendCustomerRows(data) {
    $customerList.appendChild(
      await createCustomerRows(data || sortedCustomersData.slice(0, 10))
    )
  }

  _.appendChildrenTo($allCustomersBox, [
    $controllers,
    $customerList,
    $intersectionObserver,
  ])

  const $main = _.createElement(
    '',
    '',
    ['customer-page'],
    [$allCustomersBox, $customerDetail, $addCustomerForm]
  )

  async function __setupFunc() {
    $searchCustomerForm.classList.add('d-none')
    $customerDetail.classList.add('d-none')
    await __setUpSearchBox()
    _.on('click', $addCustomerBtn, handleAddCustomerModal)
    _.on('click', $searchCustomerBtn, handleSearchCustomerModal)
    _.on('click', $customerList, handleClickOnCustomerList)
    _.on('change', $sortUsersSelect, handleSortUsers)
    sortedCustomersData = await sortCustomersBy('stars')
    appendCustomerRows()
    intersectionObserver.observe($intersectionObserver)
  }

  async function __cleanupFunc() {
    sortedCustomersData = []
    await __cleanUpSearchBox()
    await __cleanUpCustomerDetail()
    await __cleanUpAddCustomerForm()
    _.removeOn('change', $sortUsersSelect, handleSortUsers)
    _.removeOn('click', $addCustomerBtn, handleAddCustomerModal)
    _.removeOn('click', $searchCustomerBtn, handleSearchCustomerModal)
    _.removeOn('click', $customerList, handleClickOnCustomerList)
    intersectionObserver.unobserve($intersectionObserver)
  }

  return [$main, __setupFunc, __cleanupFunc]
}

export default createCustomersPage
