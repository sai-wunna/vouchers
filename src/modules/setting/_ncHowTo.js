'use strict'

import _ from '../dom/index.js'

export default () => {
  const $link = _.createAnchor(
    'link',
    'Reach Me Via Github',
    'https://github.com/sai-wunna'
  )

  $link.target = 'blank'

  return _.createElement(
    '',
    '',
    ['how-to-use-box'],
    [
      _.createHeading('h6', 'How To Use', ['my-1']),
      _.createElement(
        'p',
        'This App is built to store vouchers and customers, then to track sales per month and period. Especially for small categories of Goods. No Server or internet connection is required. As offline app, user must store and reuse the .json file as database.'
      ),
      _.createList('ul', ['my-1'], '', [
        { text: 'Always Remember to Download Latest File' },
        { text: 'Always Set Up the latest file' },
        {
          text: 'Star To Charge Ratio can only be updated when no voucher is created',
        },
        {
          text: 'Suitable goods types limit is around 5, too much types make chart messy',
        },
        {
          text: 'When remove Goods Type or payment methods, make sure that no voucher has used it. Later Error or data-loss ( in-app only ) may occur',
        },
      ]),
      _.createElement('', '', ['contact-me-box'], [$link]),
    ]
  )
}
