pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../../interfaces/compound/ComptrollerInterface.sol";

/**
 * @dev Extension of pToken that specifies how rewards are collected for
 * the Compound-DAI Manual Liability Market. 
 */
contract HarvestRewardsAaveUsdcManual {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public referralToken;

    IERC20 public depositToken;
    uint256 public totalDeposits;
    mapping(address => uint256) public deposits;

    event HarvestRewards(uint256 amount);

    /**
     * @dev Collects rewards from deposited tokens and sends to the referralToken
     */
    function harvestRewards() public {
      uint256 interest = IERC20(depositToken).balanceOf(address(this)) - totalDeposits;
      uint256 referralInterest = interest.mul(18).div(100);
      uint256 keepInterest = interest.sub(referralInterest);

      totalDeposits = totalDeposits.add(keepInterest);

      IERC20(depositToken).safeTransfer(referralToken, referralInterest);

      emit HarvestRewards(interest);
    }
}