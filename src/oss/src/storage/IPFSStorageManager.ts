import { HistoryManager } from "./base";

export interface IPFSConfig {
  gateway: string;
  apiUrl?: string;
  apiKey?: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
}

export interface IPFSDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  embedding?: number[];
}

/**
 * IPFS Storage Manager for decentralized memory storage
 * Supports web3.storage, Pinata, and local IPFS nodes
 */
export class IPFSStorageManager implements HistoryManager {
  private config: IPFSConfig;

  constructor(config: IPFSConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    // Initialize IPFS client based on configuration
    console.log("Initializing IPFS storage with gateway:", this.config.gateway);
  }

  async addMemory(
    sessionId: string,
    memoryId: string,
    content: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    const document: IPFSDocument = {
      id: memoryId,
      content,
      metadata: {
        ...metadata,
        sessionId,
      },
      timestamp: Date.now(),
    };

    // Upload to IPFS and return CID
    const cid = await this.uploadToIPFS(document);
    console.log(`Memory ${memoryId} uploaded to IPFS with CID: ${cid}`);

    return cid;
  }

  async getMemory(cid: string): Promise<IPFSDocument | null> {
    try {
      const response = await fetch(`${this.config.gateway}/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
      }

      const document = (await response.json()) as IPFSDocument;
      return document;
    } catch (error) {
      console.error(`Error fetching memory from IPFS (CID: ${cid}):`, error);
      return null;
    }
  }

  async getAllMemories(sessionId: string): Promise<IPFSDocument[]> {
    // This would typically require an indexing service
    // For now, return empty array as IPFS doesn't support querying by session
    console.warn(
      "getAllMemories not directly supported by IPFS. Use indexing service.",
    );
    return [];
  }

  async deleteMemory(sessionId: string, memoryId: string): Promise<void> {
    // IPFS content is immutable, so we can't delete
    // This would be handled by the on-chain registry
    console.warn("Cannot delete from IPFS. Content is immutable.");
  }

  async deleteAllMemories(sessionId: string): Promise<void> {
    // IPFS content is immutable
    console.warn("Cannot delete from IPFS. Content is immutable.");
  }

  async updateMemory(
    sessionId: string,
    memoryId: string,
    content: string,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    // Create new version in IPFS
    return this.addMemory(sessionId, memoryId, content, metadata);
  }

  private async uploadToIPFS(document: IPFSDocument): Promise<string> {
    try {
      if (this.config.pinataApiKey && this.config.pinataSecretKey) {
        return await this.uploadToPinata(document);
      } else if (this.config.apiUrl && this.config.apiKey) {
        return await this.uploadToWeb3Storage(document);
      } else {
        return await this.uploadToPublicGateway(document);
      }
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  }

  private async uploadToPinata(document: IPFSDocument): Promise<string> {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: this.config.pinataApiKey!,
        pinata_secret_api_key: this.config.pinataSecretKey!,
      },
      body: JSON.stringify({
        pinataContent: document,
        pinataMetadata: {
          name: `mem0-${document.id}`,
          keyvalues: {
            sessionId: document.metadata.sessionId,
            timestamp: document.timestamp.toString(),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return result.IpfsHash;
  }

  private async uploadToWeb3Storage(document: IPFSDocument): Promise<string> {
    const url = `${this.config.apiUrl}/upload`;

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(document)], {
      type: "application/json",
    });
    formData.append("file", blob, `mem0-${document.id}.json`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }

    const result = (await response.json()) as { cid: string };
    return result.cid;
  }

  private async uploadToPublicGateway(document: IPFSDocument): Promise<string> {
    // For development/testing - simulate IPFS upload
    // In production, this would connect to a local IPFS node
    const mockCid = this.generateMockCID(document);
    console.warn(`Using mock CID for development: ${mockCid}`);
    return mockCid;
  }

  private generateMockCID(document: IPFSDocument): string {
    // Generate a deterministic mock CID based on content
    const content = JSON.stringify(document);
    const hash = this.simpleHash(content);
    return `Qm${hash.padEnd(44, "0")}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async pinCID(cid: string): Promise<void> {
    if (this.config.pinataApiKey && this.config.pinataSecretKey) {
      await this.pinWithPinata(cid);
    } else {
      console.log(`Pinning CID: ${cid} (mock)`);
    }
  }

  private async pinWithPinata(cid: string): Promise<void> {
    const url = "https://api.pinata.cloud/pinning/pinByHash";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: this.config.pinataApiKey!,
        pinata_secret_api_key: this.config.pinataSecretKey!,
      },
      body: JSON.stringify({
        hashToPin: cid,
        pinataMetadata: {
          name: `mem0-pin-${cid}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata pin failed: ${response.statusText}`);
    }
  }

  // HistoryManager interface methods
  async addHistory(
    memoryId: string,
    previousValue: string | null,
    newValue: string | null,
    action: string,
    createdAt?: string,
    updatedAt?: string,
    isDeleted?: number,
  ): Promise<void> {
    // For IPFS, we don't store traditional history as content is immutable
    // This could be implemented with a separate indexing service
    console.log(`History action ${action} for memory ${memoryId}`);
  }

  async getHistory(memoryId: string): Promise<any[]> {
    // Return empty history for IPFS-based storage
    // In production, this would query an indexing service
    return [];
  }

  async reset(): Promise<void> {
    // Cannot reset IPFS content
    console.warn("Cannot reset IPFS storage - content is immutable");
  }

  close(): void {
    // No connections to close for HTTP-based IPFS access
    console.log("IPFS Storage Manager closed");
  }
}
