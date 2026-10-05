import { POOL_FETCHERS } from "#shared/pools";

export default defineEventHandler(async () => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(POOL_FETCHERS).map(([name, fetcher]) =>
        fetcher().then((fetched) => [name, fetched]),
      ),
    ),
  );
});
