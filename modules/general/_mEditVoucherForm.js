'use strict'

import _ from '../dom/index.js'
import convertToGoodInfoData from '../helpers/convertToGoodInfoData.js'
import { createModal } from '../helpers/createModal.js'
import notifier from '../notify.js'
import { deleteVoucher, updateVoucher, state } from '../state.js'
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

  function createGoodInfoBox(amount = '', rate = 0, charge = 0) {
    const $boxNo = _.createSpan(`NO . ${++boxNumber}`, ['good-box-no'])
    // type

    function handleChange() {
      const amount = Number($amountIp.value.split(/[ -]/)[0])
      const rate = Number($rateIp.value) || 0
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
      {
        value: amount,
        placeHolder: '10-vis or 10 p ( Please leave blank or hyphen )',
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
      'input',
      handleChange,
      true
    )
    // charge
    const $chargeIp = _.createInput(
      'number',
      ['form-control', 'good-charge-ip', 'my-1'],
      '',
      { value: charge }
    )
    boxEvtCleaners.push([amountIpEvtCleaner, rateIpEvtCleaner])
    return _.createElement(
      '',
      '',
      ['good-info-box'],
      [$boxNo, $typeSelect, $amountIp, $rateIp, $chargeIp]
    )
  }

  const $paidLb = _.createLabel('Paid', 'edit_vc_paid', ['form-label'])
  const $paidIp = _.createInput('', ['form-control'], 'edit_vc_paid')
  const $methodLb = _.createLabel('Payment Method', 'edit_vc_method', [
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
    'edit_vc_method'
  )

  const $formBody = _.createFragment([
    $goodInfoBoxWrapper,
    $addGoodInfoBoxBtn,
    $removeGoodInfoBoxBtn,
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
      const paid = Number($paidIp.value)
      const cancelled = $cancelCheckBox.checked
      const [totalAmount, totalCharge, goodInfo] = await convertToGoodInfoData(
        _.getAllNodes('.good-type-select'),
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

    while (boxEvtCleaners[0]) {
      const [cleaner1, cleaner2] = boxEvtCleaners.pop()
      cleaner1()
      cleaner2()
    }
    _.emptyChild($goodInfoBoxWrapper)
  }

  function __setUpFunc(data) {
    voucherInfo = data
    //setup header
    const { id, goodInfo, paid, createdOn, note, cancelled, name } = data
    $voucherId.textContent = `vid-${id}`
    $customerName.textContent = name
    $createdOn.textContent = createdOn
    //setup body
    goodInfo.forEach(async (info) => {
      $goodInfoBoxWrapper.appendChild(
        await createGoodInfoBox(info.amount, info.rate, info.charge)
      )
    })
    //setup footer
    $cancelCheckBox.checked = cancelled
    $paidIp.value = paid
    $noteTArea.value = note

    _.on('click', $deleteBtn, handleDelete)
    _.on('click', $addGoodInfoBoxBtn, handleAddBox)
    _.on('click', $removeGoodInfoBoxBtn, handleRemoveBox)
    _.on('click', $updateBtn, handleUpdate)
  }

  function __cleanUpFunc() {
    __cleanUpModal()
    _.removeOn('click', $deleteBtn, handleDelete)
    _.removeOn('click', $addGoodInfoBoxBtn, handleAddBox)
    _.removeOn('click', $removeGoodInfoBoxBtn, handleRemoveBox)
    _.removeOn('click', $updateBtn, handleUpdate)
  }

  return [$modal, __setUpFunc, __cleanUpFunc]
}