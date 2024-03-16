import _ from '../dom/index.js'

const $navLocker = _.getNode('.nav-locker')

let prevTop = 0

function lockNav(pageName, resetTopIfUnlock = false) {
  $navLocker.classList.add('activate-nav-locker')
  $navLocker.textContent = pageName.slice(0, 30)
  const timer = setTimeout(() => {
    $navLocker.style.color = 'black'
    clearTimeout(timer)
  }, 300)
  if (resetTopIfUnlock) {
    prevTop =
      window.scrollY || window.pageYOffset || document.documentElement.scrollTop
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function unlockNav() {
  $navLocker.style.color = 'transparent'
  if (prevTop !== 0) {
    window.scrollTo({ top: prevTop, behavior: 'smooth' })
    prevTop = 0
  }
  const timer = setTimeout(() => {
    $navLocker.classList.remove('activate-nav-locker')
    clearTimeout(timer)
  }, 300)
}

export { lockNav, unlockNav }
