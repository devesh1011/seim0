# Seim0 - Decentralized Memory Layer on Sei Blockchain

Seim0 is a revolutionary memory layer that stores AI memories directly on the Sei blockchain, ensuring decentralized, immutable, and globally accessible memory storage. Built on top of Sei's high-performance EVM-compatible blockchain, Seim0 combines the power of decentralized storage with IPFS for content and smart contracts for indexing.

## 🌟 Features

- **🔗 Blockchain-Native**: Memories stored directly on Sei blockchain with immutable transaction hashes
- **📡 IPFS Integration**: Content stored on IPFS for decentralized, censorship-resistant access
- **⚡ High Performance**: Built on Sei's optimized blockchain for fast transaction processing
- **🔍 Smart Contract Indexing**: Efficient memory discovery through on-chain smart contracts
- **💰 Cost Effective**: Leverages Sei's low transaction costs for affordable memory operations
- **🛡️ Decentralized**: No central authority - your memories are truly yours
- **🔐 Cryptographic Security**: All operations secured by blockchain cryptography

## 📦 Installation

Install the Seim0 package using npm:

```bash
npm install seim0
```

## 🚀 Quick Start

### Installation

```bash
npm install seim0
```

### Basic Setup (Mock Mode)

```typescript
import { MemoryClient } from "seim0";

// Simple initialization - perfect for development and testing
const client = new MemoryClient({
  network: "testnet", // Uses mock transactions when no signer provided
});
```

### Production Setup (Real Blockchain)

```typescript
import { MemoryClient } from "seim0";
import { ethers } from "ethers";

// For real blockchain transactions with your wallet
const provider = new ethers.providers.JsonRpcProvider(
  "https://evm-rpc-testnet.sei-apis.com",
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const client = new MemoryClient({
  network: "testnet",
  signer: signer, // This enables REAL blockchain transactions
});
```

### Adding Memories

```typescript
// Add a memory to the blockchain
const memoryResult = await client.add(
  [
    { role: "user", content: "I love playing basketball on weekends" },
    {
      role: "assistant",
      content: "Great! I'll remember your sports preference.",
    },
  ],
  {
    user_id: "user123",
    metadata: { category: "sports", importance: "medium" },
  },
);

console.log("Memory stored on blockchain!");
console.log("Transaction Hash:", memoryResult.txHash);
console.log("IPFS CID:", memoryResult.cid);
console.log("Stream ID:", memoryResult.streamId);
```

### Searching Memories

```typescript
// Search memories on the blockchain
const searchResults = await client.search("basketball", {
  user_id: "user123",
  limit: 10,
});

console.log(`Found ${searchResults.length} memories:`);
searchResults.forEach((memory, index) => {
  console.log(`${index + 1}. ${memory.memory}`);
  console.log(`   Hash: ${memory.hash}`);
  console.log(`   Score: ${memory.metadata?.score}`);
});
```

### Getting All Memories

```typescript
// Get all memories for a user
const allMemories = await client.getAll({ user_id: "user123" });
console.log(`Total memories: ${allMemories.length}`);
```

### Environment Setup for Production

Create a `.env` file in your project root:

```bash
# Required for real IPFS uploads
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Required for real blockchain transactions
PRIVATE_KEY=your_wallet_private_key
```

## 🔧 Configuration Options

### Simple Configuration (Recommended)

````typescript
## 🔧 Configuration Options

### Simple Configuration (Recommended)

```typescript
// Development mode (uses mocks when credentials not available)
const client = new MemoryClient({
  network: "testnet" | "mainnet"
});
````

### Production Configuration

```typescript
import { ethers } from "ethers";

// Full production setup with real blockchain transactions
const provider = new ethers.providers.JsonRpcProvider(
  "https://evm-rpc-testnet.sei-apis.com",
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const client = new MemoryClient({
  network: "testnet",
  signer: signer, // Enables real blockchain transactions
});
```

### Advanced Configuration (Optional)

For advanced users who need custom infrastructure:

```typescript
const client = new MemoryClient({
  customConfig: {
    rpcUrl: "https://your-custom-rpc.com",
    registryAddress: "0x...",
    accessAddress: "0x...",
    vaultAddress: "0x...",
    ipfsGateway: "https://your-ipfs-gateway.com/ipfs/",
    privateKey: "your-private-key",
  },
});
```

### Advanced Configuration (Optional)

For advanced users who need custom infrastructure:

```typescript
import { SeiConfig } from "seim0/types";

const customConfig: SeiConfig = {
  rpcUrl: "https://your-custom-rpc.com",
  registryAddress: "0x...",
  accessAddress: "0x...",
  vaultAddress: "0x...",
  ipfsGateway: "https://your-ipfs-gateway.com/ipfs/",
  privateKey: "your-private-key",
};

const client = new MemoryClient({
  customConfig: customConfig,
});
```

## 🏗️ Architecture

Seim0 uses a multi-layered architecture:

1. **Smart Contracts**: Three contracts handle different aspects:
   - `MemoryRegistry`: Indexes memories and manages metadata
   - `MemoryAccess`: Controls access permissions and retrieval
   - `PaymentVault`: Handles transaction fees and payments

2. **IPFS Storage**: Actual memory content is stored on IPFS for:
   - Decentralized content storage
   - Immutable content addressing
   - Global accessibility

3. **Blockchain Indexing**: Memory metadata stored on-chain for:
   - Fast searchability
   - Immutable transaction history
   - Cryptographic verification

## 📝 Examples

Check out the examples in the `src/oss/examples/` directory:

- `sei-example.ts` - Basic usage example
- `sei-blockchain-example.ts` - Advanced blockchain interactions
- `sei-production-setup.ts` - Production-ready configuration
- `sei-signer-setup.ts` - Custom signer configuration

## 🔐 Wallet Integration

### Using Private Key

```typescript
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  "https://evm-rpc-testnet.sei-apis.com",
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const client = new MemoryClient({
  network: "testnet",
  signer: signer,
});
```

### Using MetaMask or External Wallets

````typescript
import { ethers } from "ethers";

// Connect to MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const client = new MemoryClient({
  network: "testnet",
  signer: signer
});

## 🌐 Network Information

The package automatically handles all blockchain infrastructure based on your network selection:

### Testnet (Default)

- Automatic RPC connection to Sei testnet
- Pre-deployed smart contracts
- Built-in IPFS gateway
- No additional configuration needed

### Mainnet

- Automatic RPC connection to Sei mainnet
- Production smart contracts
- Redundant IPFS gateways
- Enterprise-grade infrastructure

### Technical Details (For Reference)

- **Testnet RPC**: `https://evm-rpc-testnet.sei-apis.com`
- **Mainnet RPC**: `https://evm-rpc.sei-apis.com`
- **Chain ID**: 1328 (testnet), 531 (mainnet)
- **Block Explorer**: `https://seitrace.com`

## 🛠️ Development

### Building the Project

```bash
npm run build
````

### Running Tests

```bash
npm test
```

### Running Examples

```bash
# Basic example
npm run sei:example

# Production setup
npm run sei:production

# Blockchain example
npm run sei:blockchain
```
