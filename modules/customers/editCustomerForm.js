'use strict'

import { updateCustomer } from '../state.js'
import _ from '../dom/index.js'
import { createModal } from '../general/createModal.js'
import notifier from '../notify.js'
import { createCustomerRow } from './createCustomerRow.js'

function createEditCustomerInfoForm() {
  let customerInfo = null,
    $prevName = null,
    $prevAddress = null,
    $prevPhone = null

  const $deleteBtn = _.createButton('Delete', ['btn-corner-left', 'btn-red'])
  function handleDelete(e) {
    console.log(customerInfo)
  }
  const $updateBtn = _.createButton('Update', [
    'btn',
    'btn-blue',
    'float-end',
    'm-1',
  ])
  const $nameIp = _.createInput('', ['form-control'], 'edit_cus_name')
  const $addressIp = _.createInput('', ['form-control'], 'edit_cus_address')
  const $phoneIp = _.createInput('', ['form-control'], 'edit_cus_phone')
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
      $updateBtn,
    ]
  )

  async function handleUpdate() {
    try {
      notifier.__start('Updating User Info')
      const { id, stars } = customerInfo
      const name = $nameIp.value
      const address = $addressIp.value
      const phone = $phoneIp.value.split(',')
      customerInfo.name = name
      $prevName.textContent = `${name} (⭐${customerInfo.stars})`
      customerInfo.address = $prevAddress.textContent = address
      customerInfo.phone = $prevPhone.textContent = phone
      await updateCustomer(customerInfo)

      // if customer info in list , then update dom
      const customerNode = _.getNodeById(`cusId-${id}`)
      if (customerNode) {
        customerNode.replaceWith(
          await createCustomerRow({
            id,
            name,
            address,
            stars,
            favorite: customerInfo.favorite,
          })
        )
      }

      notifier.__end('Successfully Updated', 'success')
    } catch (error) {
      notifier.__end('Something went wrong', 'error')
      console.log(error)
    }
  }

  const [$main, __cleanUpModal] = createModal($form, () => {
    _.removeOn('click', $updateBtn, handleUpdate)
    _.removeOn('click', $deleteBtn, handleDelete)
  })

  function __setUpFunc(
    customer,
    $prevNameNode,
    $prevAddressNode,
    $prevPhoneNode
  ) {
    _.on('click', $deleteBtn, handleDelete)
    _.on('click', $updateBtn, handleUpdate)
    // store temporary fo update use
    customerInfo = customer // take ref and update this to reflect
    $prevName = $prevNameNode
    $prevAddress = $prevAddressNode
    $prevPhone = $prevPhoneNode
    // set up form value
    $nameIp.value = customerInfo.name
    $addressIp.value = $prevAddressNode.textContent
    $phoneIp.value = $prevPhoneNode.textContent
  }

  function __cleanUpFunc() {
    __cleanUpModal()
    customerInfo = $prevName = $prevAddress = $prevPhone = null
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createEditCustomerInfoForm
