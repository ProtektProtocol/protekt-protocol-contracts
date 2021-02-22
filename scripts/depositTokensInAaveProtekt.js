// truffle exec scripts/depositToShieldToken.js --network kovan
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pTokenAave = artifacts.require("pTokenAave");
const ShieldToken = artifacts.require("ShieldToken");

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
  let underlyingToken, pToken, shieldToken, coreToken, reserveToken;
  let amount, interest;


  // 1) Check correct network =================================================
  // if(config.network!=="kovan"){
  //     throw "********** \n !kovan network \n ****************"
  // }
  // ===================================================================
  // ===================================================================

  // Kovan Continue
  try {
    const coreTokenAddress = '0xe22da380ee6B445bb8273C81944ADEB6E8450422';
    const tokenABI = [{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"showMeTheMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
    coreToken = new web3.eth.Contract(tokenABI, coreTokenAddress);
    
    const reserveTokenAddress = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
    reserveToken = await UnderlyingToken.at(reserveTokenAddress);
    
    const underlyingTokenAddress = '0xe12afec5aa12cf614678f9bfeeb98ca9bb95b5b0';
    underlyingToken = await UnderlyingToken.at(underlyingTokenAddress);

    const pTokenAddress = '0x7247DD3cAb13d24d19B6D864D0EC942746C05c95';
    const shieldTokenAddress = '0x6677696FcF42111fe5596F5364Bfe6702D4Fb263';
    pToken = await pTokenAave.at(pTokenAddress);
    shieldToken = await ShieldToken.at(shieldTokenAddress);    
  } catch(e) {
    console.error(e)
  }


  // ===================================================================
  // ===================================================================
  try {
    // ShieldToken
    amount = new BN('10000000000000000')
    // let res = await reserveToken.approve(
    //   shieldToken.address,
    //   amount,
    //   { from: governance }
    // );
    // let response0 = await shieldToken.deposit(amount, {from: governance});
    // console.log(response0);

    // Kovan CoreToken
    // let response = await pTokenAave.defaults({from: governance})
    // amount = new BN('30000000')

    // let res2 = await coreToken.methods.approve(
    //   pToken.address,
    //   amount.toString()
    // ).send({ from: governance });
    // let response1 = await pToken.depositCoreTokens(amount);
    // console.log(response1);

    // let res2 = await underlyingToken.approve(
    //   pToken.address,
    //   amount
    // );
    // let response1 = await pToken.deposit(amount);
    // console.log(response1);


    // let response1 = await pToken.withdraw(amount);
    // console.log(response1);

    let response1 = await shieldToken.withdraw(amount);
    console.log(response1);

  } catch(e) {
    console.error(e)
  }
  // ===================================================================

  console.log(`Und: ${underlyingToken.address}`)
  console.log(`P: ${pToken.address}`)
  console.log(`S: ${shieldToken.address}`)
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
  console.log(`shieldToken ${await shieldToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`Balance: ${await shieldToken.balance()}`);
  console.log(`Referer Underlying Bal: ${await shieldToken.underlyingBalanceOf(referer)}`);
  // console.log(`Referer2 Underlying Bal: ${await shieldToken.underlyingBalanceOf(referer2)}`);
  console.log('---')
  console.log(`TotalSupply: ${await shieldToken.totalSupply()}`);
  console.log(`Referer Bal: ${await shieldToken.balanceOf(referer)}`);
  // console.log(`Referer2 Bal: ${await shieldToken.balanceOf(referer2)}`);
  console.log('---')
  console.log(`LastBlock: ${await shieldToken.lastBlock()}`);
  console.log(`Referer Block: ${await shieldToken.getRefererLastBlock(referer)}`);
  console.log('---')
  console.log(`Referer for 1: ${await shieldToken.returnRefererForUser(newUser)}`);
  // console.log(`Referer for 2: ${await shieldToken.returnRefererForUser(newUser2)}`);
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
  // console.log(`shieldToken ${await shieldToken.symbol()}: ${(await shieldToken.balanceOf(governance)).toString()}`)
  // console.log('--------------------')
  // console.log('New User: ', newUser)
  // console.log('--------------------')
  // console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(newUser)).toString()}`)
  // console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(newUser)).toString()}`)
  // console.log(`shieldToken ${await shieldToken.symbol()}: ${(await shieldToken.balanceOf(newUser)).toString()}`)
  // console.log('--------------------')
  // console.log('Referer: ', referer)
  // console.log('--------------------')
  // console.log(`Underlying ${await underlyingToken.symbol()}: ${(await underlyingToken.balanceOf(referer)).toString()}`)
  // console.log(`pToken ${await pToken.symbol()}: ${(await pToken.balanceOf(referer)).toString()}`)
  // console.log(`shieldToken ${await shieldToken.symbol()}: ${(await shieldToken.balanceOf(referer)).toString()}`)
  // console.log('--------------------')
}