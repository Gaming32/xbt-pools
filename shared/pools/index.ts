import { HS_PER_THS, type TimePeriod } from "../common";
import { fetchB2Pool } from "./b2Pool";
import { fetchBlockvase } from "./blockvase";
import { fetchConvoy } from "./convoy";
import { fetchLazarus } from "./lazarus";
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
    poolPortsByDifficulty: Record<number, number>;
    poolPubkey: string;
    requireV3: boolean;
  };
};

export type PoolFetchError = {
  info: BitcoinPoolInfo;
  fetchError: string;
};

export type PoolFetchResult = BitcoinPool | PoolFetchError;

export const POOL_FETCHERS = {
  b2pool: fetchB2Pool,
  blockvase: fetchBlockvase,
  convoy: fetchConvoy,
  lazarus: fetchLazarus,
  omegaPool: fetchOmegaPool,
  paperclipPool: fetchPaperclipPool,
  riptide: fetchRiptide,
};
export type FetchedPools = Record<keyof typeof POOL_FETCHERS, PoolFetchResult>;

export function poolRevenuePerDay(pool: BitcoinPool, hashrateHS = HS_PER_THS) {
  return 0; // TODO
}
