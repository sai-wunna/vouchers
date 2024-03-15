'use strict'

import _ from './dom/index.js'
import notifier from './notify.js'
import {
  createCustomerRow,
  createCustomerRows,
} from './customers/_ncCustomerRow.js'
import searchCustomerForm from './customers/_cSearchCustomerForm.js'
import createCustomerDetail from './customers/_spCustomerDetail.js'
import { customers, sortCustomersBy } from './state.js'
import createAddCustomerForm from './customers/_mAddCustomerForm.js'
import { openModal } from './helpers/createModal.js'
import lockBtn from './helpers/lockBtn.js'

export default () => {
  let sortedCustomersData = []

  const $allCustomersBox = _.createElement('', '', ['all-customers'])
  const $customerList = _.createElement('ul', '', ['customer-list'])

  async function handleClickOnCustomerList(e) {
    if (![e.target.tagName, e.target.parentElement.tagName].includes('LI'))
      return
    // if not LI return, else open customer detail
    const id = e.target.id || e.target.parentElement.id

    await __setUpCustomerDetail(Number(id.split('-')[1]))
    $allCustomersBox.classList.add('d-none')
    $customerDetail.classList.remove('d-none')
  }

  const [$searchCustomerForm, __setUpSearchBox, __cleanUpSearchBox] =
    searchCustomerForm($customerList)

  const [$addCustomerForm, __setUpAddCustomerForm, __cleanUpAddCustomerForm] =
    createAddCustomerForm(__whenCreateNewCustomer)

  async function __whenCreateNewCustomer() {
    const $newCustomer = await createCustomerRow(customers[0])
    $customerList.insertBefore($newCustomer, $customerList.firstChild)
  }

  const [$customerDetail, __setUpCustomerDetail, __cleanUpCustomerDetail] =
    createCustomerDetail(__whenQuitSubPage)

  function __whenQuitSubPage() {
    $allCustomersBox.classList.remove('d-none')
    $customerDetail.classList.add('d-none')
  }

  const $addCustomerBtn = _.createButton('+ Add', ['btn', 'btn-blue', 'm-1'])
  function handleAddCustomerModal() {
    openModal($addCustomerForm)
    __setUpAddCustomerForm()
  }

  let searchMode = false
  const $searchCustomerBtn = _.createButton('Search', ['btn', 'btn-blue'])
  // to make better ui
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
      ioLoadedCount = 20
      ioScrollBack = false
      intersectionObserver.observe($intersectionObserver)
      ih_appendCustomerRows()
    } else {
      e.target.textContent = 'X'
      $searchCustomerForm.classList.remove('d-none')
      $sortSelectBox.classList.add('d-none')
      $addCustomerBtn.classList.add('d-none')
      e.target.classList.add('btn-red')
      _.getNodeOn($searchCustomerForm, '#search_customer_ip').focus()
      // remove observer
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
    notifier.__startILLoader()
    e.target.disabled = true

    sortedCustomersData = await sortCustomersBy(e.target.value)
    _.emptyChild($customerList)
    ih_appendCustomerRows()
    ioLoadedCount = 20
    ioScrollBack = true

    let timerId = setTimeout(() => {
      e.target.disabled = false
      clearTimeout(timerId)
    }, 5000)
    notifier.__endILLoader()
  }

  const $sortSelectBox = _.createElement('', '', '', [
    _.createElement('span', 'Sort By'),
    $sortUsersSelect,
  ])

  const $controllers = _.createElement(
    '',
    '',
    ['controllers'],
    [
      $sortSelectBox,
      $searchCustomerForm,
      _.createElement('', '', [], [$addCustomerBtn, $searchCustomerBtn]),
    ]
  )

  // auto loader ---------------------------------- start
  let ioLoadedCount = 20 // stop when sortedCustomersData.length
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
          ih_appendCustomerRows(
            sortedCustomersData.slice(ioLoadedCount, (ioLoadedCount += 20))
          )
          $intersectionObserver.textContent = ''
          clearTimeout(timer)
        }, 500)
      })
    },
    { threshold: 1 }
  )
  // auto loader ---------------------------------- end
  async function ih_appendCustomerRows(data) {
    $customerList.appendChild(
      await createCustomerRows(data || sortedCustomersData.slice(0, 20))
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
    await __setUpSearchBox()
    _.on('click', $addCustomerBtn, handleAddCustomerModal)
    _.on('click', $searchCustomerBtn, handleSearchCustomerModal)
    _.on('click', $customerList, handleClickOnCustomerList)
    _.on('change', $sortUsersSelect, handleSortUsers)
    sortedCustomersData = await sortCustomersBy('stars')
    ih_appendCustomerRows()
    intersectionObserver.observe($intersectionObserver)
  }

  async function __cleanupFunc() {
    sortedCustomersData = null
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
