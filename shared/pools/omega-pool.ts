import type { PoolFetchResult } from ".";
import { MULTIPLE_PER_BPS } from "../common";
import { fetchPrimaryAndMempool, handleFetchError } from "./util";

type StatsResponse = {
  pool: {
    fee_bps: number;
    min_difficulty: number;
    datum_port: number;
    pubkey: string;
  };
  hashrate: {
    pool_hs: number;
  };
  blocks: {
    found: number;
  };
};

const INFO = { name: "OmegaPool", homepage: "https://omegapool.tech/" };
const START_DATE = /* @__PURE__ */ new Date("2026-08-30T19:06:56Z").getTime(); // Block height 961866

export async function fetchOmegaPool(): Promise<PoolFetchResult> {
  try {
    const [statsResponse, mempoolPool] =
      await fetchPrimaryAndMempool<StatsResponse>(
        "https://omegapool.tech/stats.json",
        "omegapool",
      );
    return {
      info: INFO,
      hashrateHS: statsResponse.hashrate.pool_hs,
      feeMultiple: statsResponse.pool.fee_bps / MULTIPLE_PER_BPS,
      stratum: {
        hashrateMultiple: 0,
        skimMultiple: 0,
        availability: "none",
        feeMultiple: statsResponse.pool.fee_bps / MULTIPLE_PER_BPS,
      },
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: statsResponse.blocks.found,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: "omegapool.tech",
        poolPortsByDifficulty: {
          [statsResponse.pool.min_difficulty]: statsResponse.pool.datum_port,
        },
        poolPubkey: statsResponse.pool.pubkey,
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
