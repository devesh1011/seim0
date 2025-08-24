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

```bash
npm install seim0
```

## 🚀 Quick Start

### 1. Setup Environment

Create a `.env` file in your project root:

```bash
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Required for on-chain transactions
PRIVATE_KEY=your_wallet_private_key
GOOGLE_API_KEY="your_gemini_or_openai_api_key"
```

### 2. Basic Usage

```typescript
import { MemoryClient } from "seim0";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  "https://evm-rpc-testnet.sei-apis.com"
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const memory = new MemoryClient({
  network: "testnet",
  signer: signer,
  llm: {
    provider: "google",
    config: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.0-flash",
    },
  },
  embedder: {
    provider: "google",
    config: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004",
    },
  },
});
```

### 3. Adding Memories

```typescript
// Add a memory to the blockchain
const conversation = [
  {
    role: "user" as const,
    content:
      "Hi, I'm David and I work as a blockchain developer at Ethereum Foundation. I specialize in smart contract security and love DeFi protocols.",
  },
  {
    role: "assistant" as const,
    content:
      "Nice to meet you David! Smart contract security is crucial in DeFi. What are your favorite protocols to work with?",
  },
  {
    role: "user" as const,
    content:
      "I really enjoy working with Uniswap and Compound. I also contribute to OpenZeppelin's security audits on weekends.",
  },
];

const result = await memory.add(conversation, {
  user_id: "david_blockchain_dev",
  metadata: {
    session: "test_fact_extraction",
    project: "sei_memory_test",
  },
});

console.log("Memory stored on blockchain!");
console.log("Transaction Hash:", memoryResult.txHash);
console.log("IPFS CID:", memoryResult.cid);
```

### 4. Searching Memories

```typescript
// Search memories on the blockchain
const searchResults = await memory.search(query, {
  user_id: "david_blockchain_dev",
  limit: 3,
});

console.log(`Found ${searchResults.length} memories:`);
searchResults.forEach((memory, index) => {
  console.log(`${index + 1}. ${memory.memory}`);
});
```

### 5. Getting All Memories

```typescript
// Get all memories for a user
const allMemories = await memory.getAll({
  user_id: "david_blockchain_dev",
});
console.log(`Total memories: ${allMemories.length}`);
```

## 🧠 Short-Term Memory

```typescript
// Add a short-term memory (ephemeral, not yet on-chain)
const shortTermConversation = [
  { role: "user" as const, content: "Remind me to call Bob at 5pm." },
];

// Store in-memory or in a local vector store for quick recall
await memory.add(shortTermConversation, {
  user_id: "alice_temp",
  metadata: { session: "reminders", temporary: true },
  // Optionally, use a memory backend that does not persist to blockchain/IPFS
});

// Retrieve short-term memory
const reminders = await memory.search("call Bob", {
  user_id: "alice_temp",
  limit: 1,
});
console.log(reminders[0]?.memory);
```

Short-term memories can be periodically consolidated or promoted to long-term memory if they are deemed important.

## 🔧 Configuration

That's it! The package automatically handles:

✅ **Network Selection**: Just specify `"testnet"` or `"mainnet"`  
✅ **Smart Contracts**: Pre-deployed contracts are used automatically  
✅ **IPFS Gateway**: Your Pinata credentials are used for storage  
✅ **Blockchain RPC**: Optimal RPC endpoints are selected automatically

No contract addresses, no RPC URLs, no complex setup needed!

## 🏗️ Architecture

Seim0 uses a multi-layered architecture:

1. **Smart Contracts**: Pre-deployed contracts handle:
   - Memory indexing and metadata management
   - Access control and permissions
   - Transaction fees and payments

2. **IPFS Storage**: Your Pinata account stores:
   - Decentralized content storage
   - Immutable content addressing
   - Global accessibility

3. **Blockchain Integration**: Sei testnet/mainnet provides:
   - Fast transaction processing
   - Immutable transaction history
   - Cryptographic verification

## �️ Development

### Building the Project

```bash
npm run build
```

### Running Examples

```bash
npm run sei:example
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Getting Help

If you have any questions or need assistance:

- GitHub Issues: [Report bugs or request features](https://github.com/devesh1011/seim0/issues)
- Documentation: Check the examples in `src/oss/examples/`
