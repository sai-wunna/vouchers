'use strict'
import _ from './dom/index.js'
import notifier from './notify.js'
import $loadingPage from './general/loadingPage.js'

// ---
;(() => {
  const $navigateToCustomers = _.getNodeById('toCustomers')
  const $navigateToAnalyze = _.getNodeById('toAnalyze')
  const $navigateToHome = _.getNodeById('toHome')
  const $navigateToFileManager = _.getNodeById('toFileManager')
  const $pageWrapper = _.getNodeById('page_wrapper')

  let currentRoute = 'home'
  let cleanUpFunc = () => {}
  let navSpamBlocker = true

  _.on('click', $navigateToHome, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'home') return

    currentRoute = 'home'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./home.js')).default)
    updateTitle('Home')
  })

  _.on('click', $navigateToCustomers, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'customers') return

    currentRoute = 'customers'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./customers.js')).default)
    updateTitle('Customers')
  })

  _.on('click', $navigateToAnalyze, async (e) => {
    notifier.on('maintenance', 'warning')
    // if (navSpamBlocker) return
    // if (currentRoute === 'analyze') return

    // currentRoute = 'analyze'
    // $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    // setActiveNav(e.target)
    // switchPage((await import('./analyze.js')).default)
    // updateTitle('Analyze')
  })

  _.on('click', $navigateToFileManager, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'file') return

    currentRoute = 'file'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./fileManager.js')).default)
    updateTitle('File Manager')
  })

  function setActiveNav($node) {
    _.getNode('.active-nav').classList.remove('active-nav')
    $node.classList.add('active-nav')
  }

  async function switchPage(createPage) {
    try {
      await cleanUpFunc()
      navSpamBlocker = true

      const [$page, __setUpPage, __cleanUpPage] = await createPage()
      await __setUpPage()
      cleanUpFunc = __cleanUpPage

      window.scrollTo({ top: 0, behavior: 'smooth' })

      const timerId = setTimeout(async () => {
        $loadingPage.replaceWith($page)
        navSpamBlocker = false
        clearTimeout(timerId)
      }, 500)
    } catch (error) {
      notifier.on('pageSwitchErr', 'error')
      console.log(error)
    }
  }

  function updateTitle(page) {
    document.title = page
  }

  window.addEventListener('beforeunload', function (e) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  })
  ;(async () => {
    $pageWrapper.appendChild(_.createElement('br'))
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)
    switchPage((await import('./home.js')).default)
  })()
})()
