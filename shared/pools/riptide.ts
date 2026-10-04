import type { PoolFetchResult } from ".";
import { MULTIPLE_PER_BPS } from "../common";
import { handleFetchError } from "./util";

const API_ROOT = "https://riptide.maveth.ca/api";

type StatsResponse = {
  blocks_last_24h: number;
  blocks_last_7d: number;
  blocks_all_time: number;
  fee_bps: number;
  hashrate_hs: number;
};

type InfoResponse = {
  join: {
    pool_host: string;
    pool_port: number;
    pool_pubkey: string;
  };
};

type ContributorsResponse = Array<{
  workers: Array<{
    hashrate_hs: number;
    connection_type: "datum" | "sv1" | null;
  }>;
}>;

const INFO = { name: "RIPTIDE", homepage: "https://riptide.maveth.ca" };
const START_DATE = /* @__PURE__ */ new Date("2026-08-30T21:54:30Z").getTime(); // Block height 961914

export async function fetchRiptide(): Promise<PoolFetchResult> {
  try {
    const [statsResponse, infoResponse, contributorsResponse] =
      await Promise.all([
        $fetch(`${API_ROOT}/stats`) as Promise<StatsResponse>,
        $fetch(`${API_ROOT}/info`) as Promise<InfoResponse>,
        $fetch(
          `${API_ROOT}/contributors?limit=500`,
        ) as Promise<ContributorsResponse>,
      ]);
    return {
      info: INFO,
      hashrateHS: statsResponse.hashrate_hs,
      feeMultiple: statsResponse.fee_bps / MULTIPLE_PER_BPS,
      stratumHashrateMultiple: contributorsResponse
        .flatMap((x) => x.workers)
        .filter((x) => x.connection_type === "sv1")
        .reduce(
          (sum, { hashrate_hs }) =>
            sum + hashrate_hs / statsResponse.hashrate_hs,
          0,
        ),
      stratumSkimMultiple: 0.005,
      blocksInPeriod: {
        "24h": statsResponse.blocks_last_24h,
        "1w": statsResponse.blocks_last_7d,
        all: statsResponse.blocks_all_time,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: infoResponse.join.pool_host,
        poolPort: infoResponse.join.pool_port,
        poolPubkey: infoResponse.join.pool_pubkey,
      },
      minDifficulty: 2048,
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
