'use strict'

import _ from './dom/index.js'
// reset messages by testing with database ( to set common errors )
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
  }
  #countLimit
  #currentCount = 0
  #$progressLoader
  #progressTimer = null

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
      $alertBox.style.transform = `translate(-50%, ${
        (this.#currentCount - 1) * 110 + 20
      }%)`
    }, 10)
    let hideTimer = setTimeout(() => {
      $alertBox.style.transform = 'translate(-50%, -100%)'
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
    this.#$progressLoader.classList.add(`alert-${type}`)
    this.#$progressLoader.textContent = msg
    _.appendChild(this.#$progressLoader)
  }

  __processing(msg = 'Almost ready', type = 'info') {
    this.#$progressLoader.classList.add(`alert-${type}`)
    this.#$progressLoader.textContent = msg
  }

  __end(msg = 'Ready', type = 'success') {
    this.#$progressLoader.classList.add(`alert-${type}`)
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
