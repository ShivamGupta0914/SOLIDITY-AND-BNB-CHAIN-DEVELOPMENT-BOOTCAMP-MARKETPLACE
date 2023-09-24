// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
@title Staking Token Contract
@dev This contract implements a staking token that extends the ERC20 token standard and inherits from the Ownable contract provided by OpenZeppelin.
*/
contract RewardToken is ERC20, Ownable {
    constructor(uint256 amount) ERC20("RewardToken", "MTK") {
         _mint(msg.sender, amount);
    }
}