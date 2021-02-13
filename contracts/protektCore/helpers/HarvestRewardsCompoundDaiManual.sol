pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../../interfaces/compound/ComptrollerInterface.sol";
import "../../../interfaces/compound/cToken.sol";

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
    // address public constant cDaiTokenAddress = address(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643); 
    // address public constant daiTokenAddress = address(0x6B175474E89094C44Da98b954EedeAC495271d0F); 

    // Kovan
    address public constant compComptroller = address(0x5eAe89DC1C671724A672ff0630122ee834098657);
    address public constant comp = address(0x61460874a7196d6a22D1eE4922473664b3E95270);
    address public constant cDaiTokenAddress = address(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643); 
    address public constant daiTokenAddress = address(0xC4375B7De8af5a38a93548eb8453a498222C4fF2);

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

    /**
     * @dev Deposits coreTokens into Compound and returns underlyingTokens
     */
    function depositCoreTokens(uint256 _amount, address depositor) public returns (uint256) {
        
        // Bring in amount from depositer
        IERC20(daiTokenAddress).safeTransferFrom(depositor, address(this), _amount);

        // Give approval to cDai to deposit the tokens
        IERC20(daiTokenAddress).safeApprove(cDaiTokenAddress, _amount);

        // deposit to the address
        assert(cToken(cDaiTokenAddress).mint(_amount) == 0);

        // get balance after deposit
        uint256 _after = IERC20(cDaiTokenAddress).balanceOf(address(this));

        // return it
        return _after;
    }
}