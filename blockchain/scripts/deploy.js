const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer available. Please check SEPOLIA_PRIVATE_KEY in .env");
  }

  const balanceBefore = await hre.ethers.provider.getBalance(deployer.address);
  const network = await hre.ethers.provider.getNetwork();

  const RegistryFactory = await hre.ethers.getContractFactory("APAARCredentialRegistry", deployer);
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deploymentTx = registry.deploymentTransaction();
  const txHash = deploymentTx ? deploymentTx.hash : "";

  if (deploymentTx) {
    await deploymentTx.wait(1);
  }

  console.log("deployer address:", deployer.address);
  console.log("deployer Sepolia balance before deployment:", hre.ethers.formatEther(balanceBefore), "ETH");
  console.log("deployed contract address:", contractAddress);
  console.log("deployment transaction hash:", txHash);

  const deploymentData = {
    network: hre.network.name || "sepolia",
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: txHash,
    deployedAt: new Date().toISOString(),
  };

  const deploymentDir = path.resolve(__dirname, "../deployment");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFilePath = path.join(deploymentDir, "sepolia.json");
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentData, null, 2), "utf8");
}

main().catch((error) => {
  let msg = (error && error.message) || String(error);
  if (process.env.SEPOLIA_RPC_URL) {
    msg = msg.split(process.env.SEPOLIA_RPC_URL).join("[REDACTED_RPC_URL]");
  }
  if (process.env.SEPOLIA_PRIVATE_KEY) {
    msg = msg.split(process.env.SEPOLIA_PRIVATE_KEY).join("[REDACTED_PRIVATE_KEY]");
  }
  console.error("Deployment failed:", msg);
  process.exit(1);
});
