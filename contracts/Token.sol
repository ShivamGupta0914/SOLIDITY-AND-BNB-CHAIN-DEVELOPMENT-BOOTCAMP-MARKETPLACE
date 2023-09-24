// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
@title Staking Token Contract
@dev This contract implements a staking token that extends the ERC20 token standard and inherits from the Ownable contract provided by OpenZeppelin.
*/
contract StakingToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialAmount) ERC20(name, symbol) {
        _mint(msg.sender, initialAmount);
    }
}