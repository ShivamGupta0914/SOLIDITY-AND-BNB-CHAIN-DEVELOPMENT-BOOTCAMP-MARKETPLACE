module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // deploy reward token
  const rewardToken = await deploy("RewardToken", {
    from: deployer,
    args: [10000],
    log: true,
  });

  // deploy staking token
  const stakingToken = await deploy("StakingToken", {
    from: deployer,
    args: ["StakingToken", "STN", 10000],
    log: true,
  });

  // deploy upgradable staking pool contract
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = Math.floor(Date.now() / 1000) + 172800;

  const StakingContract = await deploy("StakingContract", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "initialize",
        args: [startTime, endTime, rewardToken.address],
      },
      upgradeIndex: 0,
    },
  });

  const airdropToken = await deploy("Airdrop", {
    from: deployer,
    args: [StakingContract.address, 1000000, 100],
    log: true,
  });
};

module.exports.tags = [
  "RewardToken",
  "StakingToken",
  "StakingContract",
  "airdropToken",
];
