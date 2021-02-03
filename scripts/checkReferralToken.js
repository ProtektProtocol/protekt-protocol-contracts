// truffle exec scripts/checkReferralToken.js --network kovan
const TToken = artifacts.require("TToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

const { BN } = require('@openzeppelin/test-helpers');
const {
  formatAmount
  } = require('./utils');

module.exports = async function (config) {
  let accounts = await web3.eth.getAccounts();
  let governance = accounts[0];
  let newUser = accounts[1];
  let referer = accounts[2];
  // let newUser2 = accounts[3];
  // let referer2 = accounts[4];
  let underlyingToken, pToken, referralToken, coreToken;
  let amount, interest;


  // 1) Check correct network =================================================
  // if(config.network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================
  // ===================================================================

  // Create all contracts 
  try {
    // Development Create
    // coreToken = await UnderlyingToken.new({ from: governance });
    // await coreToken.transfer(newUser, new BN('1000000'), {from: governance} );
    // underlyingToken = await UnderlyingToken.new({ from: governance });
    // await underlyingToken.transfer(newUser, new BN('1000000'), {from: governance} );

    // Kovan Create
    // const coreTokenAddress = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
    // const tokenABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"showMeTheMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
    // coreToken = new web3.eth.Contract(tokenABI, coreTokenAddress);
    // const underlyingTokenAddress = '0xe12afec5aa12cf614678f9bfeeb98ca9bb95b5b0';
    // underlyingToken = await UnderlyingToken.at(underlyingTokenAddress);

    // pToken = await pTokenAave.new(underlyingToken.address, {from: governance} );
    // referralToken = await ReferralToken.new(pToken.address, underlyingToken.address, {from: governance} )
    // await pToken.setReferralToken(referralToken.address, {from: governance} );
  } catch(e) {
    console.error(e)
  }

  // Kovan Continue
  try {
    const coreTokenAddress = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
    const tokenABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"showMeTheMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
    coreToken = new web3.eth.Contract(tokenABI, coreTokenAddress);
    
    const underlyingTokenAddress = '0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0';
    underlyingToken = await UnderlyingToken.at(underlyingTokenAddress);

    const pTokenAddress = '0x9D0a04c0CF0d5EBC5f409D130039978eD2DC5BA5';
    const referralTokenAddress = '0xbF8fcc9aE53f396A62E4795B0ACbe6dB1807E105';
    pToken = await pTokenAave.at(pTokenAddress);
    referralToken = await ReferralToken.at(referralTokenAddress);    
  } catch(e) {
    console.error(e)
  }


  // ===================================================================
  // ===================================================================
  try {
    // amount = new BN('1000000')
    // let res = await underlyingToken.approve(
    //   pToken.address,
    //   amount,
    //   { from: newUser }
    // );
    // let response = await pToken.deposit(amount, newUser, referer, {from: newUser});
    // console.log(response);

    // Kovan CoreToken
    amount = new BN('30000000')
    let res = await coreToken.methods.approve(
      pToken.address,
      amount.toString()
    ).send({ from: governance });
    // let response = await pToken.deposit(amount, governance, newUser, {from: newUser});
    let response = await pTokenAave.defaults({from: governance})
    console.log(response);
    let response1 = await pToken.depositCoreTokens(amount, newUser, referer);
    console.log(response1);



  } catch(e) {
    console.error(e)
  }
  // ===================================================================

  console.log(`Und: ${underlyingToken.address}`)
  console.log(`P: ${pToken.address}`)
  console.log(`R: ${referralToken.address}`)
  console.log(`C: ${coreToken.address}`)
  console.log(`newUser: ${accounts[1]}`)
  console.log(`referer: ${accounts[2]}`)


  console.log('----------------------------------------')
  console.log(`pToken ${await pToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`Balance: ${await pToken.balance()}`);
  console.log(`balanceLastHarvest: ${await pToken.balanceLastHarvest()}`);
  console.log(`TotalSupply: ${await pToken.totalSupply()}`);
  console.log(`1 Balance: ${await pToken.balanceOf(newUser)}`);
  // console.log(`2 Balance: ${await pToken.balanceOf(newUser2)}`);
  console.log('----------------------------------------')
  console.log(`ReferralToken ${await referralToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`Balance: ${await referralToken.balance()}`);
  console.log(`Referer Underlying Bal: ${await referralToken.underlyingBalanceOf(referer)}`);
  // console.log(`Referer2 Underlying Bal: ${await referralToken.underlyingBalanceOf(referer2)}`);
  console.log('---')
  console.log(`TotalSupply: ${await referralToken.totalSupply()}`);
  console.log(`Referer Bal: ${await referralToken.balanceOf(referer)}`);
  // console.log(`Referer2 Bal: ${await referralToken.balanceOf(referer2)}`);
  console.log('---')
  console.log(`LastBlock: ${await referralToken.lastBlock()}`);
  console.log(`Referer Block: ${await referralToken.getRefererLastBlock(referer)}`);
  console.log('---')
  console.log(`Referer for 1: ${await referralToken.returnRefererForUser(newUser)}`);
  // console.log(`Referer for 2: ${await referralToken.returnRefererForUser(newUser2)}`);
  console.log('----------------------------------------')
  console.log(`underlyingToken ${await underlyingToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`TotalSupply: ${await underlyingToken.totalSupply()}`);
  console.log(`pToken Balance: ${await underlyingToken.balanceOf(pToken.address)}`);
  console.log(`Gov Balance: ${await underlyingToken.balanceOf(governance)}`);
  console.log(`1 Balance: ${await underlyingToken.balanceOf(newUser)}`);
  console.log(`Ref Balance: ${await underlyingToken.balanceOf(referer)}`);
  console.log('----------------------------------------')
  // console.log(`CoreToken ${await coreToken.symbol()}`)
  // console.log('----------------------------------------')
  // console.log(`TotalSupply: ${await coreToken.totalSupply()}`);
  // console.log(`Gov Balance: ${await coreToken.balanceOf(governance)}`);
  // console.log(`1 Balance: ${await coreToken.balanceOf(newUser)}`);
  // console.log(`Ref Balance: ${await coreToken.balanceOf(referer)}`);
  // console.log('--------------------')


  // console.log('Config: ', config)
  // console.log('Governance: ', governance)
  // console.log('--------------------')
  // console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(governance)).toString()}`)
  // console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(governance)).toString()}`)
  // console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(governance)).toString()}`)
  // console.log('--------------------')
  // console.log('New User: ', newUser)
  // console.log('--------------------')
  // console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(newUser)).toString()}`)
  // console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(newUser)).toString()}`)
  // console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(newUser)).toString()}`)
  // console.log('--------------------')
  // console.log('Referer: ', referer)
  // console.log('--------------------')
  // console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(referer)).toString()}`)
  // console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(referer)).toString()}`)
  // console.log(`ReferralToken ${await referralToken.symbol()}: ${(await referralToken.balanceOf(referer)).toString()}`)
  // console.log('--------------------')
}