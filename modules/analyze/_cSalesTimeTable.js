'use strict'

import _ from '../dom/index.js'
import { tableData } from '../state.js'

function createSalesTimeTable(handleClick) {
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
          'p',
          `${info.type} - ${info.amount.toLocaleString()} ks`,
          ['bar-amount']
        )
      )
      const $bar = _.createElement('', '', ['bar-piece'])
      $bar.style.width = `${info.percentage}%`
      $percentageFragment.appendChild($bar)
    })

    return _.createElement('li', '', classList, [
      $toChartBtn,
      $headerFragment,
      _.createHeading('h6', `Total - ${total.toLocaleString()} ks`),
      _.createElement(
        '',
        '',
        ['percentage-bar-box'],
        [_.createElement('', '', ['percentage-bar'], [$percentageFragment])]
      ),
    ])
  }

  const $salesList = _.createElement('ul', '', ['sales-table'])
  const $page = _.createElement(
    '',
    '',
    ['sales-table-page'],
    [$salesTimeHeader, $salesList]
  )

  function appendData() {
    const dataSet = Object.entries(tableData)
    if (dataSet.length > 0) {
      for (const [k, v] of dataSet) {
        const { percentage, goodInfo, total } = v
        $salesList.appendChild(
          createSalesTimeBox(k, percentage, goodInfo, total)
        )
      }
      $salesTimeHeader.textContent = 'Total Charge per Sales Period'
    } else {
      $page.appendChild(
        _.createHeading('h6', 'No Data To Analyze', [
          'text-center',
          'text-red',
          'my-1',
        ])
      )
    }
  }

  async function __setUpFunc() {
    _.on('click', $salesList, handleClick)
    await appendData()
  }

  function __cleanUpFunc() {
    _.removeOn('click', $salesList, handleClick)
  }

  return [$page, __setUpFunc, __cleanUpFunc]
}

export default createSalesTimeTable
