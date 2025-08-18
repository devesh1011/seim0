import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  console.log("Deploying Sei Memory contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MemoryAccess first
  console.log("Deploying MemoryAccess...");
  const MemoryAccess = await ethers.getContractFactory("MemoryAccess");
  const memoryAccess = await MemoryAccess.deploy();
  await memoryAccess.deployed();
  console.log("MemoryAccess deployed to:", memoryAccess.address);

  // Deploy MemoryRegistry
  console.log("Deploying MemoryRegistry...");
  const MemoryRegistry = await ethers.getContractFactory("MemoryRegistry");
  const memoryRegistry = await MemoryRegistry.deploy(memoryAccess.address);
  await memoryRegistry.deployed();
  console.log("MemoryRegistry deployed to:", memoryRegistry.address);

  // Deploy PaymentVault (using proper checksummed USDC address for testnet)
  const USDC_ADDRESS =
    process.env.USDC_ADDRESS || "0x4fCF1784B31630811181f670Aea7A7bEF803eaED"; // Proper checksum
  console.log("Deploying PaymentVault with USDC address:", USDC_ADDRESS);
  const PaymentVault = await ethers.getContractFactory("PaymentVault");
  const paymentVault = await PaymentVault.deploy(USDC_ADDRESS);
  await paymentVault.deployed();
  console.log("PaymentVault deployed to:", paymentVault.address);

  // Log deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("MemoryAccess:", memoryAccess.address);
  console.log("MemoryRegistry:", memoryRegistry.address);
  console.log("PaymentVault:", paymentVault.address);
  console.log("USDC Token:", USDC_ADDRESS);

  // Save deployment addresses

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contracts: {
      MemoryAccess: memoryAccess.address,
      MemoryRegistry: memoryRegistry.address,
      PaymentVault: paymentVault.address,
    },
    usdcAddress: USDC_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2),
  );

  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
