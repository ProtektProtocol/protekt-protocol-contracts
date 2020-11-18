const ClaimsManagerSingleAccount = artifacts.require("ClaimsManagerSingleAccount");
const pToken = artifacts.require("pToken");

const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const should = require("chai").should();
const { expect } = require('chai');
const { increaseTime } = require("../../scripts/testHelpers.js");

contract("ClaimsManagerSingleAccount", accounts => {
  const governance = accounts[0];
  const notGovernance = accounts[1];
  const accountAlice = accounts[2];
  const accountBob = accounts[3];
  const investigationPeriod = 43200
  let targetClaimsManager, logs, txBlockNumber
  
  beforeEach(async function () {
    targetClaimsManager = await ClaimsManagerSingleAccount.deployed();
  });

  describe('Governance features', function () {
    it("should not allow a non-governance address to set the governance address", async () => {
      await expectRevert(targetClaimsManager.setGovernance(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the governance address", async () => {
      await targetClaimsManager.setGovernance(
        accountAlice, { from: governance }
      )
      expect(await targetClaimsManager.governance()).to.equal(accountAlice);

      // Reset Governance address
      await targetClaimsManager.setGovernance(
        governance, { from: accountAlice }
      )
      expect(await targetClaimsManager.governance()).to.equal(governance);
    });

    it("should not allow a non-governance address to set the ShieldToken address", async () => {
      await expectRevert(targetClaimsManager.setShieldToken(
        accountAlice, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the ShieldToken address", async () => {
      let originalShieldToken = await targetClaimsManager.shieldToken()

      await targetClaimsManager.setShieldToken(
        accountAlice, { from: governance }
      )
      expect(await targetClaimsManager.shieldToken()).to.equal(accountAlice);

      // Reset ShieldToken address
      await targetClaimsManager.setShieldToken(
        originalShieldToken, { from: governance }
      )
      expect(await targetClaimsManager.shieldToken()).to.equal(originalShieldToken);
    });

    it("should not allow a non-governance address to set the investigationPeriod", async () => {
      let newInvestigationPeriod = 100000
      await expectRevert(targetClaimsManager.setInvestigationPeriod(
        newInvestigationPeriod, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set the investigationPeriod", async () => {
      let originalInvestigationPeriod = await targetClaimsManager.investigationPeriod()
      let newInvestigationPeriod = new BN(10000)
      await targetClaimsManager.setInvestigationPeriod(
        newInvestigationPeriod, { from: governance }
      )
      expect(await targetClaimsManager.investigationPeriod()).to.be.bignumber.equal(newInvestigationPeriod);
    
      // Reset investigationPeriod
      await targetClaimsManager.setInvestigationPeriod(
        originalInvestigationPeriod, { from: governance }
      )
      expect(await targetClaimsManager.investigationPeriod()).to.be.bignumber.equal(originalInvestigationPeriod);
    });

    it("should not allow a non-governance address to set activePayoutEvent", async () => {
      let activePayoutEvent = true
      await expectRevert(targetClaimsManager.setActivePayoutEvent(
        activePayoutEvent, { from: notGovernance }), '!governance',
      );
    });

    it("should allow the Governance address to set activePayoutEvent", async () => {
      let originalActivePayoutEvent = await targetClaimsManager.activePayoutEvent()
      let newActivePayoutEvent = true
      await targetClaimsManager.setActivePayoutEvent(
        newActivePayoutEvent, { from: governance }
      )
      expect(await targetClaimsManager.activePayoutEvent()).to.equal(newActivePayoutEvent);

      // Reset activePayoutEvent
      await targetClaimsManager.setActivePayoutEvent(
        originalActivePayoutEvent, { from: governance }
      )
      expect(await targetClaimsManager.activePayoutEvent()).to.equal(originalActivePayoutEvent);
    });
  })

  describe('when claim status is Ready', function () {
    it("should be able to checkPayoutEvent correctly", async () => {
      let originalActivePayoutEvent = await targetClaimsManager.activePayoutEvent()

      let checkPayoutEvent = await targetClaimsManager.checkPayoutEvent(
        { from: accountAlice }
      )
      expect(checkPayoutEvent).to.equal(originalActivePayoutEvent);
    });

    it("should not start a claim if no activePayoutEvent", async () => {
      let originalActivePayoutEvent = await targetClaimsManager.activePayoutEvent()

      await targetClaimsManager.submitClaim(
        { from: accountAlice }
      )

      expect(originalActivePayoutEvent).to.equal(false);
      expect(await targetClaimsManager.status()).to.be.bignumber.equal(new BN(0)); // Status = Ready
    });

    it("should not be able to payoutClaim", async () => {
      await expectRevert(targetClaimsManager.payoutClaim(
        { from: notGovernance }), '!Investigating',
      );
    });

    it("should not be able to resetClaim", async () => {
      await expectRevert(targetClaimsManager.resetClaim(
        { from: notGovernance }), '!Paid',
      );
    });

    describe('when claim submitted successfully', function () {
      it("should emit a ClaimInvestigationStarted event", async () => {
        let newInvestigationPeriod = new BN(0)
        await targetClaimsManager.setInvestigationPeriod(
          newInvestigationPeriod, { from: governance }
        )
        let investigationPeriod = await targetClaimsManager.investigationPeriod()
        
        await targetClaimsManager.setActivePayoutEvent(
          true, { from: governance }
        )
        expect(await targetClaimsManager.activePayoutEvent()).to.equal(true);
        
        const { logs } = await targetClaimsManager.submitClaim(
          { from: accountAlice }
        )
        txBlockNumber = new BN(logs[0]['blockNumber'])
        let calculatedInvestigationPeriodEnd = investigationPeriod.add(txBlockNumber)

        expectEvent.inLogs(logs, 'ClaimInvestigationStarted', {
          InvestigationPeriodEnd: calculatedInvestigationPeriodEnd
        });
      });

      it("should set claimsStatus correctly", async () => {
        expect(await targetClaimsManager.status()).to.be.bignumber.equal(new BN(1)); // Status = Investigating
      });

      it("should set currentInvestigationPeriodEnd correctly", async () => {
        let investigationPeriod = await targetClaimsManager.investigationPeriod()
        let calculatedInvestigationPeriodEnd = investigationPeriod.add(txBlockNumber)

        expect(await targetClaimsManager.currentInvestigationPeriodEnd()).to.be.bignumber.equal(calculatedInvestigationPeriodEnd);
      });
    })
  })

  describe('when claim status is Investigating', function () {
    it("should be able to checkPayoutEvent correctly", async () => {
      let originalActivePayoutEvent = await targetClaimsManager.activePayoutEvent()

      let checkPayoutEvent = await targetClaimsManager.checkPayoutEvent(
        { from: accountAlice }
      )
      expect(checkPayoutEvent).to.equal(originalActivePayoutEvent);
    });

    it("should not be able to submitClaim", async () => {
      await expectRevert(targetClaimsManager.submitClaim(
        { from: accountAlice }), '!Ready',
      );
    });

    it("should not be able to resetClaim", async () => {
      await expectRevert(targetClaimsManager.resetClaim(
        { from: accountAlice }), '!Paid',
      );
    });

    describe("when the investigation period has ended", function () {
      it("should not be able to payoutClaim if no payout event", async () => {
        await targetClaimsManager.setActivePayoutEvent(
          false, { from: governance }
        )

        await expectRevert(targetClaimsManager.payoutClaim(
          { from: accountAlice }), '!Payout Event',
        );

        // Reset
        await targetClaimsManager.setActivePayoutEvent(
          true, { from: governance }
        )
      });

      it("should be able to payoutClaim", async () => {
        const { logs } = await targetClaimsManager.payoutClaim(
          { from: accountAlice }
        )

        expectEvent.inLogs(logs, 'Payout');
        expect(await targetClaimsManager.status()).to.be.bignumber.equal(new BN(2)); // Status = Paid
      });
    })
  })

  describe('when claim status is Paid', function () {
    it("should be able to checkPayoutEvent correctly", async () => {
      let originalActivePayoutEvent = await targetClaimsManager.activePayoutEvent()

      let checkPayoutEvent = await targetClaimsManager.checkPayoutEvent(
        { from: accountAlice }
      )
      expect(checkPayoutEvent).to.equal(originalActivePayoutEvent);
    });

    it("should not be able to submitClaim", async () => {
      await expectRevert(targetClaimsManager.submitClaim(
        { from: accountAlice }), '!Ready',
      );
    });

    it("should not be able to payoutClaim", async () => {
      await expectRevert(targetClaimsManager.payoutClaim(
        { from: accountAlice }), '!Investigating',
      );
    });

    it("should be able to resetClaim", async () => {
      const { logs } = await targetClaimsManager.resetClaim(
        { from: accountAlice }
      )

      expect(await targetClaimsManager.status()).to.be.bignumber.equal(new BN(0)); // Status = Ready
    });
  })

  describe('when claim status is Investigating, after the investigation period end, payout event is false', function () {
    it("should not be able to payoutClaim", async () => {
      // Reset state
      await targetClaimsManager.setActivePayoutEvent(
        true, { from: governance }
      )
      
      await targetClaimsManager.submitClaim(
        { from: accountAlice }
      )
      await targetClaimsManager.setActivePayoutEvent(
        false, { from: governance }
      )

      await expectRevert(targetClaimsManager.payoutClaim(
        { from: accountAlice }), '!Payout Event',
      );
    });

    it("should be able to resetClaim", async () => {
      const { logs } = await targetClaimsManager.resetClaim(
        { from: accountAlice }
      )

      expect(await targetClaimsManager.status()).to.be.bignumber.equal(new BN(0)); // Status = Ready
    });
  })

  describe('when claim status is Investigating and before the investigation period end', function () {
    it("should not be able to payoutClaim", async () => {
      // Reset state
      await targetClaimsManager.setActivePayoutEvent(
        true, { from: governance }
      )
      await targetClaimsManager.setInvestigationPeriod(
        new BN(43200), { from: governance }
      )
      await targetClaimsManager.submitClaim(
        { from: accountAlice }
      )
    
      await expectRevert(targetClaimsManager.payoutClaim(
        { from: accountAlice }), '!Done Investigating',
      );
    });
  })
});