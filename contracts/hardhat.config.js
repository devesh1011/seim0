import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-verify";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// The PRIVATE_KEY should be loaded from a .env file for security.
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (
  !PRIVATE_KEY ||
  PRIVATE_KEY ===
    "0000000000000000000000000000000000000000000000000000000000000000"
) {
  console.warn(
    "⚠️  WARNING: Using default/invalid private key. Set PRIVATE_KEY in .env file!",
  );
  console.warn("⚠️  For testnet: Use a test wallet private key");
  console.warn(
    "⚠️  For mainnet: Use a dedicated deployment wallet private key",
  );
}

// Ensure private key has 0x prefix
const formattedPrivateKey = PRIVATE_KEY?.startsWith("0x")
  ? PRIVATE_KEY
  : `0x${PRIVATE_KEY}`;

// The Hardhat configuration object is exported using ES module syntax.
export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "sei-testnet": {
      url: "https://evm-rpc-testnet.sei-apis.com",
      chainId: 1328, // Updated to match actual Sei testnet chain ID
      accounts: [formattedPrivateKey],
      gas: 8000000,
      gasPrice: 10000000000, // 10 gwei
    },
    "sei-mainnet": {
      url: "https://evm-rpc.sei-apis.com",
      chainId: 1329,
      accounts: [formattedPrivateKey],
      gas: 8000000,
      gasPrice: 10000000000, // 10 gwei
    },
  },
  etherscan: {
    apiKey: {
      "sei-testnet": process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY",
      "sei-mainnet": process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY",
    },
    customChains: [
      {
        network: "sei-testnet",
        chainId: 713715,
        urls: {
          apiURL: "https://seitrace.com/pacific-1/api",
          browserURL: "https://seitrace.com/pacific-1",
        },
      },
      {
        network: "sei-mainnet",
        chainId: 1329,
        urls: {
          apiURL: "https://seitrace.com/api",
          browserURL: "https://seitrace.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
