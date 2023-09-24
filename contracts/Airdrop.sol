// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./Istaking.sol";

/**
@title Airdrop
@dev A contract for distributing airdrop rewards to whitelisted users who participated in a staking contract.
*/
contract Airdrop is ERC20, Ownable {

    // address of the staking contract
    Istaking public stakingContractAddress; 

    //The amount of airdrop reward to be distributed to each user
    uint256 public airdropReward;

    //A mapping to keep track of which users have already claimed their 
    mapping(address => bool) public claimed;


    event AirdropPaid(address indexed user);
    event UserClaimed(address indexed user);

    /**
    @dev Constructor function for the Airdrop contract
    @param _stakingContractAddress The address of the staking contract
    @param _totalSupply The total supply of the Airdrop token
    @param _airdropReward The amount of airdrop reward to be distributed to each user
    */
    constructor(Istaking _stakingContractAddress, uint256 _totalSupply, uint256 _airdropReward) ERC20("AirdropRewardToken", "MTK"){
        stakingContractAddress = _stakingContractAddress;
        airdropReward = _airdropReward;
        _mint(msg.sender, _totalSupply);
    }

    /**
    @dev Allows a user to claim their airdrop reward if they are whitelisted and the staking period has ended.
    @param _user The address of the user claiming the reward
    */
    function claimReward(address _user) public {
        require(block.timestamp > stakingContractAddress.getEndTimestamp(), "Staking period not ended yet");
        require(!claimed[msg.sender], "Airdrop: Reward already claimed");
        require(stakingContractAddress.isWhitelistedUser(_user), "Airdrop: Invalid proof"); 
        claimed[msg.sender] = true;
        emit UserClaimed(_user);
    } 

    /**
    @dev Allows a user to withdraw their claimed airdrop reward.
    @param user The address of the user withdrawing the reward
    */      
    function getReward(address user) external {

        require(claimed[user], "Airdrop: no reward to withdraw");

           // Transfer Airdrop_reward tokens to user
            require(
                IERC20Upgradeable(address(this)).transferFrom(
                    msg.sender,
                    user,
                    airdropReward
                ),
                "Failed to transfer reward tokens"
            );
            emit AirdropPaid(user);
        }
}
    