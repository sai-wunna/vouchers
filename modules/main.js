'use strict'
import _ from './dom/index.js'
import notifier from './notify.js'
import $loadingPage from './general/loadingPage.js'

// ---
;(() => {
  const $navigateToCustomers = _.getNodeById('toCustomers')
  const $navigateToAnalyze = _.getNodeById('toAnalyze')
  const $navigateToHome = _.getNodeById('toHome')
  const $pageWrapper = _.getNodeById('page_wrapper')

  let currentRoute = 'home'
  let cleanUpFunc = () => {}
  let spamBlocker = true

  _.on('click', $navigateToHome, async (e) => {
    if (spamBlocker) return

    if (currentRoute === 'home') return

    currentRoute = 'home'
    setActiveNav(e.target)
    switchPage((await import('./home.js')).default)
    updateTitle('Home')
  })

  _.on('click', $navigateToCustomers, async (e) => {
    if (spamBlocker) return

    if (currentRoute === 'customers') return

    currentRoute = 'customers'
    setActiveNav(e.target)
    switchPage((await import('./customers.js')).default)
    updateTitle('Customers')
  })

  _.on('click', $navigateToAnalyze, async (e) => {
    if (spamBlocker) return

    if (currentRoute === 'analyze') return

    currentRoute = 'analyze'

    setActiveNav(e.target)
    switchPage((await import('./analyze.js')).default)
    updateTitle('Analyze')
  })

  function setActiveNav($node) {
    _.getNode('.active-nav').classList.remove('active-nav')
    $node.classList.add('active-nav')
  }

  async function switchPage(createPage) {
    try {
      await cleanUpFunc()
      spamBlocker = true
      const [$page, __setUpPage, __cleanUpPage] = await createPage()
      await __setUpPage()

      window.scrollTo({ top: 0, behavior: 'smooth' })
      $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

      cleanUpFunc = __cleanUpPage
      const timerId = setTimeout(async () => {
        $loadingPage.replaceWith($page)
        spamBlocker = false
        clearTimeout(timerId)
      }, 500)
    } catch (error) {
      notifier.on('pageSwitchErr', 'error')
      console.log(error)
    }
  }

  function updateTitle(page) {
    document.title = 'VC ' + page
  }
  ;(async () => {
    $pageWrapper.appendChild(_.createElement('br'))
    switchPage((await import('./home.js')).default)
  })()
})()
