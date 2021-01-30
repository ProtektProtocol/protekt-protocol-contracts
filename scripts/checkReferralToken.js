// truffle exec scripts/checkReferralToken.js --network kovan
const { BN } = require('@openzeppelin/test-helpers');
const {
  formatAmount
  } = require('./utils');

module.exports = async function (config) {
  const TToken = artifacts.require("TToken");
	const pTokenAave = artifacts.require("pTokenAave");
	const ReferralToken = artifacts.require("ReferralToken");

  const underlyingTokenAddress = '0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad';
  const pTokenAddress = '0x0E59208EfCc2A55334C905De90760366b1959e30';
  const referralTokenAddress = '0x60AE7f55B463aa859CeDbD177567Ea4a25570c12';

  // 1) Check correct network =================================================
  // if(config.network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================

  let accounts = await web3.eth.getAccounts();
  let governance = accounts[0];
  let newUser = accounts[1];
  let referer = accounts[2];

  let underlyingToken = await TToken.at(underlyingTokenAddress)
  let pToken = await pTokenAave.at(pTokenAddress)
  let referralToken = await ReferralToken.at(referralTokenAddress)

  // ===================================================================
  try {
    let amount = new BN('100000000');
    await underlyingToken.approve(
      pToken.address,
      amount,
      { from: newUser }
    );
    console.log('herehere')
    let response = await pToken.deposit(amount, newUser, referer, {from: newUser});
    console.log(response);








  } catch(e) {
    console.error(e)
  }
  // ===================================================================


  // console.log('Config: ', config)
  console.log('Governance: ', governance)
  console.log('--------------------')
  console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(governance)).toString()}`)
  console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(governance)).toString()}`)
  console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(governance)).toString()}`)
  console.log('--------------------')
  console.log('New User: ', newUser)
  console.log('--------------------')
  console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(newUser)).toString()}`)
  console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(newUser)).toString()}`)
  console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(newUser)).toString()}`)
  console.log('--------------------')
  console.log('Referer: ', referer)
  console.log('--------------------')
  console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(referer)).toString()}`)
  console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(referer)).toString()}`)
  console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(referer)).toString()}`)
  console.log('--------------------')
}