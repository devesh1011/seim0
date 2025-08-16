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

### Basic Setup

```typescript
import { MemoryClient } from "seim0";
import { SeiConfig } from "seim0/types";

// Configure Sei blockchain connection
const seiConfig: SeiConfig = {
  rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
  registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76",
  accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF",
  vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D",
  ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
};

// Initialize client
const client = new MemoryClient({
  backend: "sei",
  sei: seiConfig,
});
```

### Adding Memories

```typescript
// Add a memory to the blockchain
const result = await client.add({
  messages: [
    { role: "user", content: "I love playing basketball on weekends" },
  ],
  user_id: "user123",
});

console.log("Memory stored on blockchain!");
console.log("Transaction Hash:", result.txHash);
console.log("IPFS CID:", result.cid);
console.log("Stream ID:", result.streamId);
```

### Searching Memories

```typescript
// Search memories on the blockchain
const memories = await client.search({
  query: "basketball",
  user_id: "user123",
  limit: 10,
});

console.log("Found memories:", memories);
```

### Getting All Memories

```typescript
// Get all memories for a user
const allMemories = await client.getAll("user123");
console.log("All user memories:", allMemories);
```

## 🔧 Configuration Options

### Sei Configuration

```typescript
interface SeiConfig {
  rpcUrl: string; // Sei RPC endpoint
  registryAddress: string; // Memory registry contract address
  accessAddress: string; // Memory access contract address
  vaultAddress: string; // Payment vault contract address
  ipfsGateway: string; // IPFS gateway for content retrieval
  privateKey?: string; // Optional: Private key for transactions
}
```

### Client Configuration

```typescript
interface MemoryClientConfig {
  backend: "sei"; // Currently only Sei is supported
  sei: SeiConfig; // Sei blockchain configuration
}
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

### Using MetaMask or External Wallets

```typescript
import { ethers } from "ethers";

// Connect to MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const client = new MemoryClient({
  backend: "sei",
  sei: {
    ...seiConfig,
    signer: signer, // Use external signer
  },
});
```

### Using Private Key

```typescript
const client = new MemoryClient({
  backend: "sei",
  sei: {
    ...seiConfig,
    privateKey: "your-private-key-here",
  },
});
```

## 🌐 Network Information

### Testnet (Default)

- RPC URL: `https://evm-rpc-testnet.sei-apis.com`
- Chain ID: `1328`
- Native Token: SEI
- Block Explorer: `https://seitrace.com`

### Smart Contract Addresses (Testnet)

- Memory Registry: `0xEd71E25bE660D346E05d76d478f1FD762e74ec76`
- Memory Access: `0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF`
- Payment Vault: `0x86D143Cd76f012a3d68154058FEc6315e4e0487D`

## 🛠️ Development

### Building the Project

```bash
npm run build
```

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Getting Help

If you have any questions or need assistance:

- GitHub Issues: [Report bugs or request features](https://github.com/devesh1011/seim0/issues)
- Documentation: Check the examples in `src/oss/examples/`
- Community: Join discussions in GitHub Discussions
