'use strict'

import _ from '../dom/index.js'
import notifier from '../notify.js'
import { vouchers, customers } from '../state.js'
import { getDayName, getFormatDate } from '../helpers/getDate.js'
import lockBtn from '../helpers/lockBtn.js'

export default () => {
  const $currentDataHeading = _.createHeading('h3', 'Current Data')
  const $cdTotalVouchers = _.createElement(
    'p',
    `Total Vouchers Recorded : ${vouchers.data.length}`
  )
  const $cdTotalCustomers = _.createElement(
    'p',
    `Total Customers Recorded : ${customers.length}`
  )
  const $cdTimePeriod = _.createElement('p')
  const $cdVersion = _.createElement(
    'p',
    `Version : ${getFormatDate()
      .split('-')
      .join('')}-${getDayName()}-${new Date()
      .getTime()
      .toString()
      .slice(0, 5)}********`
  )
  const $downloadBtn = _.createButton('Download', [
    'btn',
    'btn-blue',
    'float-end',
  ])

  function handleDownload(e) {
    lockBtn(e.target, 5000)
    try {
      notifier.__start('Building Data', 'info')
      const data = {
        vouchers: vouchers.data,
        customers,
        version: `${getFormatDate()
          .split('-')
          .join('')}-${getDayName()}-${new Date().getTime()}`,
        timePeriod: `From ${vouchers.data[0].createdOn} To ${
          vouchers.data[vouchers.data.length - 1].createdOn
        }`,
      }
      const jsonString = JSON.stringify(data)

      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const downloadLink = _.createAnchor('link', '', url, '', '', data.version)
      downloadLink.download = `${data.version}.json`

      _.appendChild(downloadLink)
      downloadLink.click()

      _.removeChild(downloadLink)

      document.cookie = `expectedFileVersion=${data.version}`

      notifier.__end('Download In Process', 'success')
      URL.revokeObjectURL(url)
    } catch (error) {
      notifier.__end('Something went wrong', 'danger')
      console.log(error)
    }
  }

  const $downloadBox = _.createElement(
    '',
    '',
    ['file-download-box'],
    [
      $currentDataHeading,
      _.createElement(
        '',
        '',
        ['file-data-info'],
        [
          $cdTotalVouchers,
          $cdTotalCustomers,
          $cdTimePeriod,
          $cdVersion,
          $downloadBtn,
        ]
      ),
    ]
  )

  function __setUpFunc() {
    $cdTimePeriod.textContent = `From ${
      vouchers.data[vouchers.data.length - 1]?.createdOn || '---'
    } To ${getFormatDate()}`
    _.on('click', $downloadBtn, handleDownload)
  }

  function __cleanUpFunc() {
    _.removeOn('click', $downloadBtn, handleDownload)
  }

  return [$downloadBox, __setUpFunc, __cleanUpFunc]
}
