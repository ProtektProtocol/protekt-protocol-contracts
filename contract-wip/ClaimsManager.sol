pragma solidity ^0.5.17;

contract ClaimsManager {

	IERC20 public shieldToken;
	enum ClaimsStatus {
		Active,
		Investigating,
		ClaimAccepted
	}
	ClaimsStatus public status;

	uint256 public investigationPeriod; // One week (14 sec block times)
	uint256 public currentInvestigationPeriodEnd;
	
	// Events
	// event Issued(address indexed account, uint value);

    constructor() public {
    	investigationPeriod = 43200
    	currentInvestigationPeriodEnd = 0
    }

    function checkPayoutEvent() public returns (bool) {
    	require(msg.sender == governance, "!governance");
    }

	function submitClaim() external returns (uint256);
		// Set currentInvestigationPeriodEnd

	function payoutClaim() external {
		require(claimsStatus == "Investigating", "!Investigating");
		require(getInvestigationPeriodEnd() >= block.number, "!Done Investigating");
		require(checkPayoutEvent(), "!Payout Event");


	}
		// Check PayoutEvent
		// Approve ClaimsProcess to move tokens
		// Send tokens to pToken.reimburse()

}

