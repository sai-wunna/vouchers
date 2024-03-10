'use strict'

import _ from './dom/index.js'

class Notify {
  #alertMessages = {
    invalid: 'Invalid Action',
    dbErr: 'Cannot connect to Database !',
    invalidVoucherInfo: 'Please Provide required Information',
    voucherCreated: 'Voucher Has Been Saved successfully',
    pageSwitchErr: 'Something went wrong on switching page',
    updatedUserInfo: 'Successfully updated',
    userCreated: 'Successfully Created',
    userCreatedErr: 'Something went wrong',
    updatedUserErr: 'Something went wrong',
    voucherUpdated: 'Successfully updated',
    voucherUpdateErr: 'Something went wrong',
    noPageData: 'No Data to Show',
    sww: 'Something Went Wrong',
    jsonFileOnly: 'Please Select Valid .json File',
    deleteComplete: 'Successfully Deleted',
    deletedCustomer: 'This Customer has been removed',
    maintenance: 'Under Construction',
    versionConflict: 'File version are not same !!!',
  }
  #countLimit
  #currentCount = 0
  #$progressLoader
  #progressTimer = null
  #progressAlertType = null

  constructor(doc, countLimit = 3) {
    this._ = doc
    this.#countLimit = countLimit
    this.#$progressLoader = this._.createElement('div', '', ['progress-alert'])
  }

  on(msg = 'invalid', type = 'success', period = 3000) {
    if (this.#currentCount >= this.#countLimit) return
    this.#currentCount += 1
    const $alertBox = this._.createElement('div', this.#alertMessages[msg], [
      'custom-alert-box',
      `alert-${type}`,
    ])
    _.appendChild($alertBox)
    let dropTimer = setTimeout(() => {
      $alertBox.style.transform = `translateY( ${
        (this.#currentCount - 1) * 110 + 20
      }%)`
    }, 10)
    let hideTimer = setTimeout(() => {
      $alertBox.style.transform = 'translateY( -100%)'
    }, period)

    let removeTimer = setTimeout(() => {
      this.#currentCount -= 1
      $alertBox.remove()
    }, period + 500)
    return () => {
      clearTimeout(dropTimer)
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }

  __start(msg = 'Loading', type = 'info') {
    clearTimeout(this.#progressTimer)

    if (this.#progressAlertType) {
      this.#$progressLoader.classList.remove(this.#progressAlertType)
    }

    this.#$progressLoader.classList.add(
      (this.#progressAlertType = `alert-${type}`)
    )

    this.#$progressLoader.textContent = msg
    _.appendChild(this.#$progressLoader)
  }

  __processing(msg = 'Almost ready', type = 'info') {
    if (this.#progressAlertType) {
      this.#$progressLoader.classList.remove(this.#progressAlertType)
    }

    this.#$progressLoader.classList.add(
      (this.#progressAlertType = `alert-${type}`)
    )
    this.#$progressLoader.textContent = msg
  }

  __end(msg = 'Ready', type = 'success') {
    if (this.#progressAlertType) {
      this.#$progressLoader.classList.remove(this.#progressAlertType)
    }

    this.#$progressLoader.classList.add(
      (this.#progressAlertType = `alert-${type}`)
    )

    this.#$progressLoader.textContent = msg
    this.#progressTimer = setTimeout(() => {
      this.#$progressLoader.remove()
      this.#$progressLoader.classList.remove(`alert-${type}`)
      clearTimeout(this.#progressTimer)
      this.#progressTimer = null
    }, 2000)
  }
}

export default new Notify(_)
