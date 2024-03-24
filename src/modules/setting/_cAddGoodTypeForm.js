'use strict'

import _ from '../dom/index.js'

export default (__whenAddNewType) => {
  const $goodTypeShortKeyIp = _.createInput('', ['form-control'], '', {
    placeholder: ' Short Key',
  })
  const $goodTypeIp = _.createInput('', ['form-control'], '', {
    placeholder: 'Goods Type',
  })
  const $goodTypeColorIp = _.createInput('color', ['color-input'])

  const $addGoodTypeBtn = _.createButton('Add', ['btn', 'btn-blue'])
  function handleAddGoodType() {
    const shortKey = $goodTypeShortKeyIp.value
    const type = $goodTypeIp.value
    const color = $goodTypeColorIp.value

    if (!shortKey || !type) return

    __whenAddNewType(shortKey, type, color)

    $goodTypeShortKeyIp.value = ''
    $goodTypeIp.value = ''
  }

  const $main = _.createElement(
    '',
    '',
    ['form-group', 'add-goods-type-form'],
    [$goodTypeShortKeyIp, $goodTypeIp, $goodTypeColorIp, $addGoodTypeBtn]
  )

  function __setUpFunc() {
    _.on('click', $addGoodTypeBtn, handleAddGoodType)
  }

  function __cleanUpFunc() {
    _.removeOn('click', $addGoodTypeBtn, handleAddGoodType)
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
