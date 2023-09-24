require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-deploy");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  namedAccounts: {
    deployer: {
      default: 0, // ethers built in account at index 0
    },
  },
  networks: {
    bsctestnet: {
      url: process.env.BSC_ARCHIVE_NODE_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
      },
    },
  },
  etherscan: {
    apiKey: process.env.BSC_API_KEY
  }
};
