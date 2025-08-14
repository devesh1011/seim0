export interface CambrianMemoryToolConfig {
  registry: string;
  access: string;
  vault: string;
  ipfsGateway: string;
  seiRpcUrl: string;
  signer?: any; // ethers.js signer
}

export interface MemoryAction {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

/**
 * Cambrian Memory Tool - Drop-in tool for Cambrian Agent Kit
 * Provides memory actions for Sei agents
 */
export class CambrianMemoryTool {
  private config: CambrianMemoryToolConfig;
  private actions: Map<string, MemoryAction> = new Map();

  constructor(config: CambrianMemoryToolConfig) {
    this.config = config;
    this.initializeActions();
  }

  private initializeActions(): void {
    // Remember action
    this.actions.set("remember", {
      name: "remember",
      description: "Store a memory in the decentralized memory system",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text content to remember",
          },
          streamId: {
            type: "string",
            description:
              "Optional stream ID. If not provided, uses default user stream",
          },
          metadata: {
            type: "object",
            description: "Optional metadata to attach to the memory",
          },
        },
        required: ["text"],
      },
      handler: this.remember.bind(this),
    });

    // Recall action
    this.actions.set("recall", {
      name: "recall",
      description:
        "Search and retrieve memories from the decentralized memory system",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant memories",
          },
          streamId: {
            type: "string",
            description: "Optional stream ID to search within",
          },
          k: {
            type: "number",
            description: "Number of memories to return (default: 5)",
            default: 5,
          },
        },
        required: ["query"],
      },
      handler: this.recall.bind(this),
    });

    // Grant access action
    this.actions.set("grant", {
      name: "grant",
      description: "Grant access to a memory stream for another address",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The address to grant access to",
          },
          role: {
            type: "string",
            enum: ["AGENT", "INDEXER", "PUBLIC"],
            description: "The role to grant",
          },
          streamId: {
            type: "string",
            description: "The stream ID to grant access to",
          },
        },
        required: ["address", "role", "streamId"],
      },
      handler: this.grant.bind(this),
    });

    // Revoke access action
    this.actions.set("revoke", {
      name: "revoke",
      description: "Revoke access to a memory stream from an address",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The address to revoke access from",
          },
          streamId: {
            type: "string",
            description: "The stream ID to revoke access from",
          },
        },
        required: ["address", "streamId"],
      },
      handler: this.revoke.bind(this),
    });
  }

  /**
   * Get all available actions for the Cambrian Agent Kit
   */
  getActions(): MemoryAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Execute an action by name
   */
  async executeAction(actionName: string, parameters: any): Promise<any> {
    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Unknown action: ${actionName}`);
    }

    try {
      return await action.handler(parameters);
    } catch (error) {
      console.error(`Error executing action ${actionName}:`, error);
      throw error;
    }
  }

  /**
   * Remember action handler - stores text in IPFS and anchors on chain
   */
  private async remember(params: {
    text: string;
    streamId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const { text, streamId = "default", metadata = {} } = params;

    try {
      // 1. Generate embedding (simplified - would use actual embedder)
      const embedding = await this.generateEmbedding(text);

      // 2. Create memory document
      const memoryDoc = {
        id: this.generateId(),
        content: text,
        metadata: {
          ...metadata,
          streamId,
          timestamp: Date.now(),
        },
        embedding,
      };

      // 3. Upload to IPFS
      const cid = await this.uploadToIPFS(memoryDoc);

      // 4. Compute Merkle leaf
      const merkleLeaf = this.computeMerkleLeaf(
        cid,
        embedding,
        memoryDoc.metadata.timestamp,
      );

      // 5. Append to on-chain registry
      const txHash = await this.appendToRegistry(
        streamId,
        cid,
        merkleLeaf,
        JSON.stringify(metadata),
      );

      return {
        success: true,
        txHash,
        cid,
        merkleLeaf,
        streamId,
        message: `Memory stored successfully in stream ${streamId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to store memory",
      };
    }
  }

  /**
   * Recall action handler - searches memories with verification
   */
  private async recall(params: {
    query: string;
    streamId?: string;
    k?: number;
  }): Promise<any> {
    const { query, streamId = "default", k = 5 } = params;

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // 2. Search index (simplified - would use actual indexer)
      const searchResults = await this.searchIndex(queryEmbedding, streamId, k);

      // 3. Verify results against on-chain data
      const verifiedResults = [];
      for (const result of searchResults) {
        const verified = await this.verifyResult(result);
        if (verified) {
          // 4. Hydrate from IPFS
          const content = await this.fetchFromIPFS(result.cid);
          verifiedResults.push({
            id: result.cid,
            content: content?.content || "",
            score: result.score,
            metadata: content?.metadata || {},
            verified: true,
          });
        }
      }

      return {
        success: true,
        results: verifiedResults,
        query,
        streamId,
        message: `Found ${verifiedResults.length} verified memories`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to recall memories",
      };
    }
  }

  /**
   * Grant access action handler
   */
  private async grant(params: {
    address: string;
    role: string;
    streamId: string;
  }): Promise<any> {
    const { address, role, streamId } = params;

    try {
      // Call MemoryAccess contract to grant permission
      const txHash = await this.grantAccess(streamId, address, role);

      return {
        success: true,
        txHash,
        message: `Granted ${role} access to ${address} for stream ${streamId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to grant access",
      };
    }
  }

  /**
   * Revoke access action handler
   */
  private async revoke(params: {
    address: string;
    streamId: string;
  }): Promise<any> {
    const { address, streamId } = params;

    try {
      // Call MemoryAccess contract to revoke permission
      const txHash = await this.revokeAccess(streamId, address);

      return {
        success: true,
        txHash,
        message: `Revoked access for ${address} from stream ${streamId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to revoke access",
      };
    }
  }

  // Helper methods (simplified implementations)

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation - in production, use actual embedder
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(Math.sin(hash + i) * 0.1);
    }
    return embedding;
  }

  private async uploadToIPFS(document: any): Promise<string> {
    // Simplified IPFS upload - in production, use actual IPFS client
    console.log("Uploading to IPFS:", document.id);
    return `Qm${this.simpleHash(JSON.stringify(document)).toString(36).padEnd(44, "0")}`;
  }

  private async appendToRegistry(
    streamId: string,
    cid: string,
    merkleRoot: string,
    metadata: string,
  ): Promise<string> {
    // Simplified contract call - in production, use ethers.js
    console.log(`Appending to registry: stream=${streamId}, cid=${cid}`);
    return `0x${this.simpleHash(`${streamId}${cid}`).toString(16).padStart(64, "0")}`;
  }

  private async searchIndex(
    embedding: number[],
    streamId: string,
    k: number,
  ): Promise<any[]> {
    // Simplified search - in production, use actual vector search
    return Array.from({ length: Math.min(k, 3) }, (_, i) => ({
      cid: `Qm${i.toString().padEnd(44, "0")}`,
      score: 0.8 - i * 0.1,
    }));
  }

  private async verifyResult(result: any): Promise<boolean> {
    // Simplified verification - in production, verify Merkle proof
    console.log("Verifying result:", result.cid);
    return true;
  }

  private async fetchFromIPFS(cid: string): Promise<any> {
    // Simplified IPFS fetch - in production, use actual IPFS gateway
    return {
      content: `Mock content for ${cid}`,
      metadata: { timestamp: Date.now() },
    };
  }

  private async grantAccess(
    streamId: string,
    address: string,
    role: string,
  ): Promise<string> {
    // Simplified contract call - in production, use ethers.js
    console.log(`Granting ${role} to ${address} for stream ${streamId}`);
    return `0x${this.simpleHash(`grant${streamId}${address}`).toString(16).padStart(64, "0")}`;
  }

  private async revokeAccess(
    streamId: string,
    address: string,
  ): Promise<string> {
    // Simplified contract call - in production, use ethers.js
    console.log(`Revoking access for ${address} from stream ${streamId}`);
    return `0x${this.simpleHash(`revoke${streamId}${address}`).toString(16).padStart(64, "0")}`;
  }

  private computeMerkleLeaf(
    cid: string,
    embedding: number[],
    timestamp: number,
  ): string {
    const data = `${cid}${embedding.slice(0, 5).join("")}${timestamp}`;
    return `0x${this.simpleHash(data).toString(16).padStart(64, "0")}`;
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
