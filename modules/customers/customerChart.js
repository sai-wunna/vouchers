'use strict'

import _ from '../dom/index.js'

function createCustomerChart() {
  const $chart = _.createElement('', '', ['customer-shopping-chart-box'])
  return [
    $chart,
    () => {
      console.log('setup chart')
    },
    () => {
      console.log('cleanup chart')
    },
  ]
}

export default createCustomerChart
