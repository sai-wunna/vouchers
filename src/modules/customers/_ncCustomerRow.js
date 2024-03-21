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
      _.createHeading(
        'h6',
        `${name.slice(0, 20)} ${address ? `( ${address.slice(0, 20)} )` : ''}`,
        classList
      ),
      _.createElement('i', `${stars.toLocaleString()}s`),
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
