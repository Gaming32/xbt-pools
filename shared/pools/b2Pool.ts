import type { PoolFetchResult } from ".";
import { fetchMiningPool } from "../mempool";
import { findBestPing } from "../util";
import { handleFetchError } from "./util";

type VarDiffCompatiblePort = {
  protocol: "stratum-v1" | "stratum-v2" | "datum";
  varDiff: {
    minDiff: number;
  };
};

type PoolPort =
  | VarDiffCompatiblePort
  | {
      protocol: "stratum-v2-jd";
    };

type PoolResponse = {
  pool: {
    ports: Record<number, PoolPort>;
    hosts: string[];
    poolStats: {
      poolHashrate: number;
    };
    totalBlocks: number;
    blocksLast24h: number;
  };
};

const INFO = { name: "B2Pool", homepage: "https://b2pool.io/" };
const START_DATE = /* @__PURE__ */ new Date("2026-09-07T00:49:06Z").getTime(); // Block height 968704

export async function fetchB2Pool(): Promise<PoolFetchResult> {
  try {
    const fetchPoolAndPing = async () => {
      const pool: PoolResponse = await $fetch(
        "https://b2pool.io/api/v1/public/pools/btcb2",
      );
      const bestHost = await findBestPing(
        pool.pool.hosts.map((host) => "https://" + host),
      ).then((result) => {
        if (result === null) {
          return pool.pool.hosts[0]!;
        }
        return result.url.substring(8); // Strip the "https://"
      });
      return [pool, bestHost] as const;
    };
    const [[poolResponse, bestHost], mempoolPool] = await Promise.all([
      fetchPoolAndPing(),
      fetchMiningPool("b2pool"),
    ]);
    return {
      info: INFO,
      hashrateHS: poolResponse.pool.poolStats.poolHashrate,
      feeMultiple: 0.01,
      stratumHashrateMultiple: 0, // Unknown; doesn't matter anyway since no skim
      stratumSkimMultiple: 0,
      blocksInPeriod: {
        ...mempoolPool.blockCount,
        "24h": poolResponse.pool.blocksLast24h,
        all: poolResponse.pool.totalBlocks,
      },
      poolStart: START_DATE,
      connectInfo: {
        poolHost: bestHost,
        poolPortsByDifficulty: Object.fromEntries(
          Object.entries(poolResponse.pool.ports)
            .filter(
              (entry): entry is [string, VarDiffCompatiblePort] =>
                entry[1].protocol === "datum",
            )
            .map(([port, info]) => [info.varDiff.minDiff, +port] as const)
            .sort(([diffA], [diffB]) => diffA - diffB),
        ),
        poolPubkey:
          "8ba1f7693d117620b1e5a46828f1cd187efe81114e9cee6a063bfbbe2f1b6cff0fc681d3c1ca7cb19c0e0dbddfbea65d5509e974e7f0000112dd07cba744a716",
        requireV3: false,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
