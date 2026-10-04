import { HS_PER_THS, type TimePeriod } from "../common";
import { fetchBlockvase } from "./blockvase";
import { fetchConvoy } from "./convoy";
import { fetchOmegaPool } from "./omega-pool";
import { fetchPaperclipPool } from "./paperclip-pool";
import { fetchRiptide } from "./riptide";

export type DatumConnectInfo = {
  pool_host: string;
  pool_port: number;
  pool_pubkey: string;
};

export type BitcoinPoolInfo = {
  name: string;
  homepage: string;
};

export type BitcoinPool = {
  info: BitcoinPoolInfo;
  hashrateHS: number;
  feeMultiple: number;
  stratumHashrateMultiple: number;
  stratumSkimMultiple: number;
  blocksInPeriod: Record<TimePeriod, number>;
  poolStart: number;
  connectInfo: {
    poolHost: string;
    poolPort: number;
    poolPubkey: string;
    requireV3: boolean;
  };
  minDifficulty: number;
};

export type PoolFetchError = {
  info: BitcoinPoolInfo;
  fetchError: string;
};

export type PoolFetchResult = BitcoinPool | PoolFetchError;

export const POOL_FETCHERS = {
  blockvase: fetchBlockvase,
  convoy: fetchConvoy,
  omegaPool: fetchOmegaPool,
  paperclipPool: fetchPaperclipPool,
  riptide: fetchRiptide,
};
export type FetchedPools = Record<keyof typeof POOL_FETCHERS, PoolFetchResult>;

export function poolRevenuePerDay(pool: BitcoinPool, hashrateHS = HS_PER_THS) {
  return 0; // TODO
}
