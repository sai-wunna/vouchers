'use strict'

import _ from './dom/index.js'
import { customers, importedFileData, vouchers } from './state.js'
import notifier from './notify.js'
import downloadBox from './fileManager/download.js'
import lockBtn from './helpers/lockBtn.js'

function fileManager() {
  const expectedFileVersion = document.cookie
    .split('; ')
    .find((row) => row.startsWith('expectedFileVersion='))
    ?.split('=')[1]

  const $exceptedFileVersion = _.createHeading('h2', '------')

  const $importFileHeader = _.createHeading('h3', 'Imported File Data')
  const $ifTotalVouchers = _.createElement(
    'p',
    `${
      importedFileData.totalVouchers
        ? `Total Vouchers Recorded : ${importedFileData.totalVouchers}`
        : '---'
    }`
  )
  const $ifTotalCustomers = _.createElement(
    'p',
    `${
      importedFileData.totalCustomers
        ? `Total Customers Recorded : ${importedFileData.totalCustomers}`
        : '---'
    }`
  )
  const $ifTimePeriod = _.createElement(
    'p',
    importedFileData.timePeriod ? `${importedFileData.timePeriod}` : '---'
  )
  const $ifVersion = _.createElement(
    'p',
    importedFileData.version ? `Version : ${importedFileData.version}` : '---'
  )
  const $importedFileInfoBox = _.createElement(
    '',
    '',
    ['file-info-box'],
    [$ifTotalVouchers, $ifTotalCustomers, $ifTimePeriod, $ifVersion]
  )

  let fileData = null
  const $fileIpLabel = _.createLabel('Select File', 'import_file_input', [
    'file-input-label',
  ])
  const $fileInput = _.createInput('file', ['file-input'])
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return notifier.on('jsonFileOnly', 'warning')
    if (file.type !== 'application/json')
      return notifier.on('jsonFileOnly', 'warning')

    const reader = new FileReader()

    reader.onload = async function (event) {
      const fileContent = event.target.result

      try {
        const data = JSON.parse(fileContent)
        if (
          !(data.customers || data.vouchers || data.version || data.timePeriod)
        ) {
          notifier.on('jsonFileOnly', 'warning')
          return
        }
        fileData = { ...data }
        $ifTotalVouchers.textContent = `Total Vouchers Recorded : ${data.vouchers.length}`
        $ifTotalCustomers.textContent = `Total Customers Recorded : ${data.customers.length}`
        $ifTimePeriod.textContent = data.timePeriod
        $ifVersion.textContent = `Version : ${data.version}`
        if (expectedFileVersion && data.version !== expectedFileVersion) {
          notifier.on('versionConflict', 'warning', 5000)
        }
      } catch (error) {
        notifier.on('jsonFileOnly', 'warning')
        fileData = null
      }
    }

    reader.readAsText(file)
  }

  const $confirmBtn = _.createButton('Confirm', [
    'btn',
    'btn-blue',
    'float-end',
  ])
  function handleConfirm(e) {
    if (!fileData) return
    lockBtn(e.target, 5000)
    notifier.__start('Building Data', 'info')
    importedFileData.totalVouchers = fileData.vouchers.length
    importedFileData.totalCustomers = fileData.customers.length
    importedFileData.timePeriod = fileData.timePeriod
    importedFileData.version = fileData.version

    vouchers.data.splice(0, vouchers.data.length, ...fileData.vouchers)
    customers.splice(0, customers.length, ...fileData.customers)
    vouchers.currentPage = 0
    notifier.__end('Ready', 'info')
  }

  const $importedFileDataBox = _.createElement(
    '',
    '',
    ['file-import-box'],
    [
      $importFileHeader,
      $importedFileInfoBox,
      _.createElement('', '', ['file-input-group'], [$fileIpLabel, $fileInput]),
      $confirmBtn,
    ]
  )

  const [$downloadBox, __setUpDownloadBox, __cleanUpDownloadBox] = downloadBox()
  let downloadBoxAppended = false
  const $main = _.createElement(
    '',
    '',
    ['file-page'],
    [$exceptedFileVersion, $importedFileDataBox]
  )

  async function __setUpFunc() {
    if (vouchers.data.length > 0 || customers.length > 0) {
      $main.appendChild($downloadBox)
      await __setUpDownloadBox()
      downloadBoxAppended = true
    }
    if (
      expectedFileVersion !== undefined &&
      expectedFileVersion !== importedFileData.version
    ) {
      $exceptedFileVersion.textContent = `Excepted Version : ${expectedFileVersion}`
    }
    _.on('change', $fileInput, handleFileChange)
    _.on('click', $confirmBtn, handleConfirm)
  }

  async function __cleanUpFunc() {
    _.on('change', $fileInput, handleFileChange)
    _.on('click', $confirmBtn, handleConfirm)
    if (downloadBoxAppended) {
      await __cleanUpDownloadBox()
    }
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}

export default fileManager
