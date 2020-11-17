const ReserveToken = artifacts.require("ReserveToken");
const shieldToken = artifacts.require("ShieldToken");
const controller = artifacts.require("Controller")
const UnderlyingToken = artifacts.require("UnderlyingToken");
const pToken = artifacts.require("pToken");

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const should = require("chai").should();
const { expect } = require('chai');
const { promisify } = require("util");
const { utils } = web3;
const { increaseTime } = require("./helpers");
const truffleAssert = require("truffle-assertions");

// Reference tests: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC20/ERC20.test.js

contract("shieldToken", accounts => {
  const governance = accounts[0];
  const notGovernance = accounts[1];
  const accountAlice = accounts[2];
  const accountBob = accounts[3];
  let targetshieldToken, reserveToken, initialSupply, amount
  
  beforeEach(async function () {
    targetshieldToken = await shieldToken.deployed();
  });

  describe('Governance features', function () {
    beforeEach(async function () {
      
      targetshieldToken = await shieldToken.new(pToken.address, ReserveToken.address, controller.address ,governance)
    });

    it("should not allow a non-governance address to set the governance address", async () => {
      await expectRevert(targetshieldToken.setGovernance(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the governance address", async () => {
      await targetshieldToken.setGovernance(
        accountAlice, { from: governance }
      )
      expect(await targetshieldToken.governance()).to.equal(accountAlice);
    });

    it("should not allow a non-governance address to set the min value", async () => {
      await expectRevert(targetshieldToken.setMin(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    
    it("should allow the Governance address to set the min value", async () => {
      await targetshieldToken.setMin(
        10000000, { from: governance }
      )
      expect(await targetshieldToken.min()).to.be.bignumber.equal("10000000");
    });

    // setting controller

    // setting protekt token



    // these don't exist in shield
    
    // it("should allow the Governance address to set the feeModal address", async () => {
    //   await targetshieldToken.setFeeModel(
    //     accountAlice, { from: governance }
    //   )
    //   expect(await targetshieldToken.feeModel()).to.equal(accountAlice);
    // });

    // it("should not allow a non-governance address to harvest rewards", async () => {
    //   await expectRevert(targetshieldToken.harvestRewards(
    //     { from: notGovernance }), '!governance',
    //   );
    // });

    // it("should allow the Governance address to harvest rewards", async () => {
    //   await targetshieldToken.harvestRewards(
    //     { from: governance }
    //   )

    //   expectEvent.inLogs(logs, 'HarvestRewards', {
    //     amount: new BN(0)
    //   });
    // });
  })

  describe('when there are no deposits', function () {
    it("should have all balances of 0", async () => {
      expect(await targetshieldToken.balanceOf(governance)).to.be.bignumber.equal('0');
      expect(await targetshieldToken.balanceOf(notGovernance)).to.be.bignumber.equal('0');
      expect(await targetshieldToken.balanceOf(accountAlice)).to.be.bignumber.equal('0');
      expect(await targetshieldToken.balanceOf(accountBob)).to.be.bignumber.equal('0');
    });

    it("should not be able to withdraw", async () => {
      await expectRevert.unspecified(
        targetshieldToken.withdraw(
          10, { from: accountAlice }
        )
      );
    });

    it("should not be able to get PricePerFullShare", async () => {
      await expectRevert.unspecified(
        targetshieldToken.getPricePerFullShare(
          { from: accountAlice }
        )
      );
    });
  })

  describe('when there are deposits', function () {
    beforeEach(async function () {
      ReserveToken = await ReserveToken.new( {from: governance} )
      initialSupply = new BN('100000000000000000000000')

      targetshieldToken = await shieldToken.new(ReserveToken.address, governance)
      amount = new BN('20000000000000000000')
      await ReserveToken.approve(
        targetshieldToken.address,
        amount,
        { from: governance }
      );
      await targetshieldToken.deposit(amount, { from: governance})
    });

    it("should query correct balances", async () => {
      expect(await targetshieldToken.balanceOf(governance)).to.be.bignumber.equal(amount);
      expect(await targetshieldToken.balanceOf(notGovernance)).to.be.bignumber.equal('0');
      expect(await targetshieldToken.balanceOf(accountAlice)).to.be.bignumber.equal('0');
      expect(await targetshieldToken.balanceOf(accountBob)).to.be.bignumber.equal('0');
    });

    it("should be able to withdraw <= balance", async () => {
      amount = new BN('10000000000000000000')
      await targetshieldToken.withdraw(amount, { from: governance})

      expect(await targetshieldToken.balanceOf(governance)).to.be.bignumber.equal(amount);
    });

    it("should not be able to withdraw > balance", async () => {
      amount = new BN('30000000000000000000')
      await expectRevert.unspecified(
        targetshieldToken.withdraw(
          amount, { from: governance }
        )
      );
    });

    it("should calculate PricePerFullShare correctly", async () => {
      let originalAmount = new BN('1000000000000000000')
      expect(await targetshieldToken.getPricePerFullShare()).to.be.bignumber.equal(originalAmount);

      amount = new BN('20000000000000000000')
      await ReserveToken.transfer(targetshieldToken.address, amount, { from: governance})

      let finalAmount = new BN('2000000000000000000')
      expect(await targetshieldToken.getPricePerFullShare()).to.be.bignumber.equal(finalAmount);
    });
  })

  describe('when rewards are harvested', function () {
    // it("should query correct balances", async () => {
    //   expect(1).to.equal(2);
    // });

    // it("should be able to withdraw <= balance", async () => {
    //   expect(1).to.equal(2);
    // });

    // it("should not be able to withdraw > balance", async () => {
    //   expect(1).to.equal(2);
    // });

    // it("should calculate PricePerFullShare correctly", async () => {
    //   expect(1).to.equal(2);
    // });
  })

})
