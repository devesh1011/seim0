export type Backend = "sei";
export type Network = "testnet" | "mainnet";

export interface SeiConfig {
  rpcUrl: string;
  registryAddress: string;
  accessAddress: string;
  vaultAddress: string;
  ipfsGateway: string;
  privateKey?: string; // Added privateKey support
  signer?: any; // ethers.js signer
}

// Simplified configuration for developers
export interface SimpleConfig {
  network: Network;
  privateKey?: string;
  apiKey?: string;
  signer?: any; // ethers.js signer
}

export interface MemoryOptions {
  user_id?: string;
  agent_id?: string;
  app_id?: string;
  run_id?: string;
  metadata?: Record<string, any>;
  filters?: Record<string, any>;
  page?: number;
  page_size?: number;
  timestamp?: number;
  backend?: Backend;

  // New simplified configuration
  network?: Network;
  privateKey?: string;
  apiKey?: string;
  signer?: any;

  // Legacy advanced configuration
  sei?: SeiConfig;
  customConfig?: SeiConfig;
  immutable?: boolean;
}

export enum OutputFormat {
  V1 = "v1.0",
  V1_1 = "v1.1",
}

export interface MultiModalMessages {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export interface Messages {
  role: "user" | "assistant";
  content: string | MultiModalMessages;
}

export interface Message extends Messages {}

export interface MemoryHistory {
  id: string;
  memory_id: string;
  input: Array<Messages>;
  old_memory: string | null;
  new_memory: string | null;
  user_id: string;
  categories: Array<string>;
  created_at: Date;
  updated_at: Date;
}

export interface SearchOptions extends MemoryOptions {
  limit?: number;
  threshold?: number;
  top_k?: number;
  fields?: string[];
  categories?: string[];
}

export interface MemoryData {
  memory: string;
}

export interface Memory {
  id: string;
  messages?: Array<Messages>;
  data?: MemoryData | null;
  memory?: string;
  user_id?: string;
  hash?: string;
  categories?: Array<string>;
  created_at?: Date;
  updated_at?: Date;
  memory_type?: string;
  score?: number;
  metadata?: any | null;
  owner?: string | null;
  agent_id?: string | null;
  app_id?: string | null;
  run_id?: string | null;
}

export interface MemoryUpdateBody {
  memoryId: string;
  text: string;
}

export interface SeiMemoryResult {
  txHash: string;
  cid: string;
  merkleRoot: string;
  streamId: string;
}

export interface SeiQueryResult {
  memories: Memory[];
  proof?: {
    snapshotRoot: string;
    merkleProof: string[];
    verified: boolean;
  };
}
