const {
  formatAmount
  } = require('./utils');

module.exports = async (callback) => {
  const Token = artifacts.require("Token");
  const underlyingTokenAddress = '0x88d11b9e69C3b0B1C32948333BDFd84fd5e4c9ae'

  let accounts = await web3.eth.getAccounts()
  let governance = accounts[0]

  let underlyingToken = await Token.at(underlyingTokenAddress)

  let govBal = await underlyingToken.balanceOf(governance)


  console.log('Underlying Token: ', underlyingTokenAddress)
  console.log('User Address: ', governance)
  console.log('UnderlyingToken balance: ', govBal.toString())
}