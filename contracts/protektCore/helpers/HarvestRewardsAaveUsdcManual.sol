pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @dev Extension of pToken that specifies how rewards are collected for
 * the Aave-USDC and sent to referralToken. 
 */
contract HarvestRewardsAaveUsdcManual {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event HarvestRewards(uint256 amount);

    /**
     * @dev Collects rewards from deposited tokens and sends to the referralToken
     */
    function harvestRewards(IERC20 depositToken, uint256 _balanceLastHarvest, address referralTokenAddress) public {
      uint256 interest = depositToken.balanceOf(address(this)).sub(_balanceLastHarvest);        
      uint256 referralInterest = interest.mul(20).div(100);
      uint256 keepInterest = interest.sub(referralInterest);

      if(referralInterest > 0) {
        IERC20(depositToken).safeTransfer(referralTokenAddress, referralInterest);
      }

      emit HarvestRewards(interest);
    }
}