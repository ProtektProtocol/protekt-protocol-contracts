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

    // Mainnet
    // address public constant compComptroller = address(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    // address public constant comp = address(0xc00e94Cb662C3520282E6f5717214004A7f26888);

    // Kovan
    address public constant compComptroller = address(0x5eAe89DC1C671724A672ff0630122ee834098657);
    address public constant comp = address(0x61460874a7196d6a22D1eE4922473664b3E95270);

    event HarvestRewards(uint256 amount);

    /**
     * @dev Collects rewards from deposited tokens and sends to the feeModel
     */
    function harvestRewards() public {
        //Claim COMP from comptroller
        ComptrollerInterface COMPtroller = ComptrollerInterface(compComptroller);
        COMPtroller.claimComp(address(this));

        // Transfer COMP to feeModel
        uint256 amount = IERC20(comp).balanceOf(address(this));
        IERC20(comp).safeTransfer(feeModel, amount);

        emit HarvestRewards(amount);
        // emit HarvestRewards(0);
    }
}