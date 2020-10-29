pragma solidity ^0.5.17;

interface IClaimsManagerCore {
	enum ClaimsStatus {
		Active,
		Investigating,
		ClaimAccepted
	}

	// Setters
	function setShieldToken(address _shieldToken) external;
	function setInvestigationPeriodBlocks(uint256 _period) external;

	// Claims Management
	function checkPayoutEvent() external view returns (bool);
	function submitClaim() external;
	function payoutClaim() external;

	// Variables
	function status() external returns (ClaimsStatus);
	function investigationPeriod() external returns (uint256);
	function currentInvestigationPeriodEnd() external returns (uint256);
	function activePayoutEvent() external returns (bool);
}