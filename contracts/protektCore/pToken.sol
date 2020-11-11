pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../../interfaces/compound/ComptrollerInterface.sol";

contract pToken is ERC20, ERC20Detailed {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    IERC20 public depositToken;

    address public feeModel;
    address public governance;

    address public constant compComptroller = address(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    address public constant comp = address(0xc00e94Cb662C3520282E6f5717214004A7f26888);
    address public constant cdai = address(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);

    event HarvestRewards(uint256 amount);

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
        require(msg.sender == governance, "!governance");

        // Claim COMP from comptroller
        ComptrollerInterface COMPtroller = ComptrollerInterface(compComptroller);
        COMPtroller.claimComp(address(this));

        // Transfer COMP to feeModel
        uint256 amount = IERC20(cdai).balanceOf(address(this));
        IERC20(cdai).safeTransfer(feeModel, amount);

        emit HarvestRewards(amount); 
    }

    // No rebalance implementation for lower fees and faster swaps
    function withdraw(uint256 _shares) public {
        uint256 r = (balance().mul(_shares)).div(totalSupply());
        _burn(msg.sender, _shares);

        depositToken.safeTransfer(msg.sender, r);
    }

    function getPricePerFullShare() public view returns (uint256) {
        return balance().mul(1e18).div(totalSupply());
    }
}
