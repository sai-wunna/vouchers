'use strict'

import _ from '../dom/index.js'
import createConfigChartBox from './_cConfigChart.js'
import { state, getChartData } from '../state.js'
import { unlockNav } from '../helpers/navLocker.js'

function createAnalyzeChart(__whenQuitSubPage) {
  const { chartConfig } = state

  const [$configChartBox, __setUpConfigBox, __cleanUpConfigBox] =
    createConfigChartBox(__whenUpdateConfig)

  async function __whenUpdateConfig() {
    const data = getChartData(chartDataPeriod)
    myChart.config._config.type = chartConfig.chartType
    myChart.data = data
    myChart.update()
  }

  let chartDataPeriod = null
  const $chart = _.createElement('canvas', '', [], [])
  let myChart = null

  async function setUpChart() {
    const data = await getChartData(chartDataPeriod)
    myChart = new Chart($chart, {
      type: chartConfig.chartType,
      data: data,
      options: { responsive: true },
    })
  }

  const $backToTable = _.createButton('X', ['btn', 'btn-ghost'])

  function handleBack() {
    $main.classList.add('d-none')
    __whenQuitSubPage()
    __sleepFunc()
    unlockNav()
  }

  const $controllers = _.createElement(
    '',
    '',
    ['controllers'],
    [$backToTable, $configChartBox]
  )

  function handleResize(e) {
    e.preventDefault()
    if (myChart) {
      myChart.resize()
    }
  }

  const $main = _.createElement(
    '',
    '',
    ['chart-wrapper', 'd-none'],
    [$controllers, $chart]
  )

  function __sleepFunc() {
    myChart.destroy()
    myChart = null
    _.on('click', $backToTable, handleBack)
    _.removeOn('resize', window, handleResize) // should not use in production
  }

  async function __setUpFunc(period) {
    if (!chartDataPeriod) {
      // only for first time
      await __setUpConfigBox()
    }
    chartDataPeriod = period
    await setUpChart()
    _.on('click', $backToTable, handleBack)
    _.on('resize', window, handleResize)
  }

  async function __cleanUpFunc() {
    await __cleanUpConfigBox()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createAnalyzeChart
