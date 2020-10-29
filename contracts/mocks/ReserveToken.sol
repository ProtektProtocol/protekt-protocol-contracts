// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract ReserveToken is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("ReserveToken", "TESTR", 18) {
        _mint(msg.sender, 100000 * 10**18);
    }
}
