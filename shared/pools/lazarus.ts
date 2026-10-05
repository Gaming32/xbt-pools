import type { PoolFetchResult } from ".";
import { HS_PER_GHS } from "../common";
import { fetchPrimaryAndMempool, handleFetchError } from "./util";

type PoolResponse = {
  fees: {
    datum_percent: number;
    datum_rebate_percent: number;
  };
  pool_hr_ghs: number;
  stratum_hr_percent: number;
  blocks_found: number;
  datum: {
    pool_host: string;
    pool_port: number;
    pool_pubkey: string;
  };
};

const INFO = { name: "Lazarus", homepage: "https://pool.lazarus-xbt.xyz/" };
const START_DATE = /* @__PURE__ */ new Date("2026-08-31T02:08:12Z").getTime(); // Block height 962017

export async function fetchLazarus(): Promise<PoolFetchResult> {
  try {
    const [poolResponse, mempoolPool] =
      await fetchPrimaryAndMempool<PoolResponse>(
        "https://pool.lazarus-xbt.xyz/api/pool",
        "lazarus",
      );
    return {
      info: INFO,
      hashrateHS: poolResponse.pool_hr_ghs * HS_PER_GHS,
      feeMultiple: poolResponse.fees.datum_percent / 1000,
      stratumHashrateMultiple: poolResponse.stratum_hr_percent / 100,
      stratumSkimMultiple: poolResponse.fees.datum_rebate_percent / 100,
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: poolResponse.blocks_found,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: poolResponse.datum.pool_host,
        poolPortsByDifficulty: { 1024: poolResponse.datum.pool_port },
        poolPubkey: poolResponse.datum.pool_pubkey,
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
