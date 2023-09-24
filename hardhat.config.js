require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.19",
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
      apiKey: "Z1NGNIDYG42JMMSBWCC6V3G19EXBZSWFNQ"
    }
}