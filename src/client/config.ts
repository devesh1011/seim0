import { SeiConfig, Network } from "./seim0.types";

export const DEFAULT_CONFIGS: Record<Network, SeiConfig> = {
  testnet: {
    rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
    registryAddress: "0xEd71E25bE660D346E05d76d478f1FD762e74ec76",
    accessAddress: "0x3027A2548f2C4D42efb44274A7e2217dedBfAdCF",
    vaultAddress: "0x86D143Cd76f012a3d68154058FEc6315e4e0487D",
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
  },
  mainnet: {
    rpcUrl: "https://evm-rpc.sei-apis.com",
    registryAddress: "0x...", // TODO: Deploy mainnet contracts
    accessAddress: "0x...", // TODO: Deploy mainnet contracts
    vaultAddress: "0x...", // TODO: Deploy mainnet contracts
    ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
  },
};

export function getNetworkConfig(network: Network): SeiConfig {
  return { ...DEFAULT_CONFIGS[network] };
}
