'use strict'

import _ from '../dom/index.js'

function openModal($modal) {
  document.body.classList.add('modal-open')
  $modal.classList.add('open-modal-wrapper')
  const $box = $modal.firstChild.lastChild // real content data box
  $box.classList.add('modal-open-intro')
  const timerId = setTimeout(() => {
    clearTimeout(timerId)
    $box.classList.remove('modal-open-intro')
  })
}

function createModal($box, evtCleaner = false) {
  const [$close_modal_btn, closeBtnEvtCleaner] = _.createButton(
    'x',
    ['close-modal-btn'],
    '',
    async (e) => {
      e.preventDefault()
      if (evtCleaner) {
        await evtCleaner()
      }
      document.body.removeAttribute('class')
      $modal.classList.remove('open-modal-wrapper')
    },
    true
  )

  const $modal = _.createElement(
    '',
    '',
    ['modal-wrapper'],
    [_.createElement('', '', ['modal-content'], [$close_modal_btn, $box])]
  )

  return [$modal, closeBtnEvtCleaner]
}

export { createModal, openModal }
