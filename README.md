# Stake And Earn
This Repo contains contracts which provides functionality for users to stake their assets and earn reward.

## Staking
Users can easily approve the contract ```StakingContract``` which will pull users asset into the contract using **stake** function.

## Withdraw
Users can anytime come and call **withdraw** function to get their assets back and earn the extra rewards.

# Rewards(Airdrop)

Users will have to go to ```Airdrop``` contract to claim their reward which will use merkle proof to check for valid users.

## Installation :-
*   Step 1: Run ```npm install```
*   Step 2: Run ```npx hardhat compile``` to compile contracts
*   Step 3: Run ```npx hardhat test``` to test the contracts

To deploy, take a look at .env.example file for private keys and all.
and run ```npx hardhat deploy --tags``` to deploy.