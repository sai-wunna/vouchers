'use strict'

import { createVoucherRow, createVoucherRows } from './createVoucherRow.js'
import {
  saveNewCustomer,
  saveNewVoucher,
  searchCustomer,
  vouchers,
  getACustomerInfo,
} from '../state.js'
import _ from '../dom/index.js'
import notifier from '../notify.js'
import { createModal } from '../general/createModal.js'
import convertToGoodInfoData from '../helpers/convertToGoodInfoData.js'
import lockBtn from '../helpers/lockBtn.js'
import { calculatePageDate } from '../helpers/getDate.js'

function createVoucherForm() {
  const $dateIp = _.createInput('date', ['date-input'], '', {
    value: new Date().toISOString().substr(0, 10),
  })

  // name
  let newUser = true
  let customerInfo = null
  let searchNameBlocker = null
  const $nameLb = _.createLabel('Customer Name', 'add_vc_cus_name', [
    'form-label',
  ])

  const $nameIp = _.createInput('', ['form-search'], 'add_vc_cus_name', {
    placeholder: 'type to search user . . .',
  })

  function handleNameSearch(e) {
    newUser = true
    clearTimeout(searchNameBlocker)
    _.emptyChild($nameList)
    if (!e.target.value) return

    searchNameBlocker = setTimeout(async () => {
      const names = await searchCustomer(
        e.target.value.trim().toLowerCase(),
        'name'
      )
      _.emptyChild($nameList)
      $nameList.appendChild(createExistedCusName(names))
    }, 300)
  }

  function createExistedCusName(users) {
    const fragment = _.createFragment()
    for (const user of users) {
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
      nameInfo.dataset.cusId = user.id
      fragment.appendChild(nameInfo)
    }

    return fragment
  }

  const $nameList = _.createElement('', '', ['existed-customer-list'])
  async function setUserFromList(e) {
    if (!e.target.dataset.cusId) return
    customerInfo = await getACustomerInfo(parseInt(e.target.dataset.cusId))
    $nameIp.value = customerInfo.name
    $addressIp.value = customerInfo.address
    $phoneIp.value = customerInfo.phone
    newUser = false
    _.emptyChild($nameList)
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

  const $addGoodInfoBoxBtn = _.createButton('Add Sheet', [
    'btn',
    'btn-blue',
    'mx-1',
  ])

  function handleAddBox() {
    $goodInfoBoxWrapper.appendChild(createGoodInfoBox())
  }

  const $removeGoodInfoBoxBtn = _.createButton('Remove', [
    'btn',
    'btn-red',
    'mx-1',
  ])

  function handleRemoveBox() {
    if ($goodInfoBoxWrapper.lastChild) {
      boxNumber--
      $goodInfoBoxWrapper.lastChild.remove()
      const [cleaner1, cleaner2] = boxEvtCleaners.pop()
      cleaner1()
      cleaner2()
    }
  }

  const $goodInfoBoxWrapper = _.createElement('', '', ['good-info-box-wrapper'])

  function createGoodInfoBox() {
    const $boxNo = _.createSpan(`NO . ${++boxNumber}`, ['good-box-no'])
    // type

    function handleChange() {
      const amount = parseInt($amountIp.value.split(/[ -]/)[0]) || 0
      const rate = parseInt($rateIp.value) || 0
      $chargeIp.value = amount * rate
    }

    const $typeSelect = _.createSelect(
      ['good-type-select', 'form-select'],
      '',
      [
        {
          value: 'c/b/r/s',
          text: 'Chin, Black, Raw, Small',
        },
        {
          value: 'c/b/r/b',
          text: 'Chin, Black, Raw, Big',
        },
      ]
    )
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
    const $chargeIp = _.createInput('number', [
      'form-control',
      'good-charge-ip',
      'my-1',
    ])
    boxEvtCleaners.push([amountIpEvtCleaner, rateIpEvtCleaner])
    return _.createElement(
      '',
      '',
      ['good-info-box'],
      [$boxNo, $typeSelect, $amountIp, $rateIp, $chargeIp]
    )
  }

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
        // store to db
        customerInfo = await saveNewCustomer(
          $nameIp.value,
          $addressIp.value,
          $phoneIp.value?.split(','),
          $dateIp.value
        )

        notifier.__processing('New User Created', 'success')
      }
      const paid = parseInt($paidIp.value)
      const date = $dateIp.value
      const note = $noteTArea.value
      const paymentMethod = $methodSelect.value
      const [totalAmount, totalCharge, goodInfo] = convertToGoodInfoData(
        _.getAllNodes('.good-type-select'),
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

      const vcId = await saveNewVoucher(data, totalCharge)

      await updatePageData(
        vcId,
        totalAmount,
        date,
        totalCharge,
        paid,
        paymentMethod
      )

      notifier.__end('Successfully Created', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  function updatePageData(
    vcId,
    totalAmount,
    date,
    totalCharge,
    paid,
    paymentMethod
  ) {
    const $tBody = _.getNode('.data-info-box')

    if ($tBody.childElementCount === 20) {
      $tBody.lastChild.remove()
    }

    if (vouchers.currentPage === 0) {
      $tBody.insertBefore(
        createVoucherRow(
          vcId,
          customerInfo.name,
          totalAmount,
          date,
          totalCharge,
          paid,
          paymentMethod
        ),
        $tBody.firstChild
      )
    } else {
      const vcData = vouchers.data[vouchers.currentPage * 20]
      $tBody.insertBefore(createVoucherRows([vcData]), $tBody.firstChild)
    }

    _.getNode('.controllers').firstChild.textContent = `Page - ${
      vouchers.currentPage + 1
    } / ${Math.ceil(vouchers.data.length / 20) || 1} ( ${
      $tBody.childElementCount
    } 📄 )`

    _.getNode('.time-period-header').textContent = calculatePageDate(
      $tBody.firstChild.dataset.createdOn,
      $tBody.lastChild.dataset.createdOn
    )
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
      $addGoodInfoBoxBtn,
      $removeGoodInfoBoxBtn,
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
    _.emptyChild($goodInfoBoxWrapper)
    _.emptyChild($nameList)
    while (boxEvtCleaners[0]) {
      const [cleaner1, cleaner2] = boxEvtCleaners.pop()
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
  }

  function __cleanUpFunc() {
    __cleanUpModal()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createVoucherForm
