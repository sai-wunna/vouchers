'use strict'

import _ from '../dom/index.js'
import createConfigChartBox from './_cConfigChart.js'
import { state, getChartDataByPeriod } from '../state.js'
import { unlockNav } from '../general/navLocker.js'

function createAnalyzeChart($salesTable) {
  const { chartConfig } = state
  let cleanMemoTimer = null
  const [$configChartBox, __setUpConfigBox, __cleanUpConfigBox] =
    createConfigChartBox(handleUpdate)

  async function handleUpdate() {
    const data = await getChartDataByPeriod(chartDataPeriod)
    myChart.config._config.type = chartConfig.chartType
    myChart.data = data
    myChart.update()
  }

  let chartDataPeriod = null
  const $chart = _.createElement('canvas', '', [], [], 'analyze_chart')
  let myChart = null

  async function setUpChart() {
    const data = await getChartDataByPeriod(chartDataPeriod)
    myChart = new Chart($chart, {
      type: chartConfig.chartType,
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
      },
    })
  }

  const $backToTable = _.createButton('X', ['btn', 'btn-ghost'])

  function handleBack() {
    $main.classList.add('d-none')
    $salesTable.classList.remove('d-none')
    cleanMemoTimer = setTimeout(() => {
      __sleepFunc()
    }, 10000)
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
    myChart = chartDataPeriod = cleanMemoTimer = null
    _.on('click', $backToTable, handleBack)
    _.removeOn('resize', window, handleResize) // should not use in production
  }

  async function __setUpFunc(period) {
    clearTimeout(cleanMemoTimer)
    cleanMemoTimer = null

    if (chartDataPeriod === period) {
      return
    }
    if (myChart) {
      myChart.destroy()
    }
    chartDataPeriod = period
    await setUpChart()
    await __setUpConfigBox()
    _.on('click', $backToTable, handleBack)
    _.on('resize', window, handleResize)
  }

  async function __cleanUpFunc() {
    await __cleanUpConfigBox()
    if (cleanMemoTimer) {
      clearTimeout(cleanMemoTimer)
      __sleepFunc()
    }
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createAnalyzeChart
