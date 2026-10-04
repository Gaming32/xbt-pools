import { HS_PER_THS, type TimePeriod } from "../common";
import { fetchBlockvase } from "./blockvase";
import { fetchConvoy } from "./convoy";
import { fetchOmegaPool } from "./omega-pool";
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
  };
  minDifficulty: number;
};

export type PoolFetchError = {
  info: BitcoinPoolInfo;
  fetchError: string;
};

export type PoolFetchResult = BitcoinPool | PoolFetchError;

export type BitcoinPoolId = "blockvase" | "convoy" | "omegaPool" | "riptide";
export const POOL_FETCHERS: Record<
  BitcoinPoolId,
  () => Promise<PoolFetchResult>
> = {
  blockvase: fetchBlockvase,
  convoy: fetchConvoy,
  omegaPool: fetchOmegaPool,
  riptide: fetchRiptide,
};
export type FetchedPools = Record<BitcoinPoolId, PoolFetchResult>;

export function poolRevenuePerDay(pool: BitcoinPool, hashrateHS = HS_PER_THS) {
  return 0; // TODO
}
