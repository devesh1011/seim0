// Main seim0 exports - Decentralized Memory on Sei Blockchain

// Re-export client functionality (main interface)
export { MemoryClient } from "./client";
export type {
  MemoryOptions,
  Memory,
  MemoryHistory,
  MemoryUpdateBody,
  SearchOptions,
  Messages,
  Message,
  SeiConfig,
} from "./client";

// Re-export OSS functionality for local/custom usage
export * as OSS from "./oss";

// Default export is the client
export { MemoryClient as default } from "./client";
