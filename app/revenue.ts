import type { BitcoinPool } from "#shared/pools";
import { HS_PER_THS, COIN, type TimePeriod } from "#shared/common";

export type RevenuePerDayOptions = {
  nextBlockHeight?: number;
  luckPeriod?: TimePeriod;
  hashrateHS?: number;
  blockFee?: number;
};

export function poolRevenuePerDay(
  pool: BitcoinPool,
  {
    // Can use default of 0 because ultimately this value is just used to scale the output value (when you distribute
    // the equation)
    nextBlockHeight = 0,
    luckPeriod = "1w",
    hashrateHS = HS_PER_THS,
    blockFee = 0,
  }: RevenuePerDayOptions = {},
) {
  const blocksPerDay =
    pool.blocksInPeriod[luckPeriod] / daysInTimePeriod(pool, luckPeriod);
  const baseBlockReward = subsidyFromHeight(nextBlockHeight) + blockFee;
  const datumBlockReward =
    baseBlockReward * (1 - pool.feeMultiple) +
    baseBlockReward * pool.stratumHashrateMultiple * pool.stratumSkimMultiple;

  const poolShare = hashrateHS / (pool.hashrateHS + hashrateHS);
  return datumBlockReward * poolShare * blocksPerDay;
}

function subsidyFromHeight(height: number): number {
  return Math.floor((50 * COIN) / 2 ** Math.floor(height / 210_000));
}

function daysInTimePeriod(pool: BitcoinPool, period: TimePeriod) {
  switch (period) {
    case "24h":
      return 1;
    case "1w":
      return 7;
    case "all": {
      const seconds = new Date().getTime() - pool.poolStart;
      return seconds / 1000 / 60 / 60 / 24;
    }
  }
}
