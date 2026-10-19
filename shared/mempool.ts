import type { TimePeriod } from "./common";

export type BlockTipHeightResponse = string;

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

export type BlockFeesResponse = Array<{
  avgHeight: number;
  timestamp: number;
  avgFees: number;
}>;

export function fetchBlockTipHeight(): Promise<BlockTipHeightResponse> {
  return fetchMempool("blocks/tip/height");
}

export function fetchMiningPool(slug: string): Promise<MiningPoolResponse> {
  return fetchMempool(`v1/mining/pool/${slug}`);
}

export function fetchBlockFees(
  timePeriod: "24h" | "3d" | "1w" | "1m" | "3m" | "6m" | "1y" | "2y" | "3y",
): Promise<BlockFeesResponse> {
  return fetchMempool(`v1/mining/blocks/fees/${timePeriod}`);
}

function fetchMempool<T>(route: string): Promise<T> {
  const config = useRuntimeConfig();
  return $fetch<T, string>(`${config.public.mempoolUrl}/api/${route}`);
}
