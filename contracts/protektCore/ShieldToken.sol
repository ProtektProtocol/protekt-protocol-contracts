pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../../interfaces/yearn/IController.sol";
import "../claimsManagers/interfaces/IClaimsManagerCore.sol";
import "../protektCore/interfaces/IProtektToken.sol";
import "../utils/Pausable.sol";


contract ShieldToken is 
    ERC20, 
    ERC20Detailed, 
    Pausable,
    ReentrancyGuard 
{
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;
    IProtektToken public protektToken;

    uint256 public min = 9500;
    uint256 public constant max = 10000;

    address public governance;
    address public controller;
    IClaimsManagerCore public claimsManager;

    bool public isCapped;
    uint256 public maxDeposit;

    constructor(address _protektToken, address _depositToken, address _controller, address _claimsManager)
        public
        ERC20Detailed(
            string(abi.encodePacked("shield ", ERC20Detailed(_protektToken).name())),
            string(abi.encodePacked("sh", ERC20Detailed(_protektToken).symbol())),
            ERC20Detailed(_depositToken).decimals()
        )
        ReentrancyGuard()
    {
        protektToken = IProtektToken(_protektToken);
        depositToken = IERC20(_depositToken);
        controller = _controller;
        claimsManager = IClaimsManagerCore(_claimsManager);
        governance = msg.sender;
        isCapped = false;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this)).add(depositToken.balanceOf(address(controller)));
    }

    function setMin(uint256 _min) external {
        require(msg.sender == governance, "!governance");
        min = _min;
    }

    function setProtektToken(address _protektToken) public {
        require(msg.sender == governance, "!governance");
        protektToken = IProtektToken(_protektToken);
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function setController(address _controller) public {
        require(msg.sender == governance, "!governance");
        controller = _controller;
    }

    function depositAll() external {
        deposit(depositToken.balanceOf(msg.sender));
    }

    function deposit(uint256 _amount) nonReentrant() public {
        uint256 _pool = balance();
        uint256 _before = depositToken.balanceOf(address(this));
        if(isCapped){
            require((_before + _amount) <= maxDeposit,"Cap exceeded");
        }
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

    // No rebalance implementation for lower fees and faster swaps
    function withdraw(uint256 _shares) nonReentrant() public whenNotPaused {
        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);

        // Check balance
        uint256 b = depositToken.balanceOf(address(this));
        if (b < r) {
            uint256 _withdraw = r.sub(b);
            IController(controller).withdraw(address(depositToken), _withdraw);
            uint256 _after = depositToken.balanceOf(address(this));
            uint256 _diff = _after.sub(b);
            if (_diff < _withdraw) {
                r = b.add(_diff);
            }
        }

        depositToken.safeTransfer(msg.sender, r);
    }

    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }

    function payout() external returns (uint256) {
        require(msg.sender == address(claimsManager), "!claimsManager");

        uint256 amount = depositToken.balanceOf(address(this));
        depositToken.safeTransfer(protektToken.feeModel(), amount);

        return amount;
    }

    function pause() external {
        require(msg.sender == governance, "!governance");
        _pause();
    }

    function unpause() external {
        require(msg.sender == governance, "!governance");
        _unpause();
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

    // Custom logic in here for how much the vault allows to be borrowed
    // Sets minimum required on-hand to keep small withdrawals cheap
    // function available() public view returns (uint256) {
    //     return 0;
    // }

    // Used to swap any borrowed reserve over the debt limit to liquidate to 'depositToken'
    // function harvest(address reserve, uint256 amount) external {
    //     require(msg.sender == controller, "!controller");
    //     require(reserve != address(depositToken), "depositToken");
        // IERC20(reserve).safeTransfer(controller, amount);
    // }

    // function earn() public {
        // require(msg.sender == governance, "!governance");
        // uint256 _bal = available();
        // depositToken.safeTransfer(controller, _bal);
        // IController(controller).earn(address(depositToken), _bal);
    // }

}