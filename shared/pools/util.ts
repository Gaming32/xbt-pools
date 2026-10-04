import { FetchError } from "ofetch";
import type { BitcoinPoolInfo, PoolFetchError } from ".";

export function handleFetchError(
  info: BitcoinPoolInfo,
  error: any,
): PoolFetchError {
  console.log("Error fetching pool", info.name, error);
  return {
    info,
    fetchError:
      error instanceof FetchError
        ? `Status code ${error.response?.status}`
        : `Failed to fetch: ${error.cause || error.message}`,
  };
}

export const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
export const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
