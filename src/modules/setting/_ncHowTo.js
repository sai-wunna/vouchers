'use strict'

import _ from '../dom/index.js'

export default () => {
  const $link = _.createAnchor(
    'link',
    'App Crashed, Help Me Via Github',
    'https://github.com/sai-wunna'
  )

  $link.target = 'blank'

  return _.createElement(
    '',
    '',
    ['how-to-use-box'],
    [
      _.createHeading('h6', 'How To', ['my-1']),
      _.createElement(
        'p',
        'This App is built to store vouchers and customers, then to track sales per month and period. Especially for small categories of Goods. No Server or internet connection is required. As offline app, user must store and reuse the .json file as database.'
      ),
      _.createList('ul', ['my-1'], '', [
        {
          text: 'In Set up page, if u change thing under the splitter line, u must click update button.',
        },
        { text: 'Always Remember to Download Latest File.' },
        { text: 'Always Remember Set Up the Latest File.' },
        {
          text: 'Star To Charge Ratio can only be updated when no voucher is created.',
        },
        {
          text: 'Suitable goods types limit is around 5, too much types make chart messy.',
        },
        {
          text: "If a voucher or more use a good Type, u can't remove it.",
        },
        {
          text: 'Type the same short key to edit, otherwise new will be added.',
        },
      ]),
      _.createElement('', '', ['contact-me-box'], [$link]),
    ]
  )
}
