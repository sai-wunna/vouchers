'use strict'

import { saveNewCustomer, saveNewVoucher, searchCustomer } from '../state.js'
import _ from '../dom/index.js'
import notifier from '../notify.js'
import { createModal } from '../helpers/createModal.js'
import convertToGoodInfoData from '../helpers/convertToGoodInfoData.js'
import lockBtn from '../helpers/lockBtn.js'

export default (__whenCreateNewVoucher) => {
  const $dateIp = _.createInput('date', ['date-input'], '', {
    value: new Date().toISOString().substr(0, 10),
  })

  // name
  let newUser = true
  const searchCustomerResult = []
  let customerInfo = null
  let searchNameBlocker = null
  const $nameLb = _.createLabel('Customer Name', 'add_vc_cus_name', [
    'form-label',
  ])

  const $nameIp = _.createInput('', ['form-search'], 'add_vc_cus_name', {
    placeholder: 'type to search user . . .',
  })

  function handleNameSearch(e) {
    try {
      newUser = true
      $addressIp.disabled = false
      $phoneIp.disabled = false
      clearTimeout(searchNameBlocker)
      _.emptyChild($nameList)
      if (!e.target.value) return

      searchNameBlocker = setTimeout(async () => {
        const searchedCustomers = await searchCustomer(
          e.target.value.trim().toLowerCase(),
          'name'
        )

        searchCustomerResult.splice(
          0,
          searchCustomerResult.length,
          ...searchedCustomers
        )

        _.emptyChild($nameList)
        $nameList.appendChild(ih_createExistedCusName(searchedCustomers))
      }, 300)
    } catch (error) {
      console.log(error)
      notifier.on('sww', 'error')
    }
  }

  function ih_createExistedCusName(users) {
    const fragment = _.createFragment()

    users.forEach((user, idx) => {
      const nameInfo = _.createElement(
        '',
        `${user.name} ${
          user.address
            ? `( ${user.address} )`
            : user.company
            ? `( ${user.company} )`
            : ''
        }`,
        ['existed-cus-name']
      )
      nameInfo.dataset.cusIdx = idx
      fragment.appendChild(nameInfo)
    })

    return fragment
  }

  const $nameList = _.createElement('', '', ['existed-customer-list'])
  async function setUserFromList(e) {
    const idx = e.target.dataset.cusIdx
    if (!idx) return

    customerInfo = searchCustomerResult[Number(idx)]
    searchCustomerResult.splice(0) // clear arr after select customer
    $nameIp.value = customerInfo.name
    $addressIp.value = customerInfo.address
    $phoneIp.value = customerInfo.phone
    newUser = false

    _.emptyChild($nameList)
    $addressIp.disabled = true
    $phoneIp.disabled = true
  }

  // address
  const $addressLb = _.createLabel('Address', 'add_vc_address', ['form-label'])
  const $addressIp = _.createInput('', ['form-control'], 'add_vc_address')

  // phone
  const $phoneLb = _.createLabel('Phone', 'add_vc_phone', ['form-label'])
  const $phoneIp = _.createInput('', ['form-control'], 'add_vc_phone')

  // paid
  const $paidLb = _.createLabel('Paid', 'add_vc_paid', ['form-label'])
  const $paidIp = _.createInput('', ['form-control'], 'add_vc_paid')

  // method
  const $methodLb = _.createLabel('Payment Method', 'add_vc_method', [
    'form-label',
  ])
  const $methodSelect = _.createSelect(
    ['form-select'],
    '',
    [
      { value: 'cash', text: 'Cash' },
      { value: 'kbz-pay', text: 'KBZ Pay' },
      { value: 'kbz-bank', text: 'KBZ Bank' },
      { value: 'aya-pay', text: 'Aya Pay' },
      { value: 'aya-bank', text: 'AYA Bank' },
      { value: 'cb-pay', text: 'CB Pay' },
      { value: 'cb-bank', text: 'CB Bank' },
      { value: 'semi-payment', text: 'Some cash, some with banking' },
    ],
    'add_vc_method'
  )

  // goods info box
  let boxNumber = 0
  const boxEvtCleaners = []
  const addedGoodTypes = { 'b/r/n': false, 'b/r/wn': false, 'w/r/n': false } // it depends mustupdate mustupdate mustupdate

  const $typeSelect = _.createSelect(['good-type-select', 'form-select'], '', [
    {
      value: 'b/r/n',
      text: 'B R N',
    },
    {
      value: 'b/r/wn',
      text: 'B R WN',
    },
    {
      value: 'w/r/n',
      text: 'W R N',
    },
  ]) // it depends mustupdate mustupdate mustupdate

  const $addGoodInfoBoxBtn = _.createButton('Add', ['btn', 'btn-blue', 'mx-1'])

  function handleAddBox() {
    const type = $typeSelect.value
    if (addedGoodTypes[type]) {
      notifier.on('sameGoodTypeAdded', 'warning')
      return
    }
    addedGoodTypes[type] = ++boxNumber
    $goodInfoBoxWrapper.appendChild(createGoodInfoBox(type))
  }

  const $removeGoodInfoBoxBtn = _.createButton('Remove', [
    'btn',
    'btn-red',
    'mx-1',
  ])

  function handleRemoveBox() {
    if (!$goodInfoBoxWrapper.lastChild) return

    boxNumber--
    $goodInfoBoxWrapper.lastChild.remove()
    const {
      type,
      cleaners: [cleaner1, cleaner2],
    } = boxEvtCleaners.pop()

    addedGoodTypes[type] = false

    cleaner1()
    cleaner2()
  }

  const $goodInfoBoxWrapper = _.createElement('', '', ['good-info-box-wrapper'])

  function createGoodInfoBox(goodType) {
    const $boxNo = _.createSpan(`NO . ${boxNumber}`, ['good-box-no'])
    // type

    function handleChange() {
      const amount = Number($amountIp.value.split(/[ -]/)[0]) || 0
      const rate = Number($rateIp.value) || 0
      $chargeIp.value = amount * rate
    }

    const $type = _.createInput('', ['form-control', 'good-type-Ip'], '', {
      value: goodType.toUpperCase().split('/').join(' '),
      disabled: true,
    })

    // amount
    const [$amountIp, amountIpEvtCleaner] = _.createInput(
      '',
      ['form-control', 'good-amount-ip', 'my-1'],
      '',
      { placeholder: '30-vis or 30 p ( must leave space or hyphen )' },
      'change',
      handleChange,
      true
    )
    //rate
    const [$rateIp, rateIpEvtCleaner] = _.createInput(
      'number',
      ['form-control', 'good-rate-ip', 'my-1'],
      '',
      '',
      'input',
      handleChange,
      true
    )
    // charge
    const $chargeIp = _.createInput(
      'number',
      ['form-control', 'good-charge-ip', 'my-1'],
      '',
      { disabled: true }
    )
    boxEvtCleaners.push({
      type: goodType,
      cleaners: [amountIpEvtCleaner, rateIpEvtCleaner],
    })
    return _.createElement(
      '',
      '',
      ['good-info-box'],
      [$boxNo, $type, $amountIp, $rateIp, $chargeIp]
    )
  }

  const $goodInfoBoxControllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$addGoodInfoBoxBtn, $typeSelect, $removeGoodInfoBoxBtn]
  )

  // note
  const $noteTArea = _.createTextArea(
    ['form-control'],
    { placeholder: 'note . . .' },
    'add_vc_note'
  )

  // submit button
  const $submitButton = _.createButton('Create', [
    'btn',
    'add-submit-btn',
    'btn-blue',
  ])

  async function handleSubmit(e) {
    e.preventDefault()
    lockBtn(e.target, 3000)

    if (!$nameIp.value || !$paidIp.value || !boxNumber) {
      notifier.on('invalidVoucherInfo', 'warning')
      return
    }

    try {
      notifier.__start('Creating Voucher')
      // if not old user, create user info
      if (newUser) {
        customerInfo = await saveNewCustomer(
          $nameIp.value,
          $addressIp.value,
          $phoneIp.value.trim().length > 0 ? $phoneIp.value.split(',') : '',
          $dateIp.value
        )

        notifier.__processing('New User Created', 'success')
      }
      const paid = Number($paidIp.value)
      const date = $dateIp.value
      const note = $noteTArea.value
      const paymentMethod = $methodSelect.value
      const [totalAmount, totalCharge, goodInfo] = convertToGoodInfoData(
        _.getAllNodes('.good-type-Ip'),
        _.getAllNodes('.good-amount-ip'),
        _.getAllNodes('.good-rate-ip'),
        _.getAllNodes('.good-charge-ip')
      )
      // update state
      const data = {
        customerId: customerInfo.id,
        name: customerInfo.name,
        goodInfo,
        paid,
        createdOn: date,
        note,
        paymentMethod,
      }

      await saveNewVoucher(data, totalCharge)

      await __whenCreateNewVoucher()

      notifier.__end('Successfully Created', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  const $form = _.createForm(
    ['add-voucher-form'],
    [
      $dateIp,
      $nameLb,
      $nameIp,
      $nameList,
      $addressLb,
      $addressIp,
      $phoneLb,
      $phoneIp,
      $goodInfoBoxWrapper,
      $goodInfoBoxControllers,
      $paidLb,
      $paidIp,
      $methodLb,
      $methodSelect,
      _.createElement('', '', ['form-group'], [$noteTArea, $submitButton]),
    ]
  )

  const [$main, __cleanUpModal] = createModal($form, __sleepFunc)

  function __sleepFunc() {
    newUser = true
    customerInfo = null
    boxNumber = 0
    $nameIp.value = ''
    $addressIp.value = ''
    $phoneIp.value = ''
    $paidIp.value = ''
    $noteTArea.value = ''
    $methodSelect[0].selected = true
    searchCustomerResult.splice(0)
    _.emptyChild($goodInfoBoxWrapper)
    _.emptyChild($nameList)
    while (boxEvtCleaners[0]) {
      const {
        type,
        cleaners: [cleaner1, cleaner2],
      } = boxEvtCleaners.pop()

      addedGoodTypes[type] = false

      cleaner1()
      cleaner2()
    }
    _.removeOn('click', $nameList, setUserFromList)
    _.removeOn('click', $addGoodInfoBoxBtn, handleAddBox)
    _.removeOn('click', $removeGoodInfoBoxBtn, handleRemoveBox)
    _.removeOn('input', $nameIp, handleNameSearch)
    _.removeOn('click', $submitButton, handleSubmit)
  }

  function __setUpFunc() {
    _.on('click', $nameList, setUserFromList)
    _.on('click', $addGoodInfoBoxBtn, handleAddBox)
    _.on('click', $removeGoodInfoBoxBtn, handleRemoveBox)
    _.on('input', $nameIp, handleNameSearch)
    _.on('click', $submitButton, handleSubmit)
    $nameIp.focus()
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
