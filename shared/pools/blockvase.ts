import type { PoolFetchResult } from ".";
import {
  fetchPrimaryAndMempool,
  handleFetchError,
  safeHashrateDivide,
} from "./util";

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
    const [poolResponse, mempoolPool] =
      await fetchPrimaryAndMempool<PoolResponse>(
        "https://blockvase.com/api/pool",
        "blockvase",
      );
    return {
      info: INFO,
      hashrateHS: poolResponse.nethash.pool_hs,
      feeMultiple: poolResponse.pool.fee_percent / 100,
      stratum: {
        hashrateMultiple: safeHashrateDivide(
          poolResponse.nethash.sv1_hs,
          poolResponse.nethash.pool_hs,
        ),
        skimMultiple: 0,
        availability: "none",
        feeMultiple: poolResponse.pool.fee_percent / 100,
      },
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: poolResponse.status.blocks_found,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: poolResponse.pool.datum_host,
        poolPortsByDifficulty: {
          [poolResponse.status.min_difficulty]: poolResponse.pool.datum_port,
        },
        poolPubkey: poolResponse.pool.pool_pubkey,
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
