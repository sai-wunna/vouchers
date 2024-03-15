import _ from '../dom/index.js'

const $navLocker = _.getNode('.nav-locker')

function lockNav(pageName) {
  $navLocker.classList.add('activate-nav-locker')
  $navLocker.textContent = pageName.slice(0, 30)
  const timer = setTimeout(() => {
    $navLocker.style.color = 'black'
    clearTimeout(timer)
  }, 300)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function unlockNav() {
  $navLocker.style.color = 'transparent'
  const timer = setTimeout(() => {
    $navLocker.classList.remove('activate-nav-locker')
    clearTimeout(timer)
  }, 300)
}

export { lockNav, unlockNav }