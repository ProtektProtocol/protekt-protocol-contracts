pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./helpers/HarvestRewardsAaveUsdcManual.sol";
import "../claimsManagers/interfaces/IClaimsManagerCore.sol";

contract pTokenAave is
    ERC20,
    ERC20Detailed,
    HarvestRewardsAaveUsdcManual
{
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;
    address public shieldTokenAddress;

    address public feeModel;
    address public governance;
    IClaimsManagerCore public claimsManager;
    bool public isCapped;
    uint256 public maxDeposit;

    uint256 public balanceLastHarvest;

    constructor(address _depositToken, address _feeModel, address _claimsManager)
        public
        ERC20Detailed(
            string(abi.encodePacked("protekt ", ERC20Detailed(_depositToken).name())),
            string(abi.encodePacked("p", ERC20Detailed(_depositToken).symbol())),
            ERC20Detailed(_depositToken).decimals()
        )
    {
        depositToken = IERC20(_depositToken);
        feeModel = _feeModel;
        claimsManager = IClaimsManagerCore(_claimsManager);
        governance = msg.sender;
        isCapped = false;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }
    
    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function setShieldToken(address _shieldTokenAddress) public {
        require(msg.sender == governance, "!governance");
        shieldTokenAddress = _shieldTokenAddress;
    }

    function depositCoreTokens(uint256 _amount) public {
        // Rewards are harvested for the current block before deposit
        harvestRewards();

        // Store balance before deposit
        uint256 _before = depositToken.balanceOf(address(this));

        // Deposit coreTokens into Aave and then deposit underlyingTokens into pToken
        super.depositCoreTokens(_amount, msg.sender);

        _handleDeposit(_amount, msg.sender, _before);
    }

    function depositAll() external {
        deposit(depositToken.balanceOf(msg.sender));
    }

    function deposit(uint256 _amount) public {
        // Rewards are harvested for the current block before deposit
        harvestRewards();

        // Store balance before deposit
        uint256 _before = depositToken.balanceOf(address(this));
        depositToken.safeTransferFrom(msg.sender, address(this), _amount);

        _handleDeposit(_amount, msg.sender, _before);
    }

    function _handleDeposit(uint256 _amount, address depositor, uint256 _before) internal {
        require(claimsManager.isReady(),'!Ready');
        if(isCapped){
            require((_before + _amount) <= maxDeposit, "Cap exceeded");
        }

        uint256 _after = depositToken.balanceOf(address(this));
        _amount = _after.sub(_before);
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount.mul(totalSupply())).div(_before);
        }
        _mint(depositor, shares);
        balanceLastHarvest = balance();
    }

    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    function harvestRewards() public {
        super.harvestRewards(depositToken, shieldTokenAddress, balanceLastHarvest);
    }

    function withdraw(uint256 _shares) public {
        // Rewards are harvested for the current block before withdrawal
        harvestRewards();

        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);

        depositToken.safeTransfer(msg.sender, r);
        balanceLastHarvest = balance();
    }

    // Returns depositTokens per share price
    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }


    // cap contract at a set amount
    function capDeposits(uint _amount) external {
        require(msg.sender == governance, "!governance");
        // uint256 _currentBalance = depositToken.balanceOf(address(this));
        // require(_amount < _currentBalance, "Cap exceeds current balance");
        isCapped = true;
        maxDeposit = _amount;
    }

    // uncap contract
    function uncapDeposits() external {
        require(msg.sender == governance, "!governance");
        isCapped = false;
    }

}