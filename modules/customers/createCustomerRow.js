import _ from '../dom/index.js'

function createCustomerRow(data) {
  const { id, name, address, stars, favorite } = data
  const classList = []
  if (favorite) {
    classList.push('favorite-customer')
  }
  return _.createElement(
    'li',
    '',
    [],
    [
      _.createHeading('h6', `${name.slice(0, 20)}`, classList),
      _.createHeading('h6', address.slice(0, 20), ['d-md-show']),
      _.createElement('i', `${stars}⭐`),
    ],
    `cusId-${id}`
  )
}

function createCustomerRows(data) {
  const $frag = _.createFragment()
  for (const customer of data) {
    $frag.appendChild(createCustomerRow(customer))
  }
  return $frag
}

export { createCustomerRow, createCustomerRows }
