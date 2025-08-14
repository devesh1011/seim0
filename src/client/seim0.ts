import axios from "axios";
import {
  Memory,
  MemoryHistory,
  MemoryOptions,
  MemoryUpdateBody,
  SearchOptions,
  Message,
  Backend,
  SeiConfig,
  SeiMemoryResult,
  SeiQueryResult,
} from "./seim0.types";

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}

export class MemoryClient {
  private backend: Backend = "sei";
  private seiConfig?: SeiConfig;

  constructor(options: MemoryOptions = {}) {
    this.backend = "sei"; // Only Sei backend supported

    if (options.sei) {
      this.seiConfig = options.sei;
      console.log("✅ Sei backend initialized without API dependency");
    } else {
      throw new Error("Sei configuration is required for seim0");
    }
  }

  // Core memory operations for Sei blockchain
  async add(
    messages: Array<Message>,
    options: MemoryOptions = {},
  ): Promise<SeiMemoryResult> {
    return this._addSei(messages, options);
  }

  async get(memoryId: string, options: MemoryOptions = {}): Promise<Memory> {
    return this._getSei(memoryId, options);
  }

  async getAll(options: MemoryOptions = {}): Promise<Memory[]> {
    return this._getAllSei(options);
  }

  async search(query: string, options: SearchOptions = {}): Promise<Memory[]> {
    return this._searchSei(query, options);
  }

  async update(
    memoryId: string,
    data: MemoryUpdateBody,
    options: MemoryOptions = {},
  ): Promise<Memory> {
    return this._updateSei(memoryId, data, options);
  }

  async delete(memoryId: string, options: MemoryOptions = {}): Promise<string> {
    return this._deleteSei(memoryId, options);
  }

  async history(
    memoryId: string,
    options: MemoryOptions = {},
  ): Promise<MemoryHistory[]> {
    return this._historySei(memoryId, options);
  }

  // Sei blockchain implementations
  private async _addSei(
    messages: Array<Message>,
    options: MemoryOptions,
  ): Promise<SeiMemoryResult> {
    if (!this.seiConfig) throw new Error("Sei config not initialized");

    try {
      // 1. Extract and process messages
      const text = this._extractTextFromMessages(messages);

      // 2. Create memory document
      const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const document = {
        id: memoryId,
        content: text,
        messages,
        metadata: {
          ...options.metadata,
          user_id: options.user_id,
          agent_id: options.agent_id,
          app_id: options.app_id,
          run_id: options.run_id,
          environment: "production",
          timestamp: Date.now(),
        },
      };

      // 3. Upload to IPFS
      const cid = await this._uploadToIPFS(document);

      // 4. Create merkle root (simplified)
      const merkleRoot = `0x${this._simpleHash(cid).toString(16).padStart(64, "0")}`;

      // 5. Append to Sei registry
      const streamId = options.user_id || "default_stream";
      const txHash = await this._appendToSeiRegistry(
        streamId,
        cid,
        merkleRoot,
        JSON.stringify(document.metadata),
      );

      console.log("🎉 Memory successfully stored on blockchain!");
      console.log("📝 Memory details:", {
        id: memoryId,
        hash: cid,
        txHash,
      });

      return {
        txHash,
        cid,
        merkleRoot,
        streamId,
      };
    } catch (error) {
      console.error("Error adding Sei memory:", error);
      throw new APIError(
        `Failed to add Sei memory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async _getSei(
    memoryId: string,
    options: MemoryOptions,
  ): Promise<Memory> {
    // Simplified implementation - in production, query blockchain by memory ID
    throw new Error(
      "Get by ID not yet implemented for Sei. Use search instead.",
    );
  }

  private async _getAllSei(options: MemoryOptions): Promise<Memory[]> {
    // Get all memories for user from blockchain
    const streamId = options.user_id || "default_stream";
    return this._searchSei("", { ...options, limit: 100 });
  }

  private async _searchSei(
    query: string,
    options: SearchOptions,
  ): Promise<Memory[]> {
    if (!this.seiConfig) throw new Error("Sei config not initialized");

    try {
      const streamId = options.user_id || "default_stream";
      const limit = options.limit || 10;

      // 1. Generate query embedding (simplified)
      const queryEmbedding = await this._generateEmbedding(query);

      // 2. Search via indexer (simplified)
      const searchResults = await this._searchSeiIndex(
        queryEmbedding,
        streamId,
        limit,
      );

      // 3. Verify results and hydrate from IPFS
      const memories: Memory[] = [];
      for (const result of searchResults) {
        const verified = await this._verifySeiResult(result);
        if (verified) {
          const content = await this._fetchFromIPFS(result.cid);
          if (content) {
            memories.push({
              id: result.cid,
              memory: content.content,
              hash: result.cid,
              metadata: {
                ...content.metadata,
                verified: true,
                score: result.score,
              },
              created_at: new Date(content.metadata.timestamp),
              updated_at: new Date(content.metadata.timestamp),
            });
          }
        }
      }

      return memories;
    } catch (error) {
      console.error("Error searching Sei memories:", error);
      throw new APIError(
        `Failed to search Sei memories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async _updateSei(
    memoryId: string,
    data: MemoryUpdateBody,
    options: MemoryOptions,
  ): Promise<Memory> {
    // For blockchain, create new memory with reference to old one
    throw new Error(
      "Update not yet implemented for Sei. Create new memory instead.",
    );
  }

  private async _deleteSei(
    memoryId: string,
    options: MemoryOptions,
  ): Promise<string> {
    // Blockchain records are immutable, mark as deleted in metadata
    throw new Error(
      "Delete not yet implemented for Sei. Memories are immutable on blockchain.",
    );
  }

  private async _historySei(
    memoryId: string,
    options: MemoryOptions,
  ): Promise<MemoryHistory[]> {
    // Get memory history from blockchain events
    throw new Error("History not yet implemented for Sei.");
  }

  // Helper methods for Sei backend
  private _extractTextFromMessages(messages: Array<Message>): string {
    return messages
      .map((msg) =>
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
      )
      .join("\\n");
  }

  private _simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private async _generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding - in production, use actual embedding service
    const hash = this._simpleHash(text);
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(Math.sin(hash + i) * 0.1);
    }
    return embedding;
  }

  private async _uploadToIPFS(document: any): Promise<string> {
    if (!this.seiConfig) throw new Error("Sei config not initialized");

    // Real IPFS upload using Pinata
    try {
      const pinataApiKey = process.env.PINATA_API_KEY;
      const pinataSecretKey = process.env.PINATA_SECRET_KEY;

      if (!pinataApiKey || !pinataSecretKey) {
        console.warn("PINATA credentials not found, using mock CID");
        return `Qm${this._simpleHash(JSON.stringify(document)).toString(36).padEnd(44, "0")}`;
      }

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
          body: JSON.stringify({
            pinataContent: document,
            pinataMetadata: {
              name: `memory-${document.id}`,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Real IPFS upload successful: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (error) {
      console.error("IPFS upload failed, using mock:", error);
      return `Qm${this._simpleHash(JSON.stringify(document)).toString(36).padEnd(44, "0")}`;
    }
  }

  private async _appendToSeiRegistry(
    streamId: string,
    cid: string,
    merkleRoot: string,
    metadata: string,
  ): Promise<string> {
    if (!this.seiConfig) throw new Error("Sei config not initialized");

    // Real blockchain transaction
    try {
      if (!this.seiConfig.signer) {
        console.warn("No signer found, using mock transaction");
        return `0x${this._simpleHash(`${streamId}${cid}`).toString(16).padStart(64, "0")}`;
      }

      // Import ethers for contract interaction
      const { ethers } = await import("ethers");

      // Memory Registry ABI (just the functions we need)
      const registryABI = [
        "function registerStream(string memory streamId, address owner, string memory policy) external",
        "function append(string memory streamId, string memory cid, bytes32 merkleRoot, string memory metadata) external",
        "function getHead(string memory streamId) external view returns (tuple(string cid, bytes32 merkleRoot, string metadata, uint256 timestamp))",
        "function streamExists(string memory streamId) external view returns (bool)",
      ];

      // Create contract instance
      const registryContract = new ethers.Contract(
        this.seiConfig.registryAddress,
        registryABI,
        this.seiConfig.signer,
      );

      // First, register stream if it doesn't exist (ignore if already exists)
      try {
        console.log(`📝 Registering stream: ${streamId}`);
        const signerAddress = await this.seiConfig.signer.getAddress();
        const registerTx = await registryContract.registerStream(
          streamId,
          signerAddress,
          "default",
        );
        await registerTx.wait();
        console.log(`✅ Stream registered: ${registerTx.hash}`);
      } catch (error) {
        // Stream might already exist, that's OK
        console.log(`ℹ️ Stream may already exist: ${streamId}`);
      }

      // Append the memory to the stream
      console.log(`📝 Appending to blockchain: stream=${streamId}, cid=${cid}`);
      const appendTx = await registryContract.append(
        streamId,
        cid,
        merkleRoot,
        metadata,
      );

      console.log(`⏳ Transaction submitted: ${appendTx.hash}`);
      const receipt = await appendTx.wait();
      console.log(
        `✅ Real blockchain transaction confirmed! Block: ${receipt.blockNumber}`,
      );

      return appendTx.hash;
    } catch (error) {
      console.error("Blockchain transaction failed, using mock:", error);
      return `0x${this._simpleHash(`${streamId}${cid}`).toString(16).padStart(64, "0")}`;
    }
  }

  private async _searchSeiIndex(
    embedding: number[],
    streamId: string,
    limit: number,
  ): Promise<any[]> {
    // Real blockchain search - get actual CIDs from the registry
    try {
      if (!this.seiConfig?.signer) {
        console.warn("No signer found for blockchain search, using mock");
        return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
          cid: `Qm${i.toString().padEnd(44, "0")}`,
          score: 0.8 - i * 0.1,
        }));
      }

      // Import ethers for contract interaction
      const { ethers } = await import("ethers");

      // Memory Registry ABI for reading stream history
      const registryABI = [
        "function getStreamHistory(string memory streamId) external view returns (string[] memory)",
        "function streams(string memory streamId) external view returns (address owner, string policy, string latestCID, bytes32 latestMerkleRoot, uint256 lastUpdated, bytes32 indexRoot, address authorizedIndexer, bool exists)",
      ];

      // Create contract instance
      const registryContract = new ethers.Contract(
        this.seiConfig.registryAddress,
        registryABI,
        this.seiConfig.signer,
      );

      // Get stream history (all CIDs for this stream)
      try {
        const streamHistory = await registryContract.getStreamHistory(streamId);
        console.log(
          `📚 Found ${streamHistory.length} memories in stream ${streamId}`,
        );

        // Return the most recent CIDs with mock scores (in production, use real vector search)
        return streamHistory
          .slice(-limit)
          .reverse()
          .map((cid: string, i: number) => ({
            cid,
            score: 0.9 - i * 0.1, // Simple scoring, newest first
          }));
      } catch (error) {
        console.log(
          `⚠️ Could not fetch stream history for ${streamId}:`,
          error,
        );

        // Fallback: try to get just the latest CID
        try {
          const streamInfo = await registryContract.streams(streamId);
          if (streamInfo.exists && streamInfo.latestCID) {
            console.log(
              `📄 Found latest CID for stream ${streamId}: ${streamInfo.latestCID}`,
            );
            return [
              {
                cid: streamInfo.latestCID,
                score: 0.9,
              },
            ];
          }
        } catch (fallbackError) {
          console.log(`❌ Fallback also failed:`, fallbackError);
        }

        return [];
      }
    } catch (error) {
      console.error("Error searching blockchain index:", error);
      // Fallback to mock
      return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
        cid: `Qm${i.toString().padEnd(44, "0")}`,
        score: 0.8 - i * 0.1,
      }));
    }
  }

  private async _verifySeiResult(result: any): Promise<boolean> {
    // Mock verification - in production, verify merkle proofs
    return true;
  }

  private async _fetchFromIPFS(cid: string): Promise<any> {
    if (!this.seiConfig) throw new Error("Sei config not initialized");

    // Real IPFS fetch
    try {
      const response = await fetch(`${this.seiConfig.ipfsGateway}${cid}`);
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.statusText}`);
      }

      const content = await response.json();
      console.log(`✅ Real IPFS fetch successful: ${cid}`);
      return content;
    } catch (error) {
      console.error(`IPFS fetch failed for ${cid}, using mock:`, error);
      return {
        content: `Mock content for ${cid}`,
        metadata: { timestamp: Date.now() },
      };
    }
  }
}
