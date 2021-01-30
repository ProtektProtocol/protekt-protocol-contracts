pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./helpers/HarvestRewardsAaveUsdcManual.sol";
import "./interfaces/IReferralToken.sol";

contract pTokenAave is
    ERC20,
    ERC20Detailed,
    HarvestRewardsAaveUsdcManual {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;
    IReferralToken public referralToken;

    address public governance;

    uint256 public totalDeposits;
    mapping(address => uint256) public deposits;

    constructor(address _depositToken)
        public
        ERC20Detailed(
            string(abi.encodePacked("Welcome ", ERC20Detailed(_depositToken).name())),
            string(abi.encodePacked("w", ERC20Detailed(_depositToken).symbol())),
            ERC20Detailed(_depositToken).decimals()
        )
    {
        depositToken = IERC20(_depositToken);
        governance = msg.sender;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }
    
    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function setReferralToken(address _referralToken) public {
        require(msg.sender == governance, "!governance");
        referralToken = IReferralToken(_referralToken);
    }

    function deposit(uint256 _amount, address referer) public {
        harvestRewards();

        uint256 _pool = balance();
        uint256 _before = depositToken.balanceOf(address(this));
        depositToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 _after = depositToken.balanceOf(address(this));
        _amount = _after.sub(_before); // Additional check for deflationary depositTokens
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount.mul(totalSupply())).div(_pool);
        }

        totalDeposits = totalDeposits.add(_amount);
        deposits[msg.sender] = deposits[msg.sender].add(_amount);
        referralToken.depositPrincipal(_amount, referer, msg.sender);

        _mint(msg.sender, shares);
    }

    function withdraw(uint256 _shares) public {
        require(balanceOf(msg.sender) <= _shares, "ERC20: burn amount exceeds balance");

        // Rewards are harvested for the current block before withdrawal
        harvestRewards();

        uint256 r = (balance().mul(_shares)).div(totalSupply());

        totalDeposits = totalDeposits.sub(r);
        deposits[msg.sender] = deposits[msg.sender].sub(r);
        referralToken.withdrawPrincipal(r, msg.sender);

        _burn(msg.sender, _shares);

        depositToken.safeTransfer(msg.sender, r);
    }

    // Returns depositTokens per share price
    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }

    function harvestRewards() public {
        super.harvestRewards();
    }
}
