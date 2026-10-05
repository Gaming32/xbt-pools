import { fetchSomePools, SERVER_POOL_FETCHERS } from "#shared/pools";

export default defineEventHandler(() => fetchSomePools(SERVER_POOL_FETCHERS));
