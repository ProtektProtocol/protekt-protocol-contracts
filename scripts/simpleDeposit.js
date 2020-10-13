const {
  formatAmount
  } = require('./utils');

module.exports = async function(callback) {
  const Token = artifacts.require("Token");

  let accounts = await web3.eth.getAccounts()
  let governance = accounts[0]
  let depositor = accounts[1]

  let underlyingToken = await Token.at('0x86658a135793A43cD2B256914d66d9b8E04A6b98')

  let govBal = await underlyingToken.balanceOf(governance)
  let depBal = await underlyingToken.balanceOf(depositor)


  console.log('Governance: ', governance)
  console.log('UnderlyingToken balance: ', govBal.toString())

  console.log('Depositor: ', depositor)
  console.log('UnderlyingToken balance: ', depBal.toString())
}