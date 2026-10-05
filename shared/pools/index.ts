import { HS_PER_THS, type TimePeriod } from "../common";
import { typedRecord } from "../util";
import { fetchB2Pool } from "./b2Pool";
import { fetchBlockvase } from "./blockvase";
import { fetchConvoy } from "./convoy";
import { fetchLazarus } from "./lazarus";
import { fetchOmegaPool } from "./omega-pool";
import { fetchPaperclipPool } from "./paperclip-pool";
import { fetchRiptide } from "./riptide";
import { fetchTerminusPool } from "./terminus-pool";

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

export type PoolFetcher = () => Promise<PoolFetchResult>;
export const CLIENT_POOL_FETCHERS = typedRecord<PoolFetcher>()({
  b2pool: fetchB2Pool,
  blockvase: fetchBlockvase,
  lazarus: fetchLazarus,
  terminusPool: fetchTerminusPool,
});
export const SERVER_POOL_FETCHERS = typedRecord<PoolFetcher>()({
  convoy: fetchConvoy,
  omegaPool: fetchOmegaPool,
  paperclipPool: fetchPaperclipPool,
  riptide: fetchRiptide,
});
export type BitcoinPoolId =
  | keyof typeof CLIENT_POOL_FETCHERS
  | keyof typeof SERVER_POOL_FETCHERS;
export type FetchedPools = Record<BitcoinPoolId, PoolFetchResult>;

export async function fetchSomePools<Id extends BitcoinPoolId>(
  fetchers: Record<Id, PoolFetcher>,
): Promise<Record<Id, PoolFetchResult>> {
  const fetcherEntries = Object.entries(fetchers) as [Id, PoolFetcher][];
  return Object.fromEntries(
    await Promise.all(
      fetcherEntries.map(([name, fetcher]) =>
        fetcher().then((fetched) => [name, fetched]),
      ),
    ),
  );
}

export function poolRevenuePerDay(pool: BitcoinPool, hashrateHS = HS_PER_THS) {
  return 0; // TODO
}
