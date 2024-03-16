'use strict'

import _ from './dom/index.js'
import notifier from './notify.js'
import createAnalyzeChart from './analyze/_spChart.js'
import { lockNav } from './helpers/navLocker.js'
import lockBtn from './helpers/lockBtn.js'
import { customers, getChartData, salesTableData, vouchers } from './state.js'

export default () => {
  const $analyzeDateHeading = _.createHeading('h6')
  const $analyzeHeader = _.createElement(
    '',
    '',
    ['analyze-page-header'],
    [
      $analyzeDateHeading,
      _.createElement('p', `Total Vouchers Recorded : ${vouchers.data.length}`),
      _.createElement('p', `Total Customers Recorded : ${customers.length}`),
    ]
  )
  const $salesTimeHeader = _.createHeading('h2', '', ['my-1'])

  function createSalesTimeBox(period, percentage = '', goodInfo, total) {
    const $toChartBtn = _.createButton(`${period} ${percentage}`, [
      'btn-corner-right',
      'btn-blue',
    ])
    $toChartBtn.dataset.period = period

    const classList = ['sale-time-period']
    if (period === 'thisYear') {
      classList.push('this-year-sale')
    }

    const $percentageFragment = _.createFragment()
    const $headerFragment = _.createFragment()
    goodInfo.forEach((info) => {
      $headerFragment.appendChild(
        _.createElement(
          '',
          '',
          ['bar-amount'],
          [
            _.createSpan('', ['bar-amt-indicator']),
            _.createElement(
              '',
              '',
              ['bar-amount-info'],
              [
                _.createSpan(`${info.percentage}% ${info.type}`),
                _.createSpan(`${info.amount.toLocaleString()} ks`),
              ]
            ),
          ]
        )
      )
      const $bar = _.createElement('', '', ['bar-piece'])
      $bar.style.width = `${info.percentage}%`
      $percentageFragment.appendChild($bar)
    })

    return _.createElement('li', '', classList, [
      _.createHeading('h6', `Total - ${total.toLocaleString()} ks`),
      $toChartBtn,
      $headerFragment,
      _.createElement(
        '',
        '',
        ['percentage-bar-box'],
        [_.createElement('', '', ['percentage-bar'], [$percentageFragment])]
      ),
    ])
  }

  const $salesListTables = _.createElement('ul', '', ['sales-table'])

  async function handleClickOnTables(e) {
    lockBtn(e.target, 3000)
    if (e.target.tagName !== 'BUTTON') return
    if (window.innerWidth < 800) {
      notifier.on('chartForPcOnly', 'info')
      return
    }
    const period = e.target.dataset.period
    const percentage = salesTableData[period].percentage

    const chartData = getChartData(period)
    if (!chartData) {
      notifier.on('outOfDataForChart', 'warning')
      return
    }

    await __setUpChart(period)
    lockNav(
      `In ${period} ${percentage} ${
        period === 'thisYear' ? '' : 'of total Sales'
      }`,
      true
    )
    $salesTable.classList.add('d-none')
    $chart.classList.remove('d-none')
  }

  const $salesTable = _.createElement(
    '',
    '',
    ['sales-table-page'],
    [$analyzeHeader, $salesTimeHeader, $salesListTables]
  )

  function appendTableData() {
    const dataSet = Object.entries(salesTableData)
    if (dataSet.length > 0) {
      for (const [k, v] of dataSet) {
        const { percentage, goodInfo, total } = v
        $salesListTables.appendChild(
          createSalesTimeBox(k, percentage, goodInfo, total)
        )
      }
      $salesTimeHeader.textContent = 'Total Charge per Sales Period'
    } else {
      $salesTable.appendChild(
        _.createHeading('h6', 'No Enough Data To Analyze', [
          'text-center',
          'text-red',
          'my-1',
        ])
      )
    }
  }

  const [$chart, __setUpChart, __cleanUpChart] =
    createAnalyzeChart(__whenQuitSubPage)

  function __whenQuitSubPage() {
    $salesTable.classList.remove('d-none')
  }

  const $main = _.createElement('', '', ['analyze-page'], [$salesTable, $chart])

  async function __setUpFunc() {
    $analyzeDateHeading.textContent = `Data From ${
      vouchers.data[vouchers.data.length - 1]?.createdOn || '-----'
    } to ${vouchers.data[0]?.createdOn || '-----'}`
    _.on('click', $salesListTables, handleClickOnTables)
    await appendTableData()
  }

  async function __cleanUpFunc() {
    _.removeOn('click', $salesListTables, handleClickOnTables)
    await __cleanUpChart()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
