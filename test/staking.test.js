const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

let rewardToken, hardhatToken, staking, airdrop;

describe("Staking Contract", function () {
  //fixture deploys the Staking Token contract and returns the contract, the factory, and the owner's address
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("StakingToken");
    const [owner] = await ethers.getSigners();
    hardhatToken = await Token.deploy("shivam", "SKY", 100000);
    await hardhatToken.deployed();
    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, owner };
  }

  //fixture deploys the Reward Token contract and returns the contract, the factory, and the owner's address
  async function deployRewardTokenFixture() {
    const TokenReward = await ethers.getContractFactory("RewardToken");
    const [RewardOwner] = await ethers.getSigners();
    rewardToken = await TokenReward.deploy(500000);
    await rewardToken.deployed();
    return { TokenReward, rewardToken, RewardOwner };
  }

  //fixture deploys the Staking Contract and returns the contract and the factory
  async function deployStakingFixture() {
    const Staking = await ethers.getContractFactory("StakingContract");
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = Math.floor(Date.now() / 1000) + 172800;
    staking = await upgrades.deployProxy(
      Staking,
      [startTime, endTime, rewardToken.address],
      {
        initializer: "initialize",
      }
    );
    await staking.deployed();
    //console.log("staking contract", staking.address);
    return { Staking, staking };
  }

  //fixture deploys the Airdrop contract and returns the contract and the factory
  async function deployAirdropFixture() {
    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(staking.address, 1000000, 100);
    await airdrop.deployed();
    return { Airdrop, airdrop };
  }

  it("Should assign the total supply of Staking Tokens to the owner", async function () {
    const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    let name = await hardhatToken.name();
    expect(await hardhatToken.name()).to.equal(name);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });

  //checks if the total supply of Staking Tokens is assigned to the owner
  it("Should assign the total supply of Reward tokens to the owner", async function () {
    const { rewardToken, RewardOwner } = await loadFixture(
      deployRewardTokenFixture
    );
    const ownerBalance = await rewardToken.balanceOf(RewardOwner.address);
    expect(await rewardToken.totalSupply()).to.equal(ownerBalance);
  });

  it("deploying staking contract", async function () {
    await loadFixture(deployStakingFixture);
  });

  //checks if the total supply of Reward Tokens is assigned to the owner
  it("Should assign the total supply of airdrop tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    const { airdrop } = await loadFixture(deployAirdropFixture);
    const ownerBalance = await airdrop.balanceOf(owner.address);
    expect(await airdrop.totalSupply()).to.equal(ownerBalance);
  });

  it("should name and symbol initialize correctly of airdrop token", async function () {
    const expectedName = "AirdropRewardToken";
    const expectedSymbol = "MTK";
    expect(await airdrop.name()).to.equal(expectedName);
    expect(await airdrop.symbol()).to.equal(expectedSymbol);
  });

  it("token should be added in whitelist token", async function () {
    await staking.addWhitelistToken(hardhatToken.address);
    const expected = true;
    expect(await staking.isWhitelistedToken(hardhatToken.address)).to.equal(
      expected
    );
  });

  it("only owner should add token in white list", async function () {
    const [owner, addr1] = await ethers.getSigners();
    await expect(
      staking.connect(addr1).addWhitelistToken(hardhatToken.address)
    ).to.be.revertedWith(
      "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("Whitelisted element can be removed by owner", async function () {
    //add token
    await staking.addWhitelistToken(rewardToken.address);
    const expected = true;
    //check for existance
    expect(await staking.isWhitelistedToken(rewardToken.address)).to.equal(
      expected
    );
    //remove token
    const output = false;
    await staking.removeWhitelistToken(rewardToken.address);
    expect(await staking.isWhitelistedToken(rewardToken.address)).to.equal(
      output
    );
  });

  it("should reverted if user not remove element", async function () {
    const [owner, addr1] = await ethers.getSigners();
    //add token
    await staking.addWhitelistToken(rewardToken.address);
    const expected = true;
    //check for existance
    expect(await staking.isWhitelistedToken(rewardToken.address)).to.equal(
      expected
    );
  });

  it("should revert if staking amount less than zero", async function () {
    await hardhatToken.approve(staking.address, 100000);
    await expect(staking.stake(hardhatToken.address, 0)).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("should revert if transfer failed", async function () {
    await hardhatToken.approve(staking.address, 100000);
    await expect(
      staking.stake(hardhatToken.address, 1000000)
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("user should able to stake only whitelisted token", async function () {
    await hardhatToken.approve(staking.address, 100000);
    await staking.stake(hardhatToken.address, 50);
    expect(await hardhatToken.balanceOf(staking.address)).to.equal(50);
  });

  it("should emit event of staking", async function () {
    const [owner] = await ethers.getSigners();
    await expect(staking.stake(hardhatToken.address, 50))
      .to.emit(staking, "Staked")
      .withArgs(owner.address, hardhatToken.address, 50);
  });

  it("user should successfully added as a whitelisted user", async function () {
    const [owner] = await ethers.getSigners();
    expect(await staking.isWhitelistedUser(owner.address)).to.equal(true);
  });

  it("should assign the user balance in staking record", async function () {
    const [owner] = await ethers.getSigners();
    const expected = 100;
    expect(
      await staking.balanceOf(owner.address, hardhatToken.address)
    ).to.equal(expected);
  });

  it("should revert user withdraw non whitelisted token", async function () {
    await expect(staking.withdraw(airdrop.address, 5)).to.be.revertedWith(
      "Token is not whitelisted"
    );
  });

  it("should revert user withdraw amount less than zero", async function () {
    await expect(staking.withdraw(hardhatToken.address, 0)).to.be.revertedWith(
      "amount must be greater than zero"
    );
  });

  it("should revert user withdraw greater amount of token", async function () {
    await expect(
      staking.withdraw(hardhatToken.address, 200)
    ).to.be.revertedWith("Insufficient balance");
  });

  it("user should able to withdraw deposit token", async function () {
    const [owner] = await ethers.getSigners();
    await expect(staking.withdraw(hardhatToken.address, 60))
      .to.emit(staking, "Withdrawn")
      .withArgs(owner.address, hardhatToken.address, 60);
    expect(await hardhatToken.balanceOf(staking.address)).to.equal(40);
  });

  it("user should able to get reward after withdraw", async function () {
    const [owner] = await ethers.getSigners();
    await rewardToken.approve(staking.address, 50000);
    await expect(staking.getReward())
      .to.emit(staking, "RewardPaid")
      .withArgs(owner.address);
    expect(await rewardToken.balanceOf(staking.address)).to.equal(0);
  });

  it("should revert if it call before completion of staking period", async function () {
    await expect(staking.blockNumberAtEndTimestamp()).to.be.revertedWith(
      "either staking duration not completed or function already call"
    );
  });
  it("should set the last block number at time of endTimestamp", async function () {
    let endTime = await staking.endTimestamp;
    //advance time by one hour and mine a new block
    await helpers.time.increase(172800);
    await staking.blockNumberAtEndTimestamp();
    let val = await staking.blockAtEndTimestamp();
    expect(await staking.blockAtEndTimestamp()).to.equal(val);
  });

  it("Reward update after staking period over", async function () {
    //await staking.withdraw(hardhatToken.address, 10);
    const [owner] = await ethers.getSigners();
    await expect(staking.withdraw(hardhatToken.address, 10))
      .to.emit(staking, "Withdrawn")
      .withArgs(owner.address, hardhatToken.address, 10);
    expect(await hardhatToken.balanceOf(staking.address)).to.equal(30);
  });

  it("user to claim their airdrop reward", async function () {
    const [owner] = await ethers.getSigners();
    await airdrop.claimReward(owner.address);
    expect(await airdrop.claimed(owner.address)).to.equal(true);
  });

  it("should revert if user claimed already", async function () {
    const [owner] = await ethers.getSigners();
    await expect(airdrop.claimReward(owner.address)).to.be.revertedWith(
      "Airdrop: Reward already claimed"
    );
  });

  it("whitelisted user should claimed airdrop reward", async function () {
    const [owner] = await ethers.getSigners();
    await airdrop.approve(airdrop.address, 100000);
    await airdrop.getReward(owner.address);
    expect(await airdrop.balanceOf(owner.address)).to.equal(1000000);
  });
});
