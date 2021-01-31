// truffle exec scripts/checkReferralToken.js --network kovan
const { BN } = require('@openzeppelin/test-helpers');
const {
  formatAmount
  } = require('./utils');

module.exports = async function (config) {
  const UnderlyingToken = artifacts.require("UnderlyingToken");
	const pTokenAave = artifacts.require("pTokenAave");
	const ReferralToken = artifacts.require("ReferralToken");

  const coreTokenAddress = "0xe22da380ee6b445bb8273c81944adeb6e8450422"
  const underlyingTokenAddress = '0x4958598AaE5CA046789b8e388F5658149df744E3';
  const pTokenAddress = '0xB7CC9B724A7c025201a93B6acA07AE9748B78411';
  const referralTokenAddress = '0xff73c2b7503FD7E8F0969c7a7457e3A5269a2e67';

  // 1) Check correct network =================================================
  // if(config.network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================

  let accounts = await web3.eth.getAccounts();
  let governance = accounts[0];
  let newUser = accounts[1];
  let referer = accounts[2];

  let underlyingToken = await UnderlyingToken.new();
  let pToken = await pTokenAave.new(underlyingToken.address);
  let referralToken = await ReferralToken.new(pToken.address, underlyingToken.address)
  // let pToken = await pTokenAave.at(pTokenAddress)
  // let referralToken = await ReferralToken.at(referralTokenAddress)

  // ===================================================================
  try {
    let amount = new BN('1000000');
    await underlyingToken.approve(
      pToken.address,
      amount,
      { from: governance }
    );
    let response = await pToken.deposit(amount, newUser, referer, {from: governance});
    // let response = await pToken.depositCoreTokens(amount, newUser, referer, {from: governance});
    // console.log(response);








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