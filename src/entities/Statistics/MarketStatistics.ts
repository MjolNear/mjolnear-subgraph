import {TotalMarketStat} from "../../../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {BIG_INT_ONE} from "../../types";

const TOTAL_MARKET_STATS_KEY = "TOTAL_MARKET_STATS_KEY"

function createMarketStatistics(): TotalMarketStat {
    const stats = new TotalMarketStat(TOTAL_MARKET_STATS_KEY)
    stats.listed = BigInt.zero()
    stats.volume = BigInt.zero()
    stats.sales = BigInt.zero()
    stats.average = BigDecimal.zero()
    return stats
}

export function loadMarketStatistics(): TotalMarketStat {
    const stats = TotalMarketStat.load(TOTAL_MARKET_STATS_KEY)
    if (!stats) {
        return createMarketStatistics()
    }

    return stats
}

export function updateMarketListings(amount: BigInt): void {
    const stats = loadMarketStatistics()
    stats.listed = stats.listed.plus(amount)
    stats.save()
}

export function updateMarketStatsAfterSale(price: string): void {
    const stats = loadMarketStatistics()
    stats.listed = stats.listed.minus(BIG_INT_ONE)
    stats.sales = stats.sales.plus(BIG_INT_ONE)
    stats.volume = stats.volume.plus(BigInt.fromString(price))
    stats.average = stats.volume.toBigDecimal().div(stats.sales.toBigDecimal())
    stats.save()
}