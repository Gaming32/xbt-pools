import type { PoolFetchResult } from ".";
import { MULTIPLE_PER_BPS } from "../common";
import { fetchPrimaryAndMempool, handleFetchError } from "./util";

type StatusResponse = {
  stats: {
    pool: {
      incentives: {
        datum_bonus_bps: number;
      };
      fee_bps: number;
      min_difficulty: number;
      datum_port: number;
      pubkey: string;
    };
    hashrate: {
      pool_hs: number;
      stratum_hs: number;
    };
    mining_odds: {
      blocks_found: number;
    };
  };
};

const INFO = {
  name: "Paperclip Pool",
  homepage: "https://pool.paperclippool.xyz/",
};
const START_DATE = /* @__PURE__ */ new Date("2026-09-12T18:10:30Z").getTime(); // Block height 971713

export async function fetchPaperclipPool(): Promise<PoolFetchResult> {
  try {
    const [statusResponse, mempoolPool] =
      await fetchPrimaryAndMempool<StatusResponse>(
        "https://pool.paperclippool.xyz/api/status",
        "paperclippool",
      );
    return {
      info: INFO,
      hashrateHS: statusResponse.stats.hashrate.pool_hs,
      feeMultiple: statusResponse.stats.pool.fee_bps / MULTIPLE_PER_BPS,
      stratumHashrateMultiple:
        statusResponse.stats.hashrate.stratum_hs /
        statusResponse.stats.hashrate.pool_hs,
      stratumSkimMultiple:
        statusResponse.stats.pool.incentives.datum_bonus_bps / MULTIPLE_PER_BPS,
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: statusResponse.stats.mining_odds.blocks_found,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: "pool.paperclippool.xyz",
        poolPortsByDifficulty: {
          [statusResponse.stats.pool.min_difficulty]:
            statusResponse.stats.pool.datum_port,
        },
        poolPubkey: statusResponse.stats.pool.pubkey,
        requireV3: true,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
