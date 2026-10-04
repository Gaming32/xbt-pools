import type { TimePeriod } from "./common";

export type BlockTipHeightResponse = number;

export type MiningPoolResponse = {
  pool: {
    id: number;
    name: string;
    link: string;
    addresses: string[];
    regexes: string[];
    slug: string;
  };
  blockCount: Record<TimePeriod, number>;
  blockShare: Record<TimePeriod, number>;
  estimatedHashrate: number;
  reportedHashrate: null;
};

export type MempoolBlocksFeesResponse = Array<{
  blockSize: number;
  blockVSize: number;
  nTx: number;
  totalFees: number;
  medianFee: number;
  feeRange: number[];
}>;

export function fetchBlockTipHeight(): Promise<BlockTipHeightResponse> {
  return fetchMempool("blocks/tip/height");
}

export function fetchMiningPool(slug: string): Promise<MiningPoolResponse> {
  return fetchMempool(`v1/mining/pool/${slug}`);
}

export function fetchMempoolBlocksFees(): Promise<MempoolBlocksFeesResponse> {
  return fetchMempool("v1/fees/mempool-blocks");
}

function fetchMempool<T>(route: string): Promise<T> {
  const config = useRuntimeConfig();
  return $fetch(`${config.public.mempoolUrl}/api/${route}`);
}
