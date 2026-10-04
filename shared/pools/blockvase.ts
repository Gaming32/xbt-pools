import type { PoolFetchResult } from ".";
import { fetchMiningPool } from "../mempool";
import { handleFetchError } from "./util";

type PoolResponse = {
  nethash: {
    pool_hs: number;
    sv1_hs: number;
  };
  pool: {
    datum_host: string;
    datum_port: number;
    fee_percent: number;
    pool_pubkey: string;
  };
  status: {
    blocks_found: number;
    min_difficulty: number;
  };
};

const INFO = { name: "Blockvase", homepage: "https://blockvase.com/#pool" };
const START_DATE = /* @__PURE__ */ new Date("2026-09-13T16:35:34Z").getTime(); // Block height 971879

export async function fetchBlockvase(): Promise<PoolFetchResult> {
  try {
    const [poolResponse, mempoolPool] = await Promise.all([
      $fetch("https://blockvase.com/api/pool") as Promise<PoolResponse>,
      fetchMiningPool("blockvase"),
    ]);
    return {
      info: INFO,
      hashrateHS: poolResponse.nethash.pool_hs,
      feeMultiple: poolResponse.pool.fee_percent / 100,
      stratumHashrateMultiple:
        poolResponse.nethash.sv1_hs / poolResponse.nethash.pool_hs,
      stratumSkimMultiple: 0,
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: poolResponse.status.blocks_found,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: poolResponse.pool.datum_host,
        poolPort: poolResponse.pool.datum_port,
        poolPubkey: poolResponse.pool.pool_pubkey,
      },
      minDifficulty: poolResponse.status.min_difficulty,
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
