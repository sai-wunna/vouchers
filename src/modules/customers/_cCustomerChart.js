'use strict'

import _ from '../dom/index.js'
import { buildCustomerChartData, state } from '../state.js'
import Chart from 'chart.js/auto'

function createCustomerChart() {
  const $chart = _.createElement('canvas', '', [], [])
  let myChart = null

  async function setUpChart(data) {
    myChart = new Chart($chart, {
      type: state.chartConfig.chartType,
      data: data,
      options: { responsive: true },
    })
  }

  const $main = _.createElement('', '', ['chart-wrapper'], [$chart])

  async function __setUpFunc(vouchers) {
    try {
      const chartData = await buildCustomerChartData(vouchers)
      await setUpChart(chartData)
    } catch (error) {
      console.log(error)
    }
  }

  function __cleanUpFunc() {
    if (myChart) {
      myChart.destroy()
    }
    myChart = null
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createCustomerChart
