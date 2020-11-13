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

contract("pToken", accounts => {
  const governance = accounts[0];
  const notGovernance = accounts[1];
  let targetpToken
  
  beforeEach(async function () {
    targetpToken = await pToken.deployed();
  });

  describe('Governance features', function () {

    it("should not allow a non-governance address to set the governance address", async () => {
      await expectRevert(targetpToken.setGovernance(
        notGovernance, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the governance address", async () => {
      await targetpToken.setGovernance(
        notGovernance, { from: governance }
      )
      expect(await targetpToken.governance()).to.equal(notGovernance);
    });

    it("should not allow a non-governance address to set the feeModal address", async () => {
      // await expectRevert(targetpToken.setGovernance(
      //   notGovernance, { from: notGovernance }), '!governance',
      // );
      expect(1).to.equal(2);
    });

    it("should allow the Governance address to set the feeModal address", async () => {
      // await targetpToken.setGovernance(
      //   notGovernance, { from: governance }
      // )
      // expect(await targetpToken.governance()).to.equal(notGovernance);
      expect(1).to.equal(2);
    });
  })

  describe('when there are no deposits', function () {
    it("should have all balances of 0", async () => {
      expect(1).to.equal(2);
    });

    it("should not be able to withdraw", async () => {
      expect(1).to.equal(2);
    });

    it("should not be able to withdrawAll", async () => {
      expect(1).to.equal(2);
    });
  })

  describe('when there are deposits', function () {

  //   When there are some deposits
  // -balance
  // -depositAll
  // -deposit
  //   -deposit more than have
  // -withdrawAll
  // -withdraw
  //   -More than user has
  // -getPricePerFullShare()
  //   -when 0
  //   -when some
  // -harvestRewards - Compound
  //   -Test governance revert

  })

})
