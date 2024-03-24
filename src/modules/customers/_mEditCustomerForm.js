'use strict'

import { deleteCustomer, updateCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createModal } from '../helpers/createModal.js'
import notifier from '../notify.js'
import { lockNav } from '../helpers/navLocker.js'
import lockBtn from '../helpers/lockBtn.js'

function createEditCustomerForm(__whenDeleteCustomer, __whenUpdateCustomer) {
  let customerInfo = null

  const $deleteBtn = _.createButton('Delete', ['btn-corner-left', 'btn-red'])
  async function handleDelete(e) {
    try {
      const isProcessCompleted = await deleteCustomer(customerInfo.id)
      if (!isProcessCompleted) {
        notifier.on('sww', 'error')
        return
      }
      await __whenDeleteCustomer()
      $updateBtn.disabled = true
      notifier.on('deleteComplete', 'success')
      lockNav('Deleted Customer !!!')
    } catch (error) {
      console.log(error)
    }
  }

  const $updateBtn = _.createButton('Update', [
    'btn',
    'btn-blue',
    'float-end',
    'm-1',
  ])
  async function handleUpdate(e) {
    lockBtn(e.target, 3000)
    try {
      notifier.__start('Updating User Info')

      customerInfo.name = $nameIp.value
      customerInfo.address = $addressIp.value
      customerInfo.phone =
        $phoneIp.value.trim().length > 0 ? $phoneIp.value.split(',') : ''
      customerInfo.favorite = $favoriteIp.checked
      customerInfo.company = $companyIp.value

      await updateCustomer(customerInfo)
      await __whenUpdateCustomer()

      lockNav(`${customerInfo.favorite ? '✔ ' : ''}${customerInfo.name}`)
      notifier.__end('Successfully Updated', 'success')
    } catch (error) {
      notifier.__end('Something went wrong', 'error')
      console.log(error)
    }
  }

  const $nameIp = _.createInput('', ['form-control'], 'edit_cus_name')
  const $addressIp = _.createInput('', ['form-control'], 'edit_cus_address')
  const $phoneIp = _.createInput('', ['form-control'], 'edit_cus_phone')
  const $favoriteIp = _.createInput(
    'checkbox',
    ['form-check'],
    'edit_cus_favorite'
  )
  const $companyIp = _.createInput('', ['form-control'], 'edit_cus_company')

  const $form = _.createElement(
    '',
    '',
    ['edit-customer-form', 'p-relative'],
    [
      $deleteBtn,
      _.createHeading('h2', 'Edit Customer Info', ['text-center', 'my-1']),
      _.createLabel('Name', 'edit_cus_name', ['form-label']),
      $nameIp,
      _.createLabel('Address', 'edit_cus_address', ['form-label']),
      $addressIp,
      _.createLabel('Phone', 'edit_cus_phone', ['form-label']),
      $phoneIp,
      _.createLabel('Company', 'edit_cus_company', ['form-label']),
      $companyIp,
      _.createElement(
        '',
        '',
        ['check-box-group'],
        [
          $favoriteIp,
          _.createLabel('Add To Favorites', 'edit_cus_favorite', [
            'form-check-label',
          ]),
        ]
      ),
      $updateBtn,
    ]
  )

  const [$main, __cleanUpModal] = createModal($form, __sleepFunc)

  function __sleepFunc() {
    _.removeOn('click', $updateBtn, handleUpdate)
    _.removeOn('click', $deleteBtn, handleDelete)
  }

  function __setUpFunc(customer) {
    $updateBtn.disabled = false
    _.on('click', $deleteBtn, handleDelete)
    _.on('click', $updateBtn, handleUpdate)
    // store temporary fo update use
    customerInfo = customer // take ref and update this to reflect
    // set up form value
    $nameIp.value = customerInfo.name
    $addressIp.value = customerInfo.address
    $phoneIp.value = customerInfo.phone ? customerInfo.phone.join(', ') : ''
    $favoriteIp.checked = customerInfo.favorite
  }

  function __cleanUpFunc() {
    __cleanUpModal()
    customerInfo = null
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createEditCustomerForm
