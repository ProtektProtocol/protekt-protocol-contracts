pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./helpers/HarvestRewardsCompoundDaiManual.sol";

contract pToken is
    ERC20,
    ERC20Detailed,
    HarvestRewardsCompoundDaiManual {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;

    address public feeModel;
    address public governance;

    constructor(address _depositToken, address _feeModel)
        public
        ERC20Detailed(
            string(abi.encodePacked("protekt ", ERC20Detailed(_depositToken).name())),
            string(abi.encodePacked("p", ERC20Detailed(_depositToken).symbol())),
            ERC20Detailed(_depositToken).decimals()
        )
    {
        depositToken = IERC20(_depositToken);
        feeModel = _feeModel;
        governance = msg.sender;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function setFeeModel(address _feeModel) public {
        require(msg.sender == governance, "!governance");
        feeModel = _feeModel;
    }

    function depositAll() external {
        deposit(depositToken.balanceOf(msg.sender));
    }

    function deposit(uint256 _amount) public {
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
        _mint(msg.sender, shares);
    }

    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    function harvestRewards() public {
        super.harvestRewards();
    }

    function withdraw(uint256 _shares) public {
        // Rewards are harvested for the current block before withdrawal
        harvestRewards();

        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);

        depositToken.safeTransfer(msg.sender, r);
    }

    // Returns depositTokens per share price
    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }
}
