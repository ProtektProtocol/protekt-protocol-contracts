// truffle exec scripts/checkSum.js --network mainnet
const { BN } = require('@openzeppelin/test-helpers');
const {
  formatAmount
  } = require('./utils');

module.exports = async function (config) {
  let accounts = await web3.eth.getAccounts();
  
  
  console.log(web3.utils.isAddress('0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'))
  console.log(web3.utils.isAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'))

}