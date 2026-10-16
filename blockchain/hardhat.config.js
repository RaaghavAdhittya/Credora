require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const rawKey = (process.env.SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY || "").trim();
const formattedKey = rawKey.startsWith("0x") ? rawKey : (rawKey ? `0x${rawKey}` : "");
const isValidHexKey = /^0x[0-9a-fA-F]{64}$/.test(formattedKey);
const SEPOLIA_ACCOUNTS = isValidHexKey ? [formattedKey] : [];
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: SEPOLIA_ACCOUNTS,
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
