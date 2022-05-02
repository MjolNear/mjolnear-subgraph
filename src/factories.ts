import {DailyMarketStat} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts";

export function createMarketDailyStatistics(
    dayTimestamp: string,
): DailyMarketStat {
    const statistics = new DailyMarketStat(dayTimestamp)
    statistics.sales = BigInt.zero()
    statistics.volume = BigInt.zero()
    statistics.timestamp = BigInt.fromString(dayTimestamp)
    return statistics
}