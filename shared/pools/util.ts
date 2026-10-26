import { FetchError } from "ofetch";
import type { BitcoinPoolInfo, PoolFetchError } from ".";
import { fetchMiningPool, type MiningPoolResponse } from "../mempool";

export function handleFetchError(
  info: BitcoinPoolInfo,
  error: unknown,
): PoolFetchError {
  console.log("Error fetching pool", info.name, error);
  return {
    info,
    fetchError:
      error instanceof FetchError
        ? {
            key: "statusCode",
            params: [String(error.response?.status)],
          }
        : {
            key: "generalFetch",
            params: [
              String(
                error instanceof Error ? error.cause || error.message : error,
              ),
            ],
          },
  };
}

export function fetchPrimaryAndMempool<P>(
  primaryRoute: string,
  mempoolSlug: string,
): Promise<[P, MiningPoolResponse]> {
  return Promise.all([
    $fetch(primaryRoute) as Promise<P>,
    fetchMiningPool(mempoolSlug),
  ]);
}

export function safeHashrateDivide(num: number, den: number) {
  if (den === 0) {
    if (num !== 0) {
      console.error("Attempt to divide hashrate", num, "by 0");
    }
    return 0;
  }
  return num / den;
}

export const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
export const ONE_WEEK_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;
