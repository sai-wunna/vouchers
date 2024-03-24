'use strict'

import _ from './dom/index.js'
import {
  customers,
  state,
  vouchers,
  buildSalesTableData,
  buildMonthlyChartData,
  buildForThisYearChartData,
  setUpGoodTypesDatasets,
  goodTypesData,
  paymentMethods,
} from './state.js'
import notifier from './notify.js'
import downloadBox from './setting/_cDownloadBox.js'
import lockBtn from './helpers/lockBtn.js'
import setUpPage from './setting/_spSetup.js'
import appendCustomStyles from './helpers/appendCustomStyles.js'
import _ncHowTo from './setting/_ncHowTo.js'

export default () => {
  const {
    importedFileData: { totalVouchers, totalCustomers, version, timePeriod },
  } = state

  const expectedFileVersion = document.cookie
    .split('; ')
    .find((row) => row.startsWith('expectedFileVersion='))
    ?.split('=')[1]

  const $exceptedFileVersion = _.createHeading('h2', '------')

  const $importFileHeader = _.createHeading('h3', 'Imported Data')
  const $ifTotalVouchers = _.createElement(
    'p',
    `${totalVouchers ? `Total Vouchers Recorded : ${totalVouchers}` : '---'}`
  )
  const $ifTotalCustomers = _.createElement(
    'p',
    `${totalCustomers ? `Total Customers Recorded : ${totalCustomers}` : '---'}`
  )
  const $ifTimePeriod = _.createElement(
    'p',
    timePeriod ? `${timePeriod}` : '---'
  )
  const $ifVersion = _.createElement(
    'p',
    version ? `Version : ${version}` : '---'
  )
  const $importedFileInfoBox = _.createElement(
    '',
    '',
    ['file-info-box'],
    [$ifTotalVouchers, $ifTotalCustomers, $ifTimePeriod, $ifVersion]
  )

  let fileData = null
  const $fileIpLabel = _.createLabel('No File Selected', 'import_file_input', [
    'file-input-label',
  ])
  const $fileInput = _.createInput('file', ['file-input'], 'import_file_input')
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
          !(
            data.customers &&
            data.vouchers &&
            data.version &&
            data.timePeriod &&
            data.chartConfig &&
            data.goodTypesData &&
            data.paymentMethods &&
            data.appConfig &&
            data.user
          )
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
        $fileIpLabel.textContent = file.name
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
  async function handleConfirm(e) {
    if (!fileData) return
    lockBtn(e.target, 5000)
    try {
      notifier.__start('Building Data', 'info')
      state.importedFileData.totalVouchers = fileData.vouchers.length
      state.importedFileData.totalCustomers = fileData.customers.length
      state.importedFileData.timePeriod = fileData.timePeriod
      state.importedFileData.version = fileData.version
      state.appConfig = { ...fileData.appConfig }
      state.user = { ...fileData.user }
      state.chartConfig = { ...fileData.chartConfig }

      vouchers.splice(0, vouchers.length, ...fileData.vouchers)
      customers.splice(0, customers.length, ...fileData.customers)
      goodTypesData.splice(0, goodTypesData.length, ...fileData.goodTypesData)
      paymentMethods.splice(
        0,
        paymentMethods.length,
        ...fileData.paymentMethods
      )

      await setUpGoodTypesDatasets()
      await buildForThisYearChartData()
      await buildSalesTableData()
      await buildMonthlyChartData()
      await appendCustomStyles(goodTypesData, state.appConfig.receiptBgColor)
      state.voucherCurrentPage = 0

      await __cleanupSetUpAppPage() // to refresh memo
      notifier.__end('Ready', 'info')
    } catch (error) {
      notifier.__end('Something Went Wrong', 'error')
      console.log(error)
    }
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

  const $toSetUpPageBtn = _.createButton('Set Up', ['forth-btn'])

  async function handleToSetupPageBtn() {
    $fileManager.classList.add('d-none')
    $setUpAppPage.classList.remove('d-none')
    await __setUpSetupAppPage()
  }

  const [$setUpAppPage, __setUpSetupAppPage, __cleanupSetUpAppPage] = setUpPage(
    __whenBackToFileManager
  )

  function __whenBackToFileManager() {
    $fileManager.classList.remove('d-none')
  }

  const $howToUseBox = _ncHowTo()
  const $fileManager = _.createElement(
    '',
    '',
    ['file-manager'],
    [$toSetUpPageBtn, $exceptedFileVersion, $importedFileDataBox, $howToUseBox]
  )

  const $main = _.createElement(
    '',
    '',
    ['setting-page'],
    [$fileManager, $setUpAppPage]
  )

  async function __setUpFunc() {
    if (vouchers.length > 0 || customers.length > 0) {
      $fileManager.insertBefore($downloadBox, $fileManager.children[1])
      await __setUpDownloadBox()
      downloadBoxAppended = true
    }
    if (expectedFileVersion !== undefined && expectedFileVersion !== version) {
      $exceptedFileVersion.textContent = `Excepted Version : ${expectedFileVersion}`
    }
    _.on('change', $fileInput, handleFileChange)
    _.on('click', $confirmBtn, handleConfirm)
    _.on('click', $toSetUpPageBtn, handleToSetupPageBtn)
  }

  async function __cleanUpFunc() {
    fileData = null
    _.removeOn('change', $fileInput, handleFileChange)
    _.removeOn('click', $confirmBtn, handleConfirm)
    _.removeOn('click', $toSetUpPageBtn, handleToSetupPageBtn)
    if (downloadBoxAppended) {
      await __cleanUpDownloadBox()
    }
    await __cleanupSetUpAppPage()
  }

  return [$main, __setUpFunc, __cleanUpFunc]
}
