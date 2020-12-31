pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../../interfaces/compound/ComptrollerInterface.sol";

/**
 * @dev Extension of pToken that specifies how rewards are collected for
 * the Compound-DAI Manual Liability Market. 
 */
contract HarvestRewardsCompoundDaiManual {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public feeModel;

    address public constant compComptroller = address(0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b);
    address public constant comp = address(0xc00e94cb662c3520282e6f5717214004a7f26888);

    event HarvestRewards(uint256 amount);

    /**
     * @dev Collects rewards from deposited tokens and sends to the feeModel
     */
    function harvestRewards() public {
        // Claim COMP from comptroller
        ComptrollerInterface COMPtroller = ComptrollerInterface(compComptroller);
        COMPtroller.claimComp(address(this));

        // Transfer COMP to feeModel
        uint256 amount = IERC20(comp).balanceOf(address(this));
        IERC20(comp).safeTransfer(feeModel, amount);

        // emit HarvestRewards(amount);
        emit HarvestRewards(0);
    }
}