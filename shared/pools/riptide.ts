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
  local_work_fee_bps: number;
  sv1_fee_pool_pct: number;
};

type InfoResponse = {
  join: {
    pool_host: string;
    pool_port: number;
    pool_pubkey: string;
  };
};

const INFO = { name: "RIPTIDE", homepage: "https://riptide.maveth.ca/" };
const START_DATE = /* @__PURE__ */ new Date("2026-08-30T21:54:30Z").getTime(); // Block height 961914

export async function fetchRiptide(): Promise<PoolFetchResult> {
  try {
    const [statsResponse, infoResponse] = await Promise.all([
      $fetch(`${API_ROOT}/stats`) as Promise<StatsResponse>,
      $fetch(`${API_ROOT}/info`) as Promise<InfoResponse>,
    ]);
    return {
      info: INFO,
      hashrateHS: statsResponse.hashrate_hs,
      feeMultiple: statsResponse.fee_bps / MULTIPLE_PER_BPS,
      stratumHashrateMultiple: statsResponse.sv1_fee_pool_pct / 100,
      stratumSkimMultiple:
        (statsResponse.local_work_fee_bps / MULTIPLE_PER_BPS) * 0.5,
      blocksInPeriod: {
        "24h": statsResponse.blocks_last_24h,
        "1w": statsResponse.blocks_last_7d,
        all: statsResponse.blocks_all_time,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: infoResponse.join.pool_host,
        poolPortsByDifficulty: {
          2048: infoResponse.join.pool_port,
          4096: 29130,
          32768: 29121,
        },
        poolPubkey: infoResponse.join.pool_pubkey,
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
