pragma solidity ^0.5.16;

import "./LibraryLockDataLayout.sol";

contact ERC20DataLayout is LibraryLockDataLayout {
  uint256 public totalSupply;
  mapping(address=>uint256) public tokens;
}