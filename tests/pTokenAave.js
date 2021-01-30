const TToken = artifacts.require("TToken");
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pTokenAave = artifacts.require("pTokenAave");
const ReferralToken = artifacts.require("ReferralToken");

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const should = require("chai").should();
const { expect } = require('chai');

contract("referralToken", async accounts => {
  let governance = accounts[0];
  let newUser = accounts[1];
  let referer = accounts[2];
  let newUser2 = accounts[3];
  let referer2 = accounts[4];
  let underlyingToken, pToken, referralToken;
  let amount, interest;
  
  beforeEach(async function () {
    underlyingToken = await UnderlyingToken.new( {from: newUser} );
    await underlyingToken.transfer(newUser2, new BN('100000000000'), {from: newUser} );
    pToken = await pTokenAave.new(underlyingToken.address, {from: governance} );
    referralToken = await ReferralToken.new(pToken.address, underlyingToken.address, {from: governance} );
    await pToken.setReferralToken(referralToken.address);
  });

  describe('pToken simple deposit, no interest', function () {
    beforeEach(async function () {
      amount = new BN('100000000')
      await underlyingToken.approve(
        pToken.address,
        amount,
        { from: newUser }
      );
      await pToken.deposit(amount, newUser, referer, { from: newUser})
    });

    it("newUsers can deposit underlyingTokens", async () => {
      expect(await pToken.balanceOf(newUser)).to.be.bignumber.equal(amount);
      expect(await pToken.balance()).to.be.bignumber.equal(amount);
      expect(await pToken.totalSupply()).to.be.bignumber.equal(amount);
      expect(await pToken.balanceLastHarvest()).to.be.bignumber.equal(amount);
      expect(await referralToken.totalSupply()).to.be.bignumber.equal('0');
      expect(await referralToken.balanceOf(referer)).to.be.bignumber.equal('0');
      expect(await referralToken.balance()).to.be.bignumber.equal('0');
      expect(await referralToken.underlyingBalanceOf(referer)).to.be.bignumber.equal('0');
    });

    it("newUsers can withdraw underlyingTokens", async () => {
      let withdrawAmount = new BN('60000000')
      let amountLeft = new BN('40000000')
      let response = await pToken.withdraw(withdrawAmount, { from: newUser})
      // let blockNum = response.receipt.blockNumber;

      expect(await pToken.balanceOf(newUser)).to.be.bignumber.equal(amountLeft);
      expect(await pToken.balance()).to.be.bignumber.equal(amountLeft);
      expect(await pToken.totalSupply()).to.be.bignumber.equal(amountLeft);
      expect(await pToken.balanceLastHarvest()).to.be.bignumber.equal(amountLeft);
      expect(await referralToken.totalSupply()).to.be.bignumber.equal(amount);
      expect(await referralToken.balanceOf(referer)).to.be.bignumber.equal(amount);
      expect(await referralToken.balance()).to.be.bignumber.equal('0');
      expect(await referralToken.underlyingBalanceOf(referer)).to.be.bignumber.equal('0');
    });
  })


  describe('pToken simple deposit, with interest', function () {
    beforeEach(async function () {
      amount = new BN('100000000')
      await underlyingToken.approve(
        pToken.address,
        amount,
        { from: newUser }
      );
      await pToken.deposit(amount, newUser, referer, { from: newUser})
      interest = new BN('10000000')
      await underlyingToken.transfer(referralToken.address, interest, { from: newUser})
    });

    it("newUsers can deposit underlyingTokens", async () => {
      expect(await pToken.balanceOf(newUser)).to.be.bignumber.equal(amount);
      expect(await pToken.balance()).to.be.bignumber.equal(amount);
      expect(await pToken.totalSupply()).to.be.bignumber.equal(amount);
      expect(await pToken.balanceLastHarvest()).to.be.bignumber.equal(amount);
      expect(await referralToken.totalSupply()).to.be.bignumber.equal('0');
      expect(await referralToken.balanceOf(referer)).to.be.bignumber.equal('0');
      expect(await referralToken.balance()).to.be.bignumber.equal(interest);
      expect(await referralToken.underlyingBalanceOf(referer)).to.be.bignumber.equal('0');
    });

    it("newUsers can withdraw underlyingTokens", async () => {
      let withdrawAmount = new BN('60000000')
      let amountLeft = new BN('40000000')
      await pToken.withdraw(withdrawAmount, { from: newUser})

      expect(await pToken.balanceOf(newUser)).to.be.bignumber.equal(amountLeft);
      expect(await pToken.balance()).to.be.bignumber.equal(amountLeft);
      expect(await pToken.totalSupply()).to.be.bignumber.equal(amountLeft);
      expect(await pToken.balanceLastHarvest()).to.be.bignumber.equal(amountLeft);
      expect(await referralToken.totalSupply()).to.be.bignumber.equal(amount.mul(new BN('2')));
      expect(await referralToken.balanceOf(referer)).to.be.bignumber.equal(amount.mul(new BN('2')));
      expect(await referralToken.balance()).to.be.bignumber.equal(interest);
      expect(await referralToken.underlyingBalanceOf(referer)).to.be.bignumber.equal(interest);
    });

    it("balanced remain correct through multiple txs", async () => {
      let withdrawAmount = new BN('20000000')
      let amountLeft = new BN('80000000')
      await pToken.withdraw(withdrawAmount, { from: newUser})
      await pToken.withdraw(withdrawAmount, { from: newUser})
      await underlyingToken.approve(
        pToken.address,
        amount,
        { from: newUser }
      );
      await pToken.deposit(amount, newUser, referer, { from: newUser})
      await pToken.withdraw(withdrawAmount, { from: newUser})
      await pToken.withdraw(withdrawAmount, { from: newUser})

      expect(await referralToken.totalSupply()).to.be.bignumber.equal(await referralToken.balanceOf(referer));
      expect(await referralToken.balance()).to.be.bignumber.equal(await referralToken.underlyingBalanceOf(referer));
    });

    it("balanced remain correct through multiple referers", async () => {
      let withdrawAmount = new BN('20000000')
      let amountLeft = new BN('80000000')
      await pToken.withdraw(withdrawAmount, { from: newUser})

      await logReferralToken();

      await pToken.withdraw(withdrawAmount, { from: newUser})

      await logReferralToken();

      await underlyingToken.approve(
        pToken.address,
        amount,
        { from: newUser2 }
      );
      await pToken.deposit(amount, newUser2, referer2, { from: newUser2})
      
      await logReferralToken();

      await underlyingToken.approve(
        pToken.address,
        amount,
        { from: newUser }
      );
      await pToken.deposit(amount, newUser, referer, { from: newUser})
      
      await logReferralToken();

      await pToken.withdraw(withdrawAmount, { from: newUser})

      await logReferralToken();

      await pToken.withdraw(withdrawAmount, { from: newUser})

      await logReferralToken();

      await pToken.withdraw(withdrawAmount, { from: newUser2})

      await logReferralToken();

      let referer1Bal = await referralToken.balanceOf(referer);
      let referer2Bal = await referralToken.balanceOf(referer2);
      let referer1UBal = await referralToken.underlyingBalanceOf(referer);
      let referer2UBal = await referralToken.underlyingBalanceOf(referer2);
      expect(await referralToken.totalSupply()).to.be.bignumber.equal(referer1Bal.add(referer2Bal));
      // expect(await referralToken.balance()).to.be.bignumber.equal(referer1UBal.add(referer2UBal));
    });
  })

async function logReferralToken() {
  console.log('----------------------------------------')
  console.log(`pToken ${await pToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`Balance: ${await pToken.balance()}`);
  console.log(`balanceLastHarvest: ${await pToken.balanceLastHarvest()}`);
  console.log(`TotalSupply: ${await pToken.totalSupply()}`);
  console.log(`1 Balance: ${await pToken.balanceOf(newUser)}`);
  console.log(`2 Balance: ${await pToken.balanceOf(newUser2)}`);
  console.log('----------------------------------------')
  console.log(`ReferralToken ${await referralToken.symbol()}`)
  console.log('----------------------------------------')
  console.log(`Balance: ${await referralToken.balance()}`);
  console.log(`Referer Underlying Bal: ${await referralToken.underlyingBalanceOf(referer)}`);
  console.log(`Referer2 Underlying Bal: ${await referralToken.underlyingBalanceOf(referer2)}`);
  console.log('---')
  console.log(`TotalSupply: ${await referralToken.totalSupply()}`);
  console.log(`Referer Bal: ${await referralToken.balanceOf(referer)}`);
  console.log(`Referer2 Bal: ${await referralToken.balanceOf(referer2)}`);
  console.log('---')
  console.log(`LastBlock: ${await referralToken.lastBlock()}`);
  console.log(`Referer Block: ${await referralToken.getRefererLastBlock(referer)}`);
  console.log('---')
  console.log(`Referer for 1: ${await referralToken.returnRefererForUser(newUser)}`);
  console.log(`Referer for 2: ${await referralToken.returnRefererForUser(newUser2)}`);
  console.log('--------------------');
}

})


