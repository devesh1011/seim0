import { MemoryClient } from "./seim0";
import type * as MemoryTypes from "./seim0.types";

// Re-export Sei-related types from mem0.types
export type {
  MemoryOptions,
  Memory,
  MemoryHistory,
  MemoryUpdateBody,
  SearchOptions,
  Messages,
  Message,
  SeiConfig,
} from "./seim0.types";

// Export the main Sei client
export { MemoryClient };
export default MemoryClient;
