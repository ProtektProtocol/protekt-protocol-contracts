pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../proxy/LibraryLock.sol";
import "../proxy/ERC20DataLayout.sol";
import "../proxy/Proxiable.sol";

//https://github.com/paxthemax/universal-upgradeable-contracts-example/blob/master/contracts/example/ExampleIncrementer.sol


contract PtkToken is ERC20DataLayout, ERC20,  Proxiable, LibraryLock {


    function constructor1(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        tokens[msg.sender] = _initialSupply;
        initialize();
        governance = msg.sender;
    }

    function updateCode(address newCode) public  delegatedOnly  {
        require(msg.sender == governance, "!governance");
        Proxiable.updateCodeAddress(newCode);
    }

    function transfer(address to, uint256 amount) public delegatedOnly {
        ERC20.transfer(to, amount);
    }
}