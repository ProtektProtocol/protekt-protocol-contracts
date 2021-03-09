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

    uint256 public balanceLastHarvest;
    mapping(address => uint256) public deposits;

    constructor(address _depositToken)
        public
        ERC20Detailed(
            string(abi.encodePacked("protekt ", ERC20Detailed(_depositToken).name())),
            string(abi.encodePacked("p", ERC20Detailed(_depositToken).symbol())),
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

    function depositCoreTokens(uint256 _amount, address depositor, address referer) public {
        // Rewards are harvested for the current block before deposit
        harvestRewards(depositToken, balanceLastHarvest, address(referralToken));

        uint256 _before = depositToken.balanceOf(address(this));
        // Deposit coreTokens into Aave and then deposit underlyingTokens into pToken
        super.depositCoreTokens(_amount, msg.sender);

        _deposit(_amount, depositor, referer, _before);
    }

    function deposit(uint256 _amount, address depositor, address referer) public {
        // Rewards are harvested for the current block before deposit
        harvestRewards(depositToken, balanceLastHarvest, address(referralToken));

        uint256 _before = depositToken.balanceOf(address(this));
        depositToken.safeTransferFrom(msg.sender, address(this), _amount);

        _deposit(_amount, depositor, referer, _before); 
    }

    function _deposit(uint256 _amount, address depositor, address referer, uint256 _before) internal {        
        uint256 _after = depositToken.balanceOf(address(this));
        _amount = _after.sub(_before); // Additional check for deflationary depositTokens
        uint256 shares = 0;

        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount.mul(totalSupply())).div(_before);
        }

        _mint(depositor, shares);

        referralToken.depositPrincipal(_amount, referer, depositor);
        balanceLastHarvest = balance();
    }

    function withdraw(uint256 _shares) public {
        require(_shares <= balanceOf(msg.sender), "ERC20: burn amount exceeds balance");

        // Rewards are harvested for the current block before withdrawal
        harvestRewards(depositToken, balanceLastHarvest, address(referralToken));

        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);
        depositToken.safeTransfer(msg.sender, r);

        referralToken.withdrawPrincipal(r, msg.sender);
        balanceLastHarvest = balance();
    }

    // Returns depositTokens per share price
    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }

    function harvestRewards(IERC20 _depositToken, uint256 _balanceLastHarvest, address _referralTokenAddress) public {
        super.harvestRewards(_depositToken, _balanceLastHarvest, _referralTokenAddress);
    }
}
