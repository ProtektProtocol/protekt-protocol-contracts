const BigNumber = require("bignumber.js")

module.exports.adjustTokenAmount = (amount_str, dec=18) => {
	const bigNumberValue = new BigNumber(amount_str.toString())
  const value = bigNumberValue.shiftedBy(-1 * dec).decimalPlaces(2).toNumber()

	return value
}

module.exports.formatAmount = (amount, isCurrency=false, includeDecimals=true) => {
	let usNumberFormatter = new Intl.NumberFormat('en-US');
  let usdformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: includeDecimals ? 2 : 0
  });
  let output = 0

  if(!isCurrency) {
  	output = usNumberFormatter.format(amount.toFixed(2))
  } else {
  	output = usdformatter.format(amount)
  }

	return output
}

module.exports.getDayId = async () => {
  const dateTime = parseInt((new Date().getTime() / 1000).toFixed(0))
  const dayId = dateTime - (dateTime % 86400)

	return dayId.toString()
}
