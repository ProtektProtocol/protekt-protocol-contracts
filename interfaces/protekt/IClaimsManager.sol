pragma solidity ^0.5.17;

interface IClaimsManager {
	function setInvestigationPeriodBlocks(uint256 _period) external;

	function checkPayoutEvent() external view returns (bool);
	function submitClaim() external;
	function payoutClaim() external;
}

