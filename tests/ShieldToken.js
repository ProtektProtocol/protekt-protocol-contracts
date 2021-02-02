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
const truffleAssert = require("truffle-assertions");

// Reference tests: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC20/ERC20.test.js

contract("shieldToken", accounts => {
  const governance = accounts[0];
  const notGovernance = accounts[1];
  const accountAlice = accounts[2];
  const accountBob = accounts[3];
  const claimsManager = accounts[4]
  const notClaimsManager = accounts[5]

  let targetshieldToken, reserveToken, amount, finalAmount
  
  beforeEach(async function () {
    targetshieldToken = await shieldToken.deployed();
  });

  describe('Governance features', function () {
    beforeEach(async function () {
      targetshieldToken = await shieldToken.new(pToken.address, ReserveToken.address, controller.address ,claimsManager)
    });

    /*
        Pausing
    */

    it("should not allow a non-governance address to pause", async () => {
      await expectRevert(targetshieldToken.pause(
        { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to pause", async () => {
      await targetshieldToken.pause(
        { from: governance }
      )
      expect(await targetshieldToken.paused()).to.equal(true);
    });

    it("should not allow a non-governance address to unpause", async () => {
      await targetshieldToken.pause(
        { from: governance }
      )
      await expectRevert(targetshieldToken.pause(
        { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to unpause", async () => {
      await targetshieldToken.pause(
        { from: governance }
      )
      await targetshieldToken.unpause(
        { from: governance }
      )
      expect(await targetshieldToken.paused()).to.equal(false);
    });

    /*
        Setting governance address
    */

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

    /*
        Setting min value
    */

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

    /* 
        Setting controller
    */

    it("should not allow a non-governance address to set the controller", async () => {
      await expectRevert(targetshieldToken.setController(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the controller", async () => {
      await targetshieldToken.setController(
        accountAlice, { from: governance }
      )
      expect(await targetshieldToken.controller()).equal(accountAlice);
    });

    /*
        Setting protekt token
    */

    it("should not allow a non-governance address to set the protekt token", async () => {
      await expectRevert(targetshieldToken.setProtektToken(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the protekt token", async () => {
      await targetshieldToken.setProtektToken(
        accountAlice, { from: governance }
      )
      expect(await targetshieldToken.protektToken()).equal(accountAlice); 
    });

    /*
        Capping deposits
    */

    it("should allow the Governance address to cap the contracts", async () => {
      let amount = new BN('30000000000000000000')
      await targetshieldToken.capDeposits(
        amount, { from: governance }
      )
      expect(await targetshieldToken.isCapped()).to.equal(true);
    });

    it("should not allow a non-governance address to cap the contracts", async () => {
      let amount = new BN('30000000000000000000')
      await expectRevert(targetshieldToken.capDeposits(
        amount, { from: notGovernance }), '!governance',
      );
    });

    
    it("should allow the Governance address to un-cap the contracts", async () => {
      let amount = new BN('30000000000000000000')
      await targetshieldToken.capDeposits(
        amount, { from: governance }
      );
      await targetshieldToken.uncapDeposits(
        { from: governance }
      );
      expect(await targetshieldToken.isCapped()).to.equal(false);
    });

    it("should not allow a non-governance address to uncap the contracts", async () => {
      let amount = new BN('30000000000000000000')
      await targetshieldToken.capDeposits(
        amount, { from: governance }
      );
      await expectRevert(targetshieldToken.uncapDeposits(
        { from: notGovernance }), '!governance',
      );
    });
  })

  describe('Claims Manager features', function () {
    beforeEach(async function () {
      targetshieldToken = await shieldToken.new(pToken.address, ReserveToken.address, controller.address, claimsManager)
    });

    it("should not allow a non-claimsManager address to payout", async () => {
      await expectRevert(targetshieldToken.payout(
        { from: notClaimsManager }), '!claimsManager',
      );
    });

    it("should allow a claimsManager address to payout", async () => {
      await targetshieldToken.payout(
        { from: claimsManager }
      )
      expect(await targetshieldToken.balance()).to.be.bignumber.equal("0");
    });
  })

  describe('when there are no deposits', function () {
    beforeEach(async function () {
      targetshieldToken = await shieldToken.new(pToken.address, ReserveToken.address, controller.address ,claimsManager)
    });

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

    it("should not allow a non-claimsManager address to payout", async () => {
      await expectRevert(targetshieldToken.payout(
        { from: notClaimsManager }), '!claimsManager',
      );
    });

    it("should allow a claimsManager address to payout, but it will be 0", async () => {
      await targetshieldToken.payout(
        { from: claimsManager }
      )
      expect(await targetshieldToken.balance()).to.be.bignumber.equal("0");
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
      reserveToken = await ReserveToken.new( {from: governance} )
      // initialSupply = new BN('100000000000000000000000')

      targetshieldToken = await shieldToken.new(pToken.address, reserveToken.address, controller.address ,claimsManager)
      amount = new BN('20000000000000000000')
      await reserveToken.approve(
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

    it("should be able to withdraw <= balance when (when not paused)", async () => {
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
      await reserveToken.transfer(targetshieldToken.address, amount, { from: governance})

      finalAmount = new BN('2000000000000000000')
      expect(await targetshieldToken.getPricePerFullShare()).to.be.bignumber.equal(finalAmount);
    });


    it("should not allow a non-claimsManager address to payout", async () => {
      await expectRevert(targetshieldToken.payout(
        { from: notClaimsManager }), '!claimsManager',
      );
    });


    it("should allow a claimsManager address to payout", async () => {
      await targetshieldToken.payout(
        { from: claimsManager }
      )
      expect(await reserveToken.balanceOf(targetshieldToken.address)).to.be.bignumber.equal(new BN('0'));
    });

    
    it("should not allow withdraws when paused", async () => {
      amount = new BN('10000000000000000000')
      await targetshieldToken.pause(
        { from: governance }
      )
      await expectRevert.unspecified(
        targetshieldToken.withdraw(
          amount, { from: governance }
        )
      );
    });

    it("should allow deposits when contract is capped if deposit does not exceed cap", async () => {
      let capAmount = new BN('30000000000000000000')
      let amount = new BN('10000000000000000000')

      await targetshieldToken.capDeposits(
        capAmount, { from: governance }
      );

      await reserveToken.approve(
        targetshieldToken.address,
        amount,
        { from: governance }
      );
      await targetshieldToken.deposit(amount, { from: governance})

      expect(await targetshieldToken.balance()).to.be.bignumber.equal(capAmount);
    });

    it("should not allow deposits when contract is capped if deposit exceeds cap", async () => {
      let capAmount = new BN('30000000000000000000')
      let amount = new BN('10000000000000000001')

      await targetshieldToken.capDeposits(
        capAmount, { from: governance }
      );

      await reserveToken.approve(
        targetshieldToken.address,
        amount,
        { from: governance }
      );

      await expectRevert(targetshieldToken.deposit(amount, { from: governance}),'Cap exceeded');
    });


    
  })

  // describe('other class methods', function () {
  //   it("should allow get pause variable", async () => {

  //     expect(await targetshieldToken.paused()).to.equal(false);
  //   });
  // })


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
