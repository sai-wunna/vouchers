'use strict'

import _ from '../dom/index.js'
import createConfigChartBox from './_cConfigChart.js'
import { state, getChartData, salesTableData } from '../state.js'
import { lockNav, unlockNav } from '../helpers/navLocker.js'

export default (__whenQuitSubPage) => {
  const { chartConfig } = state
  let chartDataPeriod = null
  let currentChartIdx = null
  const availableCharts = []

  const [$configChartBox, __setUpConfigBox, __cleanUpConfigBox] =
    createConfigChartBox(__whenUpdateConfig)

  async function __whenUpdateConfig() {
    const data = getChartData(chartDataPeriod)
    myChart.config._config.type = chartConfig.chartType
    myChart.data = data
    myChart.update()
  }

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

  const $backToTable = _.createButton('Back', ['btn', 'btn-ghost'])

  function handleBack() {
    $main.classList.add('d-none')
    __whenQuitSubPage()
    __sleepFunc()
    unlockNav()
  }

  const $toPrevSalePeriod = _.createButton('', ['btn', 'btn-ghost', 'mx-1'])
  function handlePrevChart() {
    chartDataPeriod = availableCharts[(currentChartIdx -= 1)]
    __whenUpdateConfig()
    ih_updateNavLocker()
    ih_updatePrevNextBtn()
  }

  const $toNextSalePeriod = _.createButton('', ['btn', 'btn-ghost', 'mx-1'])
  function handleNextChart() {
    chartDataPeriod = availableCharts[(currentChartIdx += 1)]
    __whenUpdateConfig()
    ih_updateNavLocker()
    ih_updatePrevNextBtn()
  }

  function ih_updateNavLocker() {
    const percentage = salesTableData[chartDataPeriod].percentage
    lockNav(
      `In ${chartDataPeriod} ${percentage} ${
        chartDataPeriod === 'thisYear' ? '' : 'of total Sales'
      }`
    )
  }

  function ih_updatePrevNextBtn() {
    if (availableCharts[currentChartIdx - 1]) {
      $toPrevSalePeriod.textContent = availableCharts[currentChartIdx - 1]
      $toPrevSalePeriod.disabled = false
    } else {
      $toPrevSalePeriod.textContent = '-----'
      $toPrevSalePeriod.disabled = true
    }
    if (availableCharts[currentChartIdx + 1]) {
      $toNextSalePeriod.textContent = availableCharts[currentChartIdx + 1]
      $toNextSalePeriod.disabled = false
    } else {
      $toNextSalePeriod.textContent = '-----'
      $toNextSalePeriod.disabled = true
    }
  }

  const $controllers = _.createElement(
    '',
    '',
    ['controllers'],
    [
      $backToTable,
      _.createElement('', '', '', [$toPrevSalePeriod, $toNextSalePeriod]),
      $configChartBox,
    ]
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
    _.removeOn('click', $backToTable, handleBack)
    _.removeOn('click', $toPrevSalePeriod, handlePrevChart)
    _.removeOn('click', $toNextSalePeriod, handleNextChart)
    _.removeOn('resize', window, handleResize) // should not use in production
  }

  async function __setUpFunc(period) {
    if (!chartDataPeriod) {
      // only for first time
      await __setUpConfigBox()
      for (const key in salesTableData) {
        availableCharts.push(key)
      }
    }
    // set up prev-next data
    chartDataPeriod = period
    currentChartIdx = availableCharts.findIndex(
      (period) => period === chartDataPeriod
    )
    ih_updatePrevNextBtn()
    await setUpChart()
    _.on('click', $backToTable, handleBack)
    _.on('click', $toPrevSalePeriod, handlePrevChart)
    _.on('click', $toNextSalePeriod, handleNextChart)
    _.on('resize', window, handleResize)
  }

  async function __cleanUpFunc() {
    await __cleanUpConfigBox()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
