import { fetchSomePools, SERVER_POOL_FETCHERS } from "#shared/pools";

export const fetchServerPoolsCached = defineCachedFunction(
  () => fetchSomePools(SERVER_POOL_FETCHERS),
  { maxAge: 2, swr: false, getKey: () => "global" },
);
