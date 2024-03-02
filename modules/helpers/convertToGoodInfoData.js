function convertToGoodInfoData(typeNodes, amountNodes, rateNodes, chargeNodes) {
  const goodInfo = []
  let totalAmount = 0
  let totalCharge = 0

  typeNodes.forEach((typeNode, index) => {
    const charge = parseInt(chargeNodes[index].value)
    totalCharge += charge

    const amount = amountNodes[index].value
    totalAmount += parseInt(amount.split('vis')[0])

    goodInfo.push({
      type: typeNode.value,
      amount,
      rate: parseInt(rateNodes[index].value),
      charge,
    })
  })

  return [totalAmount, totalCharge, goodInfo]
}

export default convertToGoodInfoData
