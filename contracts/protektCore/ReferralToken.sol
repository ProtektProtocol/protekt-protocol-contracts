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


    uint256 public cummulativeBlockValue;
    uint256 public lastBlock;
    uint256 public lastBlockTotalValue;
    mapping(address => uint256) public refererLastBlock;
    mapping(address => uint256) public refererLastBlockValue;
    mapping(address => uint256) public refererCurrentBookValue;

    mapping(address => address) public getRefererForUser;

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
        cummulativeBlockValue = 0;
        lastBlock = block.number;
        lastBlockTotalValue = 0;
        governance = msg.sender;
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

    function newBlocks() public view returns (uint256) {
        uint256 currentBlock = block.number;
        return currentBlock.sub(lastBlock);
    }

    function newBlocks(uint256 blockNum) public view returns (uint256) {
        uint256 currentBlock = block.number;
        return currentBlock.sub(blockNum);
    }

    function newBlocks(uint256 startBlockNum, uint256 endBlockNum) public view returns (uint256) {
        if(endBlockNum >= startBlockNum) {
            return endBlockNum.sub(startBlockNum);            
        }
        return 0;
    }

    function balance() public view returns (uint256) {
        return depositToken.balanceOf(address(this));
    }

    function totalSupply() public view returns (uint256) {
        return cummulativeBlockValue;
    }

    function balanceOf(address account) public view returns (uint256) {
        return refererLastBlockValue[account].add(newBlocks(refererLastBlock[account], lastBlock).mul(refererCurrentBookValue[account]));
    }

    function underlyingBalanceOf(address account) public view returns (uint256) {
        if(totalSupply() == 0) {
            return 0;
        } else {
            return balanceOf(account).mul(balance()).div(totalSupply());            
        }
    }

    function depositPrincipal(uint256 depositAmount, address referer, address depositor) external {
        require(msg.sender == address(protektToken), "!protektToken");
        // Assumes harvestRewards() just ran

        if(getRefererForUser[depositor] == address(0x0)) {
            getRefererForUser[depositor] = referer;
        } else {
            referer = getRefererForUser[depositor];
        }
        
        // Update saved stats
        updateStats(referer);

        // Adjust refererCurrentBookValue
        refererCurrentBookValue[referer] = refererCurrentBookValue[referer].add(depositAmount);
    }

    function withdrawPrincipal(uint256 withdrawAmount, address withdrawer) external {
        require(msg.sender == address(protektToken), "!protektToken");
        address referer = getRefererForUser[withdrawer];

        // Update saved stats
        updateStats(referer);

        // Adjust refererCurrentBookValue
        refererCurrentBookValue[referer] = refererCurrentBookValue[referer].sub(withdrawAmount);
    }

    function updateStats(address referer) internal {
        // 1) Calculate the block value since last deposit/withdraw
        uint256 _newBlocks = newBlocks();
        uint256 newBlockValue = lastBlockTotalValue.mul(_newBlocks);
        cummulativeBlockValue = cummulativeBlockValue.add(newBlockValue);
        lastBlockTotalValue = protektToken.balance();
        lastBlock = block.number;

        // 2) Benchmark referer
        uint256 recentRefererBlockValue = refererCurrentBookValue[referer].mul(newBlocks(refererLastBlock[referer]));
        refererLastBlockValue[referer] = refererLastBlockValue[referer].add(recentRefererBlockValue);
        refererLastBlock[referer] = block.number;
    }

    function getRefererLastBlock(address referer) public view returns (uint256) {
        return refererLastBlock[referer];
    }

    function returnRefererForUser(address user) public view returns (address) {
        return getRefererForUser[user];
    }

    function withdraw(uint256 _shares) public whenNotPaused {
        require(msg.sender == address(governance), "!governance");

        // uint256 r = (balance().mul(_shares)).div(totalSupply());
        // _burn(msg.sender, _shares);

        // Check balance
        // uint256 b = depositToken.balanceOf(address(this));
        // if (b < r) {
        //     uint256 _withdraw = r.sub(b);
        //     IController(controller).withdraw(address(depositToken), _withdraw);
        //     uint256 _after = depositToken.balanceOf(address(this));
        //     uint256 _diff = _after.sub(b);
        //     if (_diff < _withdraw) {
        //         r = b.add(_diff);
        //     }
        // }

        // depositToken.safeTransfer(msg.sender, r);
    }

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