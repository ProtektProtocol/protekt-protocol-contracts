pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../../interfaces/aave/ILendingPool.sol";

/**
 * @dev Extension of pToken that specifies how rewards are collected for
 * the Aave-USDC and sent to referralToken. 
 */
contract HarvestRewardsAaveUsdcManual {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Kovan
    address public constant lendingPoolAddress = address(0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe);
    address public constant usdcTokenAddress = address(0xe22da380ee6B445bb8273C81944ADEB6E8450422);

    // Mainnet
    // address public constant lendingPoolAddress = address(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // address public constant usdcTokenAddress = address(0xe22da380ee6b445bb8273c81944adeb6e8450422);

    event HarvestRewards(uint256 amount);

    /**
     * @dev Collects rewards from deposited tokens and sends to the referralToken
     */
    function harvestRewards(IERC20 depositToken, uint256 _balanceLastHarvest, address referralTokenAddress) public {
      uint256 interest = depositToken.balanceOf(address(this)).sub(_balanceLastHarvest);        
      uint256 referralInterest = interest.mul(20).div(100);
      uint256 keepInterest = interest.sub(referralInterest);

      if(referralInterest > 0) {
        depositToken.safeTransfer(referralTokenAddress, referralInterest);
      }

      emit HarvestRewards(interest);
    }

    /**
     * @dev Deposits coreTokens into Aave and returns underlyingTokens
     */
    function depositCoreTokens(uint256 _amount, address depositor) public returns (uint256) {
      // LendingPool.deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
      ILendingPool(lendingPoolAddress).deposit(usdcTokenAddress, _amount, depositor, 0);

      return _amount;
    }
}