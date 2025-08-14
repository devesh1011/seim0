import { MemoryClient } from "../../client/seim0";
import { SeiConfig } from "../../client/seim0.types";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Load environment variables
dotenv.config();

async function setupSeiWithSigner() {
  console.log("🔗 Setting up Sei backend with real signer...");

  // Method 1: Using private key from environment (most common)
  const provider = new ethers.providers.JsonRpcProvider(
    "https://evm-rpc-testnet.sei-apis.com",
  );

  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("🔑 Signer address:", signer.address);
  console.log(
    "💰 Balance:",
    ethers.utils.formatEther(await signer.getBalance()),
    "SEI",
  );

  // Configure Sei with real signer
  const seiConfig: SeiConfig = {
    rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
    registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76",
    accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF",
    vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D",
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
    signer: signer, // 🔥 This is the key addition!
  };

  // Initialize client with real signer
  const client = new MemoryClient({
    backend: "sei",
    sei: seiConfig,
  });

  console.log("✅ MemoryClient initialized with real Sei signer");

  return { client, signer };
}

// Alternative Method 2: Browser-based (MetaMask integration)
async function setupSeiWithMetaMask() {
  console.log("🦊 Setting up Sei backend with MetaMask...");

  // This would work in a browser environment
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const seiConfig: SeiConfig = {
      rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
      registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76",
      accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF",
      vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
      signer: signer,
    };

    const client = new MemoryClient({
      backend: "sei",
      sei: seiConfig,
    });

    return { client, signer };
  } else {
    throw new Error("MetaMask not detected");
  }
}

// Alternative Method 3: Using mnemonic phrase
async function setupSeiWithMnemonic() {
  console.log("🗝️  Setting up Sei backend with mnemonic...");

  const provider = new ethers.providers.JsonRpcProvider(
    "https://evm-rpc-testnet.sei-apis.com",
  );

  // Replace with your mnemonic (12 or 24 words)
  const mnemonic =
    process.env.MNEMONIC ||
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const signer = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const seiConfig: SeiConfig = {
    rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
    registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76",
    accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF",
    vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D",
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
    signer: signer,
  };

  const client = new MemoryClient({
    backend: "sei",
    sei: seiConfig,
  });

  return { client, signer };
}

// Demo function showing real blockchain transactions
async function demonstrateRealTransactions() {
  try {
    const { client, signer } = await setupSeiWithSigner();

    console.log("\n💾 Testing real blockchain memory storage...");

    // This would make real blockchain transactions!
    const memoryResult = await client.add(
      [{ role: "user", content: "This is a real blockchain memory!" }],
      {
        user_id: "test_user",
        metadata: { type: "real_blockchain_test" },
      },
    );

    console.log("📝 Real blockchain memory stored:", memoryResult);

    // Search memories
    const results = await client.search("blockchain memory", {
      user_id: "test_user",
    });

    console.log("🔍 Search results:", results);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Export for use
export {
  setupSeiWithSigner,
  setupSeiWithMetaMask,
  setupSeiWithMnemonic,
  demonstrateRealTransactions,
};

// Run if called directly
if (require.main === module) {
  console.log("🚀 Sei Signer Setup Examples");
  console.log("\nChoose your setup method:");
  console.log("1. Private Key (Node.js) - Most common");
  console.log("2. MetaMask (Browser)");
  console.log("3. Mnemonic phrase");

  // Run the private key example
  setupSeiWithSigner()
    .then(() => console.log("✅ Setup complete!"))
    .catch(console.error);
}
