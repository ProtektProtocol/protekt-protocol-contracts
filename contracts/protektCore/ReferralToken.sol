pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./interfaces/IProtektToken.sol";
import "../utils/Pausable.sol";


contract ReferralToken is ERC20, ERC20Detailed, Pausable {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;
    IProtektToken public protektToken;

    address public governance;

    mapping(address => uint256) public refererBalances;
    mapping(address => address) public referers;

    constructor(address _protektToken, address _depositToken)
        public
        ERC20Detailed(
            string(abi.encodePacked("referralInt ", ERC20Detailed(_depositToken).name())),
            string(abi.encodePacked("ri", ERC20Detailed(_depositToken).symbol())),
            ERC20Detailed(_depositToken).decimals()
        )
    {
        protektToken = IProtektToken(_protektToken);
        depositToken = IERC20(_depositToken);
        governance = msg.sender;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }

    function setProtektToken(address _protektToken) public {
        require(msg.sender == governance, "!governance");
        protektToken = IProtektToken(_protektToken);
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function depositPrincipal(uint256 depositAmount, address referer, address depositor) external {
        require(msg.sender == address(protektToken), "!protektToken");
        
        // Calculate how many shares to mint for the referer
        uint256 mintRefererShares = depositAmount.mul(totalSupply()).div(protektToken.balance());

        _mint(referer, mintRefererShares);

        if(referers[depositor] == address(0x0)) {
            referers[depositor] = referer;
        } else {
            referer = referers[depositor];
        }
        refererBalances[referer] = refererBalances[referer].add(depositAmount);
    }

    function withdrawPrincipal(uint256 withdrawAmount, address withdrawer) external {
        require(msg.sender == address(protektToken), "!protektToken");
        address referer = referers[withdrawer];

        // Removes referer shares proportional to the totalSupply()
        uint256 burnRefererShares = withdrawAmount.mul(totalSupply()).div(protektToken.balance());

        _burn(referer, burnRefererShares);

        refererBalances[referer] = refererBalances[referer].sub(withdrawAmount);
    }

    // No rebalance implementation for lower fees and faster swaps
    // function withdraw(uint256 _shares) public whenNotPaused {
    //     uint256 r = (balance().mul(_shares)).div(totalSupply());
    //     _burn(msg.sender, _shares);

    //     // Check balance
    //     uint256 b = depositToken.balanceOf(address(this));
    //     if (b < r) {
    //         uint256 _withdraw = r.sub(b);
    //         IController(controller).withdraw(address(depositToken), _withdraw);
    //         uint256 _after = depositToken.balanceOf(address(this));
    //         uint256 _diff = _after.sub(b);
    //         if (_diff < _withdraw) {
    //             r = b.add(_diff);
    //         }
    //     }

    //     depositToken.safeTransfer(msg.sender, r);
    // }

    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }

    function pause() external {
        require(msg.sender == governance, "!governance");
        _pause();
    }

    function unpause() external {
        require(msg.sender == governance, "!governance");
        _unpause();
    }
}