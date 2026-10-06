import type { BitcoinPool } from "#shared/pools";
import { HS_PER_THS, type TimePeriod } from "#shared/common";

export function poolRevenuePerDay(
  pool: BitcoinPool,
  luckPeriod: TimePeriod = "1w",
  hashrateHS: number = HS_PER_THS,
) {
  const blockSubsidy = 312_500_000; // TODO
  const blockFees = 0; // TODO

  const blocksPerDay =
    pool.blocksInPeriod[luckPeriod] / daysInTimePeriod(pool, luckPeriod);
  const baseBlockReward = blockSubsidy + blockFees;
  const datumBlockReward =
    baseBlockReward * (1 - pool.feeMultiple) +
    baseBlockReward * pool.stratumHashrateMultiple * pool.stratumSkimMultiple;

  const poolShare = hashrateHS / (pool.hashrateHS + hashrateHS);
  return datumBlockReward * poolShare * blocksPerDay;
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
