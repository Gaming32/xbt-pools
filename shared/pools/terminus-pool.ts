import type { PoolFetchResult } from ".";
import { HS_PER_THS } from "../common";
import { fetchPrimaryAndMempool, handleFetchError } from "./util";

type StatsResponse = {
  primePubkey: string;
  hashrate: number;
  shareDifficulty: number;
  blocks: number;
};

const INFO = { name: "TERMINUS POOL", homepage: "https://terminuspool.xyz/" };
const START_DATE = /* @__PURE__ */ new Date("2026-09-25T03:04:10Z").getTime(); // Block height 974025

export async function fetchTerminusPool(): Promise<PoolFetchResult> {
  try {
    const [statsResponse, mempoolPool] =
      await fetchPrimaryAndMempool<StatsResponse>(
        "https://terminuspool.xyz/api/stats",
        "terminuspool",
      );
    return {
      info: INFO,
      hashrateHS: statsResponse.hashrate * HS_PER_THS,
      feeMultiple: 0,
      stratum: {
        hashrateMultiple: 0,
        skimMultiple: 0,
        availability: "none",
        feeMultiple: 0,
      },
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        all: statsResponse.blocks,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: "datum.terminuspool.xyz",
        poolPortsByDifficulty: { [statsResponse.shareDifficulty]: 28915 },
        poolPubkey: statsResponse.primePubkey,
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
