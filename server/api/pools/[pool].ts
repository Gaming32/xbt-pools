import { POOL_FETCHERS } from "#shared/pools";

export default defineEventHandler(async (event) => {
  const poolName = getRouterParam(event, "pool")!.toLowerCase();
  const poolFetcher = POOL_FETCHERS[poolName as keyof typeof POOL_FETCHERS];
  if (poolFetcher === undefined) {
    throw createError({
      status: 400,
      statusText: `Unknown pool ${poolName}. The following pools are recognized: ${Object.keys(POOL_FETCHERS).join(", ")}`,
    });
  }

  const result = await poolFetcher();
  setResponseStatus(event, "fetchError" in result ? 503 : 200);
  return result;
});
