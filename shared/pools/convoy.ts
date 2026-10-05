import Papa from "papaparse";
import type { PoolFetchResult } from ".";
import { HS_PER_THS } from "../common";
import {
  handleFetchError,
  ONE_DAY_IN_SECONDS,
  ONE_WEEK_IN_SECONDS,
} from "./util";

const INFO = { name: "CONVOY", homepage: "https://convoy.xyz/" };

export async function fetchConvoy(): Promise<PoolFetchResult> {
  const currentDate = Date.now() / 1000;
  const twentyFourHoursAgo = new Date(
    (currentDate - ONE_DAY_IN_SECONDS) * 1000,
  );
  const oneWeekAgo = new Date((currentDate - ONE_WEEK_IN_SECONDS) * 1000);

  try {
    const rawText = await $fetch(
      "https://convoy.xyz/data/csv/hashrates/pool?range=BLAKE2B",
      {
        parseResponse: (text) => text,
      },
    );
    const parsed = Papa.parse<string[]>(rawText as string, {
      skipEmptyLines: true,
    });
    const hashrate = +parsed.data.findLast((line) => line[2])![2]!;
    const blockDates = parsed.data
      .filter((line) => line[1] === "0")
      .map((line) => new Date(line[0]!));
    return {
      info: INFO,
      hashrateHS: hashrate * HS_PER_THS,
      feeMultiple: 0.01,
      stratumHashrateMultiple: 0, // Unknown; doesn't matter anyway since no skim
      stratumSkimMultiple: 0,
      blocksInPeriod: {
        "24h": blockDates.filter((date) => date >= twentyFourHoursAgo).length,
        "1w": blockDates.filter((date) => date >= oneWeekAgo).length,
        all: blockDates.length,
      },
      poolStart: blockDates[0]!.getTime(),
      connectInfo: {
        poolHost: "datum-beta1.mine.convoy.xyz",
        poolPortsByDifficulty: { 16384: 28915 },
        poolPubkey:
          "dbb11fa0c2b5403e4f798fa6071bb97e6079d219598366032fdf2ae01962b13c5e66e2be7d6b008f0b2603f3e6f6fc64768fa786c8129c46d3e30a5867734b62",
        requireV3: true,
      },
    };
  } catch (err) {
    return handleFetchError(INFO, err);
  }
}
