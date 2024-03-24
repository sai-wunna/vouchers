function convertToGoodInfoData(typeNodes, amountNodes, rateNodes, chargeNodes) {
  const goodInfo = []
  let totalAmount = 0
  let totalCharge = 0
  typeNodes.forEach((typeNode, index) => {
    const charge = Number(chargeNodes[index].value)
    totalCharge += charge

    const amount = amountNodes[index].value
    totalAmount += Number(amount.split('vis')[0])

    goodInfo.push({
      type: typeNode.value,
      rate: Number(rateNodes[index].value),
      amount,
      charge,
    })
  })

  return [totalAmount, totalCharge, goodInfo]
}

export default convertToGoodInfoData
