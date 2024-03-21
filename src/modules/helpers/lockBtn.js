'use strict'

function lockBtn(btn, delay = 500) {
  btn.disabled = true
  const timerId = setTimeout(() => {
    btn.disabled = false
    clearTimeout(timerId)
  }, delay)
}

export default lockBtn
