pragma solidity ^0.5.17;

contract Claimable {

	enum ClaimsStatus {
		Active,
		Investigating,
		ClaimAccepted
	}

	ClaimsStatus public claimsStatus

	function getClaimInvestigationPeriodBlocks() public view returns (uint256);

	function setClaimInvestigationPeriodBlocks(uint256 _period) external;

	function getClaimInvestigationPeriodEnd() public view returns (uint256);

	function getStatus() public view returns (bytes32);

	function setAppraisalPerpToken(uint256 amountInUSD) external;

	function getAppraisalPerpToken() public view returns (uint256);

	function getCoveragerPerpToken() public view returns (uint256);

	function getClaimInvestigationPeriodEnd() public view returns (uint256);

	function submitClaim() external returns (uint256);

	function payoutClaim() external;
}

