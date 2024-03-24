'use strict'

import _ from '../dom/index.js'
import { state } from '../state.js'

function configChartBox(__whenUpdate) {
  const { chartConfig } = state
  const $toggleConfigBoxBtn = _.createButton('Customize', ['btn', 'btn-blue'])

  const $chartTypeLb = _.createLabel('Type', 'chart_conf_type', ['form-label'])
  const $chartTypeSelect = _.createSelect(
    ['form-select'],
    '',
    [
      { value: 'line', text: 'Line' },
      { value: 'bar', text: 'Bar' },
    ],
    'chart_conf_type'
  )
  function handleTypeSelect(e) {
    chartConfig.chartType = e.target.value
  }

  const $chartFillLb = _.createLabel('Fill Color', 'chart_conf_fill', [
    'form-check-label',
  ])
  const $chartFillIp = _.createInput(
    'checkbox',
    ['form-check'],
    'chart_conf_fill',
    { checked: true }
  )
  function handleFillCheck(e) {
    if (e.target.checked) {
      chartConfig.datasetsConf.fill = 'origin'
    } else {
      chartConfig.datasetsConf.fill = false
    }
  }

  const $chartBorderWidthLb = _.createLabel(
    'Border-width',
    'chart_conf_bWidth',
    ['form-label']
  )
  const $chartBorderWidthIp = _.createInput(
    'number',
    ['form-control'],
    'chart_conf_bWidth',
    { min: 0, max: 10, value: 3 }
  )
  function handleBorderWidthChange(e) {
    const value = Number(e.target.value)
    if (value > 10 || value < 0) return
    chartConfig.datasetsConf.borderWidth = value
  }

  const $chartTensionLb = _.createLabel('Curve', 'chart_conf_tension', [
    'form-label',
  ])
  const $chartTensionIp = _.createInput(
    'number',
    ['form-control'],
    'chart_conf_tension',
    { min: 0, max: 4, value: 3 }
  )
  function handleTensionChange(e) {
    const value = Number(e.target.value)
    if (value > 4 || value < 0) return
    chartConfig.datasetsConf.tension = value / 10
  }

  const $chartPointSizeLb = _.createLabel('Point-size', 'chart_conf_point', [
    'form-control',
  ])

  const $chartPointSizeIp = _.createInput(
    'number',
    ['form-control'],
    'chart_conf_point',
    { max: 10, min: 0, value: 3 }
  )
  function handlePointSizeChange(e) {
    const value = Number(e.target.value)
    if (value > 10 || value < 0) return
    chartConfig.datasetsConf.pointRadius = value
  }

  const $updateBtn = _.createButton('Apply', [
    'btn',
    'btn-blue',
    'float-end',
    'm-1',
  ])
  const $configBody = _.createElement(
    '',
    '',
    ['chart-config-form'],
    [
      _.createElement('', '', ['form-group'], [$chartTypeLb, $chartTypeSelect]),
      _.createElement(
        '',
        '',
        ['form-group'],
        [$chartBorderWidthLb, $chartBorderWidthIp]
      ),
      _.createElement(
        '',
        '',
        ['form-group'],
        [$chartTensionLb, $chartTensionIp]
      ),
      _.createElement(
        '',
        '',
        ['form-group'],
        [$chartPointSizeLb, $chartPointSizeIp]
      ),
      _.createElement(
        '',
        '',
        ['check-box-group'],
        [$chartFillIp, $chartFillLb]
      ),
      $updateBtn,
    ]
  )

  const $main = _.createElement(
    '',
    '',
    ['chart-config-container'],
    [$toggleConfigBoxBtn, $configBody]
  )

  function __setUpFunc() {
    const {
      chartType,
      datasetsConf: { borderWidth, pointRadius, tension },
    } = chartConfig
    $chartTypeSelect.value = chartType
    $chartFillIp.checked = chartConfig.datasetsConf.fill
    $chartBorderWidthIp.value = borderWidth
    $chartTensionIp.value = tension * 10
    $chartPointSizeIp.value = pointRadius

    _.on('change', $chartTypeSelect, handleTypeSelect)
    _.on('change', $chartFillIp, handleFillCheck)
    _.on('change', $chartBorderWidthIp, handleBorderWidthChange)
    _.on('change', $chartTensionIp, handleTensionChange)
    _.on('change', $chartPointSizeIp, handlePointSizeChange)
    _.on('click', $updateBtn, __whenUpdate)
  }

  function __cleanUpFunc() {
    _.on('change', $chartTypeSelect, handleTypeSelect)
    _.on('change', $chartFillIp, handleFillCheck)
    _.on('change', $chartBorderWidthIp, handleBorderWidthChange)
    _.on('change', $chartTensionIp, handleTensionChange)
    _.on('change', $chartPointSizeIp, handlePointSizeChange)
    _.on('click', $updateBtn, __whenUpdate)
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default configChartBox
