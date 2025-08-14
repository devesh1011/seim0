/**
 * Quick setup guide: Add ethers.js signer to your Sei configuration
 *
 * Since you already have:
 * 1. ✅ Contracts deployed
 * 2. ✅ Contract addresses updated
 * 3. ✅ IPFS API keys in .env
 *
 * This shows you step 4: Adding the ethers.js signer
 */

import { MemoryClient } from "../../client/seim0";
import { SeiConfig } from "../../client/seim0.types";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Load your .env file
dotenv.config();

async function createSeiClientWithSigner() {
  console.log("🔗 Creating Sei client with real signer...");

  // 1. Create provider for Sei testnet
  const provider = new ethers.providers.JsonRpcProvider(
    "https://evm-rpc-testnet.sei-apis.com",
  );

  // 2. Create signer from your private key (already in .env)
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY not found in .env file");
  }

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // 3. Verify signer setup
  console.log("🔑 Signer address:", await signer.getAddress());
  const balance = await signer.getBalance();
  console.log("💰 Signer balance:", ethers.utils.formatEther(balance), "SEI");

  // 4. Create Sei config with your deployed contract addresses + signer
  const seiConfig: SeiConfig = {
    rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
    registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76", // ✅ Your deployed MemoryRegistry
    accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF", // ✅ Your deployed MemoryAccess
    vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D", // ✅ Your deployed PaymentVault
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
    signer: signer, // 🔥 This is what you needed to add!
  };

  // 5. Create the client
  const client = new MemoryClient({
    backend: "sei",
    sei: seiConfig,
  });

  console.log(
    "✅ Sei client created with real signer - ready for blockchain transactions!",
  );

  return client;
}

// Test it works
async function testRealBlockchainMemory() {
  try {
    const client = await createSeiClientWithSigner();

    console.log("\n💾 Testing real blockchain memory storage...");

    // This will make actual blockchain transactions!
    const memoryResult = await client.add(
      [{ role: "user", content: "This memory is stored on Sei blockchain!" }],
      {
        user_id: "your_user_id",
        metadata: {
          environment: "production",
          timestamp: Date.now(),
        },
      },
    );

    console.log("🎉 Memory successfully stored on blockchain!");
    console.log("📝 Memory details:", {
      cid: memoryResult.cid,
      txHash: memoryResult.txHash,
      streamId: memoryResult.streamId,
    });

    // Test search
    console.log("\n🔍 Searching blockchain memories...");
    const results = await client.search("blockchain memory", {
      user_id: "your_user_id",
    });

    console.log("🎯 Found", results.length, "memories");
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
  }
}

// Run the test
if (require.main === module) {
  console.log("🚀 Testing Sei backend with real signer...\n");
  testRealBlockchainMemory();
}

export { createSeiClientWithSigner, testRealBlockchainMemory };
