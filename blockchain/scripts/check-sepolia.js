const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");

// Load environment variables from blockchain/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const rawKey = (process.env.SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY || "").trim();

function sanitize(text) {
  let result = String(text);
  if (rpcUrl) {
    result = result.split(rpcUrl).join("[REDACTED_RPC_URL]");
  }
  if (rawKey) {
    result = result.split(rawKey).join("[REDACTED_PRIVATE_KEY]");
  }
  return result;
}

async function main() {
  if (!rpcUrl) {
    console.error("Error: SEPOLIA_RPC_URL is not set in .env");
    process.exit(1);
  }

  if (!rawKey) {
    console.error("Error: SEPOLIA_PRIVATE_KEY is not set in .env");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
    console.error("Error: SEPOLIA_PRIVATE_KEY is not a valid 64-character hex key.");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(formattedKey, provider);

    const [network, blockNumber, balanceWei] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getBalance(wallet.address),
    ]);

    console.log("Chain ID:", network.chainId.toString());
    console.log("Deployer Address:", wallet.address);
    console.log("Wallet Sepolia ETH Balance:", ethers.formatEther(balanceWei), "ETH");
    console.log("Latest Block Number:", blockNumber);
  } catch (error) {
    console.error("Connection failed:", sanitize(error.message || error));
    process.exit(1);
  }
}

main();
