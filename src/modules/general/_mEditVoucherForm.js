'use strict'

import _ from '../dom/index.js'
import convertToGoodInfoData from '../helpers/convertToGoodInfoData.js'
import { createModal } from '../helpers/createModal.js'
import notifier from '../notify.js'
import {
  deleteVoucher,
  updateVoucher,
  state,
  goodTypeShortKeyToLabel,
  paymentMethods,
} from '../state.js'
import { getFormatDate } from '../helpers/getDate.js'
import lockBtn from '../helpers/lockBtn.js'

export default function createEditVoucherForm(
  __whenDeleteVoucher,
  __whenUpdateVoucher
) {
  let voucherInfo = null

  // here need to setup
  const $deleteBtn = _.createButton('Delete', ['btn-corner-left', 'btn-red'])
  async function handleDelete(e) {
    lockBtn(e.target, 3000)
    try {
      notifier.__start('Deleting . . . ')

      const processCompleted = await deleteVoucher(voucherInfo.id)

      if (!processCompleted) {
        notifier.__end('No Data Found', 'error')
        return
      }
      state.$editingVoucher.remove()
      state.$editingVoucher = null
      await __whenDeleteVoucher()

      notifier.__end('Successfully Deleted', 'success')
    } catch (error) {
      notifier.__end('Something Went Wrong', 'error')
      console.log(error)
    }
  }

  const $voucherId = _.createHeading('h6')
  const $customerName = _.createElement('h6')
  const $createdOn = _.createHeading('h6')

  const $formHeader = _.createElement(
    '',
    '',
    [],
    [
      $deleteBtn,
      _.createElement(
        '',
        '',
        ['text-end'],
        [$voucherId, $customerName, $createdOn]
      ),
    ]
  )

  const $goodInfoBoxWrapper = _.createElement('', '', ['good-info-box-wrapper'])

  let boxNumber = 0
  const boxEvtCleaners = {}
  const addedGoodTypes = {}

  const $addGoodInfoBoxBtn = _.createButton('Add', ['btn', 'btn-blue', 'mx-1'])
  function handleAddBox() {
    const type = $typeSelect.value
    if (addedGoodTypes[type]) {
      notifier.on('addedGoodType', 'warning')
      return
    }
    addedGoodTypes[type] = ++boxNumber
    $goodInfoBoxWrapper.appendChild(createGoodInfoBox(type))
  }

  const $typeSelect = _.createSelect(
    ['good-type-select', 'form-select'],
    '',
    []
  )

  for (const [k, v] of Object.entries(goodTypeShortKeyToLabel)) {
    addedGoodTypes[k] = 0
    _.createOption($typeSelect, k, v)
  }

  function createGoodInfoBox(
    type = 'b/r/n',
    amount = '',
    rate = 0,
    charge = 0
  ) {
    const [$delBtn, btnEvtCleaner] = _.createButton(
      'X',
      ['btn-corner-right', 'btn-red'],
      '',
      (e) => {
        try {
          boxNumber--
          const [cleaner1, cleaner2, cleaner3] = boxEvtCleaners[type]

          delete boxEvtCleaners[type]
          addedGoodTypes[type] = false

          cleaner1()
          cleaner2()
          cleaner3()

          e.target.parentElement.parentElement.remove()
        } catch (error) {
          console.log(error)
          notifier.on('sww', 'error')
        }
      },
      true
    )
    // type
    const $lockedTypeSelect = _.createSelect(
      ['good-type-ip', 'form-select'],
      '',
      [
        {
          value: type,
          text: goodTypeShortKeyToLabel[type],
          selected: true,
        },
      ]
    )
    $lockedTypeSelect.disabled = true

    function handleChange() {
      const amount = Number($amountIp.value.split(/[ -]/)[0])
      const rate = Number($rateIp.value) || 0
      $chargeIp.value = amount * rate
    }

    // amount
    const [$amountIp, amountIpEvtCleaner] = _.createInput(
      '',
      ['form-control', 'good-amount-ip', 'my-1'],
      '',
      {
        value: amount,
        placeHolder: '10-vis or 10 piece',
      },
      'change',
      handleChange,
      true
    )
    //rate
    const [$rateIp, rateIpEvtCleaner] = _.createInput(
      'number',
      ['form-control', 'good-rate-ip', 'my-1'],
      '',
      { value: rate },
      'change',
      handleChange,
      true
    )
    // charge
    const $chargeIp = _.createInput(
      'number',
      ['form-control', 'good-charge-ip', 'my-1'],
      '',
      { value: charge, disabled: true }
    )

    boxEvtCleaners[type] = [amountIpEvtCleaner, rateIpEvtCleaner, btnEvtCleaner]

    return _.createElement(
      '',
      '',
      ['good-info-box'],
      [
        _.createElement(
          '',
          '',
          ['form-group', 'p-relative'],
          [$lockedTypeSelect, $delBtn]
        ),
        $amountIp,
        _.createElement('', '', ['form-group'], [$rateIp, $chargeIp]),
      ]
    )
  }

  const $goodInfoBoxControllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$typeSelect, $addGoodInfoBoxBtn]
  )

  const $paidLb = _.createLabel('Paid', 'edit_vc_paid', ['form-label'])
  const $paidIp = _.createInput('', ['form-control'], 'edit_vc_paid')
  const $methodLb = _.createLabel('Payment Method', 'edit_vc_method', [
    'form-label',
  ])
  const $methodSelect = _.createSelect(
    ['form-select'],
    '',
    [],
    'edit_vc_method'
  )

  const $formBody = _.createFragment([
    $goodInfoBoxWrapper,
    $goodInfoBoxControllers,
    $paidLb,
    $paidIp,
    $methodLb,
    $methodSelect,
  ])

  const $noteTArea = _.createTextArea(['form-control'], '', 'edit_vc_note')

  const $updateBtn = _.createButton('Update', ['btn', 'btn-blue'])
  async function handleUpdate(e) {
    if (boxNumber === 0) {
      return notifier.on('invalidVoucherInfo', 'warning')
    }
    lockBtn(e.target)
    try {
      notifier.__start('updatingVoucher', 'info')
      const { id, createdOn } = voucherInfo
      const paymentMethod = $methodSelect.value
      const note = $noteTArea.value
      const updatedOn = getFormatDate()
      const paid = Number($paidIp.value) || 0
      const cancelled = $cancelCheckBox.checked
      const [totalAmount, totalCharge, goodInfo] = await convertToGoodInfoData(
        _.getAllNodes('.good-type-ip'),
        _.getAllNodes('.good-amount-ip'),
        _.getAllNodes('.good-rate-ip'),
        _.getAllNodes('.good-charge-ip')
      )
      if (totalCharge === 0 || totalAmount === 0) {
        notifier.__end('invalidVoucherInfo', 'warning')
        return
      }
      const data = {
        id,
        createdOn,
        updatedOn,
        note,
        goodInfo,
        paid,
        paymentMethod,
        cancelled,
      }
      const updatedData = await updateVoucher(data, totalCharge)
      if (!updatedData) {
        notifier.__end('Something went wrong', 'error')
        return
      }

      await __whenUpdateVoucher(updatedData)

      notifier.__end('Updated Successfully', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  const $cancelCheckBox = _.createInput(
    'checkbox',
    ['form-check'],
    'edit_vc_cancelled_chose'
  )
  const $formFooter = _.createElement(
    '',
    '',
    [],
    [
      _.createElement(
        '',
        '',
        ['check-box-group'],
        [
          $cancelCheckBox,
          _.createLabel('Order is cancelled', 'edit_vc_cancelled_chose', [
            'form-check-label',
            'text-red',
          ]),
        ]
      ),
      _.createElement('', '', ['form-group'], [$noteTArea, $updateBtn]),
    ]
  )

  const $form = _.createElement(
    '',
    '',
    ['edit-voucher-form', 'p-relative'],
    [$formHeader, $formBody, $formFooter]
  )

  const [$modal, __cleanUpModal] = createModal($form, __sleepFunc)

  function __sleepFunc() {
    state.$editingVoucher = voucherInfo = null
    boxNumber = 0

    for (const [k, v] of Object.entries(boxEvtCleaners)) {
      const [cleaner1, cleaner2, cleaner3] = v
      addedGoodTypes[k] = false
      delete boxEvtCleaners[k]
      cleaner1()
      cleaner2()
      cleaner3()
    }
    _.emptyChild($methodSelect)
    _.emptyChild($goodInfoBoxWrapper)
  }

  function __setUpFunc(data) {
    voucherInfo = data
    //setup header
    const {
      id,
      goodInfo,
      paid,
      createdOn,
      note,
      cancelled,
      name,
      paymentMethod,
    } = data
    $voucherId.textContent = `vid-${id}`
    $customerName.textContent = name
    $createdOn.textContent = createdOn
    //setup body
    goodInfo.forEach(async (info) => {
      const { type, amount, rate, charge } = info
      if (addedGoodTypes[type]) {
        notifier.on('sww', 'error')
        return
      }
      addedGoodTypes[type] = ++boxNumber
      $goodInfoBoxWrapper.appendChild(
        await createGoodInfoBox(type, amount, rate, charge)
      )
    })

    for (const singleMethod of paymentMethods) {
      const { shortKey, method } = singleMethod
      const selectedMethod = paymentMethod === method
      _.createOption($methodSelect, shortKey, method, '', selectedMethod)
    }

    //setup footer
    $cancelCheckBox.checked = cancelled
    $paidIp.value = paid
    $noteTArea.value = note

    _.on('click', $deleteBtn, handleDelete)
    _.on('click', $addGoodInfoBoxBtn, handleAddBox)
    _.on('click', $updateBtn, handleUpdate)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
    _.removeOn('click', $deleteBtn, handleDelete)
    _.removeOn('click', $addGoodInfoBoxBtn, handleAddBox)
    _.removeOn('click', $updateBtn, handleUpdate)
  }

  return [$modal, __setUpFunc, __cleanUpFunc]
}
