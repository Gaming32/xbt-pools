import type { ServerError, TimePeriod } from "../common";
import { fetchB2Pool } from "./b2Pool";
import { fetchBlockvase } from "./blockvase";
import { fetchLazarus } from "./lazarus";
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

export type StratumAvailability = "none" | "enforced_failover" | "available";

export type BitcoinPool = {
  info: BitcoinPoolInfo;
  hashrateHS: number;
  feeMultiple: number;
  stratum: {
    hashrateMultiple: number;
    skimMultiple: number;
    feeMultiple: number;
    availability: StratumAvailability;
  };
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
  fetchError: ServerError;
};

export type PoolFetchResult = BitcoinPool | PoolFetchError;

// The fetchers for these live in server/utils/pool-fetch.ts, to keep them out of the client bundle
export const SERVER_POOL_IDS = [
  "convoy",
  "omegaPool",
  "paperclipPool",
  "riptide",
] as const;
export type ServerPoolId = (typeof SERVER_POOL_IDS)[number];
export const CLIENT_POOL_FETCHERS = {
  b2pool: fetchB2Pool,
  blockvase: fetchBlockvase,
  lazarus: fetchLazarus,
  terminusPool: fetchTerminusPool,
};

export type PoolFetcher = () => Promise<PoolFetchResult>;
export type BitcoinPoolId = ServerPoolId | keyof typeof CLIENT_POOL_FETCHERS;
export type FetchedPools = Record<BitcoinPoolId, PoolFetchResult>;

export const BITCOIN_POOL_IDS = [
  ...SERVER_POOL_IDS,
  ...Object.keys(CLIENT_POOL_FETCHERS),
] as BitcoinPoolId[];

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
