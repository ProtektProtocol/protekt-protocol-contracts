pragma solidity ^0.5.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../interfaces/protekt/IShieldToken.sol";

contract ClaimsManagerCentralized {
	IShieldToken public shieldToken;
	address public governance;
	enum ClaimsStatus {
		Active,
		Investigating,
		ClaimAccepted
	}
	ClaimsStatus public status;
	uint256 public investigationPeriod; // One week (14 sec block times)
	uint256 public currentInvestigationPeriodEnd;
	bool public activePayoutEvent;

	// Events
	event ClaimInvestigationStarted(uint256 InvestigationPeriodEnd);
	event Payout();

    constructor() public {
    	investigationPeriod = 43200;
    	currentInvestigationPeriodEnd = 0;
    	activePayoutEvent = false;
    	governance = msg.sender;
    }

    function setShieldToken(address _shieldToken) public {
        require(msg.sender == governance, "!governance");
        shieldToken = IShieldToken(_shieldToken);
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function setInvestigationPeriodBlocks(uint256 _period) public {
        require(msg.sender == governance, "!governance");
        investigationPeriod = _period;
    }

    function checkPayoutEvent() public view returns (bool) {
    	return activePayoutEvent;
    }

	function submitClaim() external {
		require(status == ClaimsStatus.Active, "!Active");

		if(checkPayoutEvent()) {
			currentInvestigationPeriodEnd = block.number + investigationPeriod;
			status = ClaimsStatus.Investigating;
			emit ClaimInvestigationStarted(currentInvestigationPeriodEnd);
		}
	}

	function payoutClaim() external {
		require(status == ClaimsStatus.Investigating, "!Investigating");
		require(currentInvestigationPeriodEnd >= block.number, "!Done Investigating");
		require(checkPayoutEvent(), "!Payout Event");

		shieldToken.payout();
		status = ClaimsStatus.ClaimAccepted;
		emit Payout();
	}
}

