import {
  fetchSomePools,
  type PoolFetcher,
  type ServerPoolId,
} from "#shared/pools";
import { fetchConvoy } from "#shared/pools/convoy";
import { fetchOmegaPool } from "#shared/pools/omega-pool";
import { fetchPaperclipPool } from "#shared/pools/paperclip-pool";
import { fetchRiptide } from "#shared/pools/riptide";

const SERVER_POOL_FETCHERS: Record<ServerPoolId, PoolFetcher> = {
  convoy: fetchConvoy,
  omegaPool: fetchOmegaPool,
  paperclipPool: fetchPaperclipPool,
  riptide: fetchRiptide,
};

export const fetchServerPoolsCached = defineCachedFunction(
  () => fetchSomePools(SERVER_POOL_FETCHERS),
  { maxAge: 2, swr: false, getKey: () => "global" },
);
