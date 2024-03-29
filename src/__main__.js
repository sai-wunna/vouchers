'use strict'

import './styles.css'
import _ from './modules/dom/index.js'
import notifier from './modules/notify.js'
import $loadingPage from './modules/general/_ncLoadingPage.js'
import appendCustomStyles from './modules/helpers/appendCustomStyles.js'
import { goodTypesData } from './modules/state.js'

// --- ignite
;(() => {
  appendCustomStyles(goodTypesData)
  // set up place holder styles
  const $navigateToCustomers = _.getNodeById('toCustomers')
  const $navigateToAnalyze = _.getNodeById('toAnalyze')
  const $navigateToHome = _.getNodeById('toHome')
  const $navigateToSetting = _.getNodeById('toSetting')
  const $pageWrapper = _.getNodeById('page_wrapper')

  let currentRoute = 'setting'
  let cleanUpFunc = () => {}
  let navSpamBlocker = true

  _.on('click', $navigateToHome, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'home') return

    currentRoute = 'home'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./modules/_pHome.js')).default)
    updateTitle('Home')
  })

  _.on('click', $navigateToCustomers, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'customers') return

    currentRoute = 'customers'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./modules/_pCustomers.js')).default)
    updateTitle('Customers')
  })

  _.on('click', $navigateToAnalyze, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'analyze') return

    currentRoute = 'analyze'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./modules/_pAnalyze.js')).default)
    updateTitle('Analyze')
  })

  _.on('click', $navigateToSetting, async (e) => {
    if (navSpamBlocker) return
    if (currentRoute === 'setting') return

    currentRoute = 'setting'
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)

    setActiveNav(e.target)
    switchPage((await import('./modules/_pSetting.js')).default)
    updateTitle('Setting')
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

  _.on('beforeunload', window, (e) => {
    e.preventDefault()
    e.returnValue = ''
    return ''
  })
  ;(async () => {
    $pageWrapper.appendChild(_.createNode('br'))
    $pageWrapper.replaceChild($loadingPage, $pageWrapper.firstChild)
    switchPage((await import('./modules/_pSetting.js')).default)
  })()
})()
