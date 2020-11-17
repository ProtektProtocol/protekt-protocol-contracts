const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const should = require("chai").should();
const { expect } = require('chai');
const { promisify } = require("util");
const { utils } = web3;
const { increaseTime } = require("./helpers");
const truffleAssert = require("truffle-assertions");

contract("pToken", accounts => {
  const governance = accounts[0];
  const notGovernance = accounts[1];
  const accountAlice = accounts[2];
  const accountBob = accounts[3];
  let targetpToken, underlyingToken, initialSupply, amount
  
  beforeEach(async function () {
    targetpToken = await pToken.deployed();
  });

  describe('Governance features', function () {
    beforeEach(async function () {
      targetpToken = await pToken.new(UnderlyingToken.address, governance)
    });

    it("should not allow a non-governance address to set the governance address", async () => {
      await expectRevert(targetpToken.setGovernance(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the governance address", async () => {
      await targetpToken.setGovernance(
        accountAlice, { from: governance }
      )
      expect(await targetpToken.governance()).to.equal(accountAlice);
    });

    it("should not allow a non-governance address to set the feeModal address", async () => {
      await expectRevert(targetpToken.setFeeModel(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the feeModal address", async () => {
      await targetpToken.setFeeModel(
        accountAlice, { from: governance }
      )
      expect(await targetpToken.feeModel()).to.equal(accountAlice);
    });

    it("should not allow a non-governance address to harvest rewards", async () => {
      await expectRevert(targetpToken.harvestRewards(
        { from: notGovernance }), '!governance',
      );
    });

    // it("should allow the Governance address to harvest rewards", async () => {
    //   await targetpToken.harvestRewards(
    //     { from: governance }
    //   )

    //   expectEvent.inLogs(logs, 'HarvestRewards', {
    //     amount: new BN(0)
    //   });
    // });
  })

  describe('when there are no deposits', function () {
    it("should have all balances of 0", async () => {
      expect(await targetpToken.balanceOf(governance)).to.be.bignumber.equal('0');
      expect(await targetpToken.balanceOf(notGovernance)).to.be.bignumber.equal('0');
      expect(await targetpToken.balanceOf(accountAlice)).to.be.bignumber.equal('0');
      expect(await targetpToken.balanceOf(accountBob)).to.be.bignumber.equal('0');
    });

    it("should not be able to withdraw", async () => {
      await expectRevert.unspecified(
        targetpToken.withdraw(
          10, { from: accountAlice }
        )
      );
    });

    it("should not be able to get PricePerFullShare", async () => {
      await expectRevert.unspecified(
        targetpToken.getPricePerFullShare(
          { from: accountAlice }
        )
      );
    });
  })

  describe('when there are deposits', function () {
    beforeEach(async function () {
      underlyingToken = await UnderlyingToken.new( {from: governance} )
      initialSupply = new BN('100000000000000000000000')

      targetpToken = await pToken.new(underlyingToken.address, governance)
      amount = new BN('20000000000000000000')
      await underlyingToken.approve(
        targetpToken.address,
        amount,
        { from: governance }
      );
      await targetpToken.deposit(amount, { from: governance})
    });

    it("should query correct balances", async () => {
      expect(await targetpToken.balanceOf(governance)).to.be.bignumber.equal(amount);
      expect(await targetpToken.balanceOf(notGovernance)).to.be.bignumber.equal('0');
      expect(await targetpToken.balanceOf(accountAlice)).to.be.bignumber.equal('0');
      expect(await targetpToken.balanceOf(accountBob)).to.be.bignumber.equal('0');
    });

    it("should be able to withdraw <= balance", async () => {
      amount = new BN('10000000000000000000')
      await targetpToken.withdraw(amount, { from: governance})

      expect(await targetpToken.balanceOf(governance)).to.be.bignumber.equal(amount);
    });

    it("should not be able to withdraw > balance", async () => {
      amount = new BN('30000000000000000000')
      await expectRevert.unspecified(
        targetpToken.withdraw(
          amount, { from: governance }
        )
      );
    });

    it("should calculate PricePerFullShare correctly", async () => {
      let originalAmount = new BN('1000000000000000000')
      expect(await targetpToken.getPricePerFullShare()).to.be.bignumber.equal(originalAmount);

      amount = new BN('20000000000000000000')
      await underlyingToken.transfer(targetpToken.address, amount, { from: governance})

      let finalAmount = new BN('2000000000000000000')
      expect(await targetpToken.getPricePerFullShare()).to.be.bignumber.equal(finalAmount);
    });
  })

})
