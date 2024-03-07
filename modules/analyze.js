'use strict'

import createAnalyzeChart from './analyze/chart.js'
import createSalesTimeTable from './analyze/createSalesTimeTable.js'
import _ from './dom/index.js'
import { lockNav } from './general/navLocker.js'
import { customers, tableData, vouchers } from './state.js'

function createAnalyzePage() {
  const $analyzeDateHeading = _.createHeading('h6')
  const $analyzeHeader = _.createElement(
    '',
    '',
    ['analyze-page-header'],
    [
      $analyzeDateHeading,
      _.createElement('p', `Total Vouchers Recorded : ${customers.length}`),
      _.createElement(
        'p',
        `Total Customers Recorded : ${vouchers.data.length}`
      ),
    ]
  )

  const [$salesTable, __setUpSalesTable, __cleanUpSalesTable] =
    createSalesTimeTable(handleClickToNavigateChart)

  async function handleClickToNavigateChart(e) {
    if (e.target.tagName !== 'BUTTON' || window.innerWidth < 800) return
    const period = e.target.dataset.period
    const percentage = tableData[period].percentage
    await __setUpChart(period) // must provide key or data
    lockNav(
      `In ${period} ${percentage} ${
        period === 'thisYear' ? '' : 'of total Sales'
      }`
    )
    $salesTable.classList.add('d-none')
    $chart.classList.remove('d-none')
  }

  const [$chart, __setUpChart, __cleanUpChart] = createAnalyzeChart($salesTable)

  const $main = _.createElement(
    '',
    '',
    ['analyze-page'],
    [
      $analyzeHeader,
      _.createElement(
        '',
        '',
        ['analyze-visualizer-wrapper'],
        [$salesTable, $chart]
      ),
    ]
  )

  async function __setUpFunc() {
    $analyzeDateHeading.textContent =
      'This Data is from 2023-02-01 to 2023-01-12 ( update )'
    await __setUpSalesTable()
  }

  async function __cleanUpFunc() {
    await __cleanUpSalesTable()
    await __cleanUpChart()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default createAnalyzePage
