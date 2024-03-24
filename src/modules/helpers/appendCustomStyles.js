'use strict'

import _ from '../dom/index.js'

export default (goodTypesData, receiptBgColor) => {
  let result = `.percentage-bar { background-color : ${goodTypesData[0].borderColor} }`

  goodTypesData.forEach((type, index) => {
    result += `.bar-amount:nth-child(${
      index + 3
    }) > .bar-amt-indicator { background-color : ${type.borderColor} }`

    result += `.bar-piece:nth-child(${index + 1}) { background-color : ${
      type.borderColor
    } }`
  })

  result += `.receipt-box, .customer-voucher { background-color : ${receiptBgColor} !important }`

  _.getNodeById('custom_styles').textContent = result
}

/*
---- this starts from three
.bar-amount:nth-child(3) > .bar-amt-indicator {
  background-color: rgb(112, 97, 188);
}

---- this is base bar
.percentage-bar {
  background-color: rgb(112, 97, 188);
}

---- this starts from 2
.bar-piece:nth-child(2) {
  background-color: rgb(206, 86, 86);
}

*/
