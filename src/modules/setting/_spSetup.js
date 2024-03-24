'use strict'

import _ from '../dom/index.js'
import notifier from '../notify.js'
import {
  goodTypesData,
  setUpGoodTypesDatasets,
  paymentMethods,
  buildSalesTableData,
  buildMonthlyChartData,
  buildForThisYearChartData,
} from '../state.js'
import { lockNav, unlockNav } from '../helpers/navLocker.js'
import {
  createGoodTypeRow,
  createPaymentMethodRow,
} from './_ncGoodTypeRowAndPaymentMethodRow.js'
import { hexToRgbArr } from '../helpers/toRGBColor.js'
import deepCopy from '../helpers/deepCopy.js'
import appendCustomStyles from '../helpers/appendCustomStyles.js'
import _cAddGoodTypeForm from './_cAddGoodTypeForm.js'
import _cAddPaymentMethodForm from './_cAddPaymentMethodForm.js'
import _cSetUpProfile from './_cSetUpProfile.js'
import _cAppConfigForm from './_cAppConfigForm.js'

export default (__whenBackToFileManager) => {
  let cleanMemoTimer = null
  const goodTypesDataClone = []
  const paymentMethodsClone = []

  const $backBtn = _.createButton('Back', ['back-btn'])
  function handleBack() {
    cleanMemoTimer = setTimeout(() => {
      __sleepFunc()
    }, 10000)
    $main.classList.add('d-none')
    __whenBackToFileManager()
    unlockNav()
  }

  const $splitter = _.createElement('hr', '', ['my-1'])

  const [$profileBox, __setUpProfileBox, __cleanUpProfileBox] = _cSetUpProfile()

  const [$appConfBox, __setUpAppConfBox, __cleanAppConfBox] = _cAppConfigForm()

  // payment methods
  const $paymentMethodRows = _.createNode('div')
  function handleClickOnPaymentMethodRows(e) {
    if (e.target.tagName !== 'BUTTON') return

    const shortKey = e.target.dataset.key

    const index = paymentMethodsClone.findIndex(
      (paymentMethod) =>
        paymentMethod.shortKey.toLowerCase() === shortKey.toLowerCase()
    )
    if (index === -1) {
      notifier.on('sww', 'error')
      return
    }

    paymentMethodsClone.splice(index, 1)
    e.target.parentElement.remove()
  }

  const [$addPaymentMethodForm, __setUpAddMethodForm, __cleanUpAddMethodForm] =
    _cAddPaymentMethodForm(__whenAddNewMethod)
  function __whenAddNewMethod(shortKey, method) {
    const existed = paymentMethodsClone.findIndex(
      (paymentMethod) =>
        paymentMethod.shortKey.toLowerCase() === shortKey.toLowerCase() ||
        paymentMethod.method.toLowerCase() === method.toLowerCase()
    )

    if (existed !== -1) {
      notifier.on('alreadyExisted', 'warning')
      return
    }

    paymentMethodsClone.push({ shortKey, method })
    $paymentMethodRows.appendChild(createPaymentMethodRow(shortKey, method))
  }

  const $setUpPaymentMethodsBox = _.createElement(
    '',
    '',
    ['set-up-payment-method-box'],
    [
      _.createElement('h6', 'Payment Methods', ['my-1']),
      $paymentMethodRows,
      $addPaymentMethodForm,
    ]
  )

  // good types
  const $goodTypeRows = _.createNode('div')
  function handleClickOnGoodTypesRows(e) {
    if (e.target.tagName !== 'BUTTON') return

    const shortKey = e.target.dataset.key

    const index = goodTypesDataClone.findIndex(
      (goodType) => goodType.shortKey.toLowerCase() === shortKey.toLowerCase()
    )
    if (index === -1) {
      notifier.on('sww', 'error')
      return
    }

    goodTypesDataClone.splice(index, 1)
    e.target.parentElement.remove()
  }

  const [$addGoodTypeForm, __setUpAddGoodTypeForm, __cleanUpAddGoodTypeForm] =
    _cAddGoodTypeForm(__whenAddNewType)

  function __whenAddNewType(shortKey, type, color) {
    const existed = goodTypesDataClone.findIndex(
      (goodType) =>
        goodType.shortKey.toLowerCase() === shortKey.toLowerCase() ||
        goodType.type.toLowerCase() === type.toLowerCase()
    )

    if (existed !== -1) {
      notifier.on('alreadyExisted', 'warning')
      return
    }

    const rgbArr = hexToRgbArr(color)

    const borderColor = `rgb(${rgbArr.join(',')})`
    const bgColor = `rgba(${rgbArr.join(',')},0.6)`

    goodTypesDataClone.push({ shortKey, type, borderColor, bgColor })
    $goodTypeRows.appendChild(
      createGoodTypeRow(shortKey, type, borderColor, bgColor)
    )
  }

  const $setUpGoodTypesDataBox = _.createElement(
    '',
    '',
    ['set-up-good-type-box'],
    [
      _.createElement('h6', 'Good Types', ['my-1']),
      $goodTypeRows,
      $addGoodTypeForm,
    ]
  )

  // rebuild everything
  const $updateBtn = _.createButton('Update', [
    'btn',
    'btn-blue',
    'float-end',
    'my-1',
  ])
  async function handleUpdate() {
    if (goodTypesDataClone.length === 0 || paymentMethodsClone.length === 0) {
      notifier.on('invalid', 'warning')
      return
    }
    try {
      notifier.__start('Rebuilding Data Sets', 'info')

      goodTypesData.splice(0, goodTypesData.length, ...goodTypesDataClone)
      paymentMethods.splice(0, paymentMethods.length, ...paymentMethodsClone)

      await setUpGoodTypesDatasets()
      await buildSalesTableData()
      await buildMonthlyChartData()
      await buildForThisYearChartData()
      appendCustomStyles(goodTypesData)

      notifier.__end('Ready', 'success')
    } catch (error) {
      console.log(error)
      notifier.__end('Something went wrong', 'error')
    }
  }

  const $setUpBox = _.createElement(
    '',
    '',
    ['set-up-wrapper'],
    [$appConfBox, $setUpPaymentMethodsBox, $setUpGoodTypesDataBox, $updateBtn]
  )

  const $main = _.createElement(
    '',
    '',
    ['base-setup-sub-page', 'd-none'],
    [$backBtn, $splitter, $profileBox, $setUpBox]
  )

  function __sleepFunc() {
    _.removeOn('click', $backBtn, handleBack)
    _.removeOn('click', $updateBtn, handleUpdate)
    _.removeOn('click', $paymentMethodRows, handleClickOnPaymentMethodRows)
    _.removeOn('click', $goodTypeRows, handleClickOnGoodTypesRows)
    paymentMethodsClone.splice(0, paymentMethodsClone.length)
    goodTypesData.splice(0, paymentMethodsClone.length)

    __cleanAppConfBox()
    __cleanUpAddGoodTypeForm()
    __cleanUpAddMethodForm()
    __cleanUpProfileBox()
    cleanMemoTimer = null
  }

  function __setUpFunc() {
    lockNav('Welcome')

    if (cleanMemoTimer) {
      clearTimeout(cleanMemoTimer)
      cleanMemoTimer = null
      return
    }

    _.emptyChild($paymentMethodRows)
    _.emptyChild($goodTypeRows)

    paymentMethodsClone.splice(
      0,
      paymentMethodsClone.length,
      ...deepCopy(paymentMethods)
    )
    goodTypesDataClone.splice(
      0,
      goodTypesDataClone.length,
      ...deepCopy(goodTypesData)
    )

    goodTypesDataClone.forEach((goodType) => {
      $goodTypeRows.appendChild(
        createGoodTypeRow(
          goodType.shortKey,
          goodType.type,
          goodType.borderColor,
          goodType.bgColor
        )
      )
    })

    paymentMethodsClone.forEach((paymentMethod) => {
      $paymentMethodRows.appendChild(
        createPaymentMethodRow(paymentMethod.shortKey, paymentMethod.method)
      )
    })

    _.on('click', $backBtn, handleBack)
    _.on('click', $updateBtn, handleUpdate)
    _.on('click', $paymentMethodRows, handleClickOnPaymentMethodRows)
    _.on('click', $goodTypeRows, handleClickOnGoodTypesRows)

    __setUpAppConfBox()
    __setUpAddGoodTypeForm()
    __setUpAddMethodForm()
    __setUpProfileBox()
  }

  function __cleanUpFunc() {
    if (cleanMemoTimer) {
      clearTimeout(cleanMemoTimer)
      __sleepFunc()
    }
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
