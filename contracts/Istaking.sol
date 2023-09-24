// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Interface of the staking contract.
 */
interface Istaking {
   function isWhitelistedUser(address user) external view returns (bool);
   function getEndTimestamp() external view returns (uint256);
}