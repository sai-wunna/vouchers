'use strict'

import _ from '../dom/index.js'

export default (__whenAddNewMethod) => {
  const $paymentMethodShortKeyIp = _.createInput('', ['form-control'], '', {
    placeholder: 'Short Key',
  })
  const $paymentMethodIp = _.createInput('', ['form-control'], '', {
    placeholder: 'Method',
  })

  const $addPaymentMethodBtn = _.createButton('Set', ['btn', 'btn-blue'])
  function handleAdd() {
    const shortKey = $paymentMethodShortKeyIp.value
    const method = $paymentMethodIp.value

    if (!shortKey || !method) return

    __whenAddNewMethod(shortKey, method)

    $paymentMethodIp.value = ''
    $paymentMethodShortKeyIp.value = ''
  }

  const $main = _.createElement(
    '',
    '',
    ['form-group', 'add-payment-method-form'],
    [$paymentMethodShortKeyIp, $paymentMethodIp, $addPaymentMethodBtn]
  )

  function __setUpFunc() {
    _.on('click', $addPaymentMethodBtn, handleAdd)
  }
  function __cleanUpFunc() {
    _.removeOn('click', $addPaymentMethodBtn, handleAdd)
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
