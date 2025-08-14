import { VectorStore } from "./base";
import { SearchResult } from "../types";

export interface SeiIndexerConfig {
  seiRpcUrl: string;
  registryAddress: string;
  accessAddress: string;
  ipfsGateway: string;
  vectorStore: VectorStore;
  embedder: any; // Embedder instance
  privateKey?: string; // For indexer operations
}

export interface IndexEntry {
  cid: string;
  embedding: number[];
  metadata: Record<string, any>;
  timestamp: number;
  streamId: string;
}

export interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
}

/**
 * Sei Indexer - Bridges between Sei blockchain events and vector database
 * Reads MemoryAppended events, fetches content from IPFS, and indexes in vector store
 */
export class SeiIndexer {
  private config: SeiIndexerConfig;
  private isRunning: boolean = false;
  private lastProcessedBlock: number = 0;
  private indexEntries: Map<string, IndexEntry> = new Map();

  constructor(config: SeiIndexerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log("Starting Sei Indexer...");
    this.isRunning = true;

    // Start listening to blockchain events
    await this.startEventListener();

    // Start periodic index root updates
    this.startIndexRootUpdater();
  }

  stop(): void {
    console.log("Stopping Sei Indexer...");
    this.isRunning = false;
  }

  private async startEventListener(): Promise<void> {
    // Simulate blockchain event listening
    // In production, this would use ethers.js or web3.js to listen to events
    while (this.isRunning) {
      try {
        await this.processNewEvents();
        await this.sleep(5000); // Check every 5 seconds
      } catch (error) {
        console.error("Error processing events:", error);
        await this.sleep(10000); // Wait longer on error
      }
    }
  }

  private async processNewEvents(): Promise<void> {
    // Mock event processing - in production, this would:
    // 1. Query the MemoryRegistry contract for MemoryAppended events
    // 2. Process each event to fetch IPFS content and create embeddings

    console.log("Checking for new MemoryAppended events...");

    // Simulate processing events
    const mockEvents = await this.fetchMockEvents();

    for (const event of mockEvents) {
      await this.processMemoryAppendedEvent(event);
    }
  }

  private async fetchMockEvents(): Promise<any[]> {
    // In production, this would be:
    // const filter = contract.filters.MemoryAppended();
    // const events = await contract.queryFilter(filter, this.lastProcessedBlock);

    return []; // No mock events for now
  }

  private async processMemoryAppendedEvent(event: any): Promise<void> {
    const { streamId, cid, merkleRoot, metadata } = event.args;

    try {
      // Fetch content from IPFS
      const content = await this.fetchFromIPFS(cid);
      if (!content) {
        console.warn(`Failed to fetch content for CID: ${cid}`);
        return;
      }

      // Generate or extract embedding
      let embedding: number[];
      if (content.embedding) {
        embedding = content.embedding;
      } else {
        embedding = await this.generateEmbedding(content.content);
      }

      // Create index entry
      const indexEntry: IndexEntry = {
        cid,
        embedding,
        metadata: {
          ...content.metadata,
          streamId,
          merkleRoot,
          blockNumber: event.blockNumber,
        },
        timestamp: content.timestamp,
        streamId,
      };

      // Store in vector database
      await this.storeInVectorDB(indexEntry);

      // Store in local index
      this.indexEntries.set(cid, indexEntry);

      console.log(`Indexed memory: ${cid} for stream: ${streamId}`);
    } catch (error) {
      console.error(`Error processing event for CID ${cid}:`, error);
    }
  }

  private async fetchFromIPFS(cid: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.ipfsGateway}/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`IPFS fetch failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from IPFS (${cid}):`, error);
      return null;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embedding = await this.config.embedder.embed(text);
      return embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      return [];
    }
  }

  private async storeInVectorDB(entry: IndexEntry): Promise<void> {
    try {
      await this.config.vectorStore.insert(
        [entry.embedding],
        [entry.cid],
        [entry.metadata],
      );
    } catch (error) {
      console.error("Error storing in vector DB:", error);
      throw error;
    }
  }

  private startIndexRootUpdater(): void {
    // Periodically update the index root on-chain
    setInterval(async () => {
      if (this.isRunning) {
        await this.updateIndexRoots();
      }
    }, 30000); // Every 30 seconds
  }

  private async updateIndexRoots(): Promise<void> {
    try {
      // Group entries by stream
      const streamGroups = new Map<string, IndexEntry[]>();

      for (const entry of this.indexEntries.values()) {
        if (!streamGroups.has(entry.streamId)) {
          streamGroups.set(entry.streamId, []);
        }
        streamGroups.get(entry.streamId)!.push(entry);
      }

      // Update root for each stream
      for (const [streamId, entries] of streamGroups) {
        const merkleRoot = this.computeMerkleRoot(entries);
        await this.setIndexRootOnChain(streamId, merkleRoot);
      }
    } catch (error) {
      console.error("Error updating index roots:", error);
    }
  }

  private computeMerkleRoot(entries: IndexEntry[]): string {
    // Simple implementation - in production, use a proper Merkle tree library
    const leaves = entries.map((entry) =>
      this.hashLeaf(entry.cid, entry.embedding, entry.timestamp),
    );

    if (leaves.length === 0)
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (leaves.length === 1) return leaves[0];

    // Simple binary tree approach
    let currentLevel = leaves;
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(this.hashPair(left, right));
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  private hashLeaf(
    cid: string,
    embedding: number[],
    timestamp: number,
  ): string {
    // Create deterministic hash of leaf data
    const data = `${cid}-${embedding.slice(0, 10).join(",")}-${timestamp}`;
    return `0x${this.simpleHash(data)}`;
  }

  private hashPair(left: string, right: string): string {
    const combined = left + right;
    return `0x${this.simpleHash(combined)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }

  private async setIndexRootOnChain(
    streamId: string,
    merkleRoot: string,
  ): Promise<void> {
    try {
      console.log(`Setting index root for stream ${streamId}: ${merkleRoot}`);
      // In production, this would call the contract:
      // const tx = await registryContract.setIndexRoot(streamId, merkleRoot);
      // await tx.wait();
    } catch (error) {
      console.error(`Error setting index root for stream ${streamId}:`, error);
    }
  }

  async search(
    streamId: string,
    query: string,
    k: number = 5,
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Search vector store
      const results = await this.config.vectorStore.search(queryEmbedding, k, {
        streamId,
      });

      // Add verification proofs
      const verifiedResults: SearchResult[] = [];

      for (const result of results) {
        const proof = await this.generateMerkleProof(result.id);
        verifiedResults.push({
          results: [
            {
              id: result.id,
              memory: "", // Would need to fetch from IPFS
              score: result.score,
              metadata: {
                ...result.payload,
                proof,
              },
            },
          ],
        });
      }

      return verifiedResults;
    } catch (error) {
      console.error("Error in verified search:", error);
      throw error;
    }
  }

  private async generateMerkleProof(cid: string): Promise<MerkleProof> {
    // Generate Merkle proof for the given CID
    const entry = this.indexEntries.get(cid);
    if (!entry) {
      throw new Error(`Index entry not found for CID: ${cid}`);
    }

    const streamEntries = Array.from(this.indexEntries.values()).filter(
      (e) => e.streamId === entry.streamId,
    );

    const leaf = this.hashLeaf(entry.cid, entry.embedding, entry.timestamp);
    const proof = this.generateProofPath(streamEntries, entry);
    const root = this.computeMerkleRoot(streamEntries);

    return {
      leaf,
      proof,
      root,
    };
  }

  private generateProofPath(
    entries: IndexEntry[],
    targetEntry: IndexEntry,
  ): string[] {
    // Simplified proof generation - in production, use proper Merkle tree
    const leaves = entries.map((entry) =>
      this.hashLeaf(entry.cid, entry.embedding, entry.timestamp),
    );

    const targetLeaf = this.hashLeaf(
      targetEntry.cid,
      targetEntry.embedding,
      targetEntry.timestamp,
    );
    const targetIndex = leaves.indexOf(targetLeaf);

    if (targetIndex === -1) return [];

    // Simple proof path (in production, would be more sophisticated)
    const proof: string[] = [];
    let currentLevel = leaves;
    let currentIndex = targetIndex;

    while (currentLevel.length > 1) {
      const isEven = currentIndex % 2 === 0;
      const siblingIndex = isEven ? currentIndex + 1 : currentIndex - 1;

      if (siblingIndex < currentLevel.length) {
        proof.push(currentLevel[siblingIndex]);
      }

      // Move to next level
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(this.hashPair(left, right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
