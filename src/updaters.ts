import {DailyAccountStat, DailyCollectionStat, DailyMarketStat} from "../generated/schema";
import {bigIntMin, nanosec2dayTimestamp} from "./utils";
import {createMarketDailyStatistics} from "./factories";
import {BIG_INT_ONE, Maybe} from "./types";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";


export function updateDailyAccountStats(
    timestampNanosec: u64,
    priceSpent: string,
    priceEarned: string,
    buyerId: string,
    sellerId: string
): void {
    const dayTimestamp = nanosec2dayTimestamp(timestampNanosec)
    let buyer = DailyAccountStat.load(`${buyerId}-${dayTimestamp}`)
    if (!buyer) {
        buyer = new DailyAccountStat(`${buyerId}-${dayTimestamp}`)
        buyer.timestamp = BigInt.fromString(dayTimestamp)
        buyer.account = buyerId
        buyer.sales = BigInt.zero()
        buyer.purchases = BigInt.zero()
        buyer.earned = BigDecimal.zero()
        buyer.spent = BigDecimal.zero()
    }
    buyer.spent = buyer.spent.plus(BigDecimal.fromString(priceSpent))
    buyer.purchases = buyer.purchases.plus(BIG_INT_ONE)
    buyer.save()

    let seller = DailyAccountStat.load(`${sellerId}-${dayTimestamp}`)
    if (!seller) {
        seller = new DailyAccountStat(`${sellerId}-${dayTimestamp}`)
        seller.timestamp = BigInt.fromString(dayTimestamp)
        seller.account = sellerId
        seller.sales = BigInt.zero()
        seller.purchases = BigInt.zero()
        seller.earned = BigDecimal.zero()
        seller.spent = BigDecimal.zero()
    }
    seller.earned = seller.earned.plus(BigDecimal.fromString(priceEarned))
    seller.sales = seller.sales.plus(BIG_INT_ONE)
    seller.save()
}

export function updateDailyMarketStats(
    timestampNanosec: u64,
    price: string
): void {
    const dayTimestamp = nanosec2dayTimestamp(timestampNanosec)
    let marketStats = DailyMarketStat.load(dayTimestamp)
    if (!marketStats) {
        marketStats = createMarketDailyStatistics(dayTimestamp)
    }
    marketStats.sales = marketStats.sales.plus(BIG_INT_ONE)
    marketStats.volume = marketStats.volume.plus(BigInt.fromString(price))
    marketStats.average = marketStats.volume.toBigDecimal().div(marketStats.sales.toBigDecimal())
    marketStats.save()
}

export function updateDailyCollectionsStats(
    timestampNanosec: u64,
    collection: Maybe<string>,
    stringPrice: string
): void {
    if (collection) {

        const dayTimestamp = nanosec2dayTimestamp(timestampNanosec)
        const key = `${collection}-${dayTimestamp}`
        const price = BigInt.fromString(stringPrice)

        let dailyStats = DailyCollectionStat.load(key)

        if (!dailyStats) {
            const dailyStats = new DailyCollectionStat(key)
            dailyStats.collection = collection
            dailyStats.timestamp = BigInt.fromString(dayTimestamp)
            dailyStats.sales = BIG_INT_ONE
            dailyStats.volume = price
            dailyStats.average = price.toBigDecimal()
            dailyStats.floor = price
            dailyStats.save()
            return;
        }

        dailyStats.sales = dailyStats.sales.plus(BIG_INT_ONE)
        dailyStats.volume = dailyStats.volume.plus(price)
        dailyStats.average = dailyStats.volume.toBigDecimal().div(dailyStats.sales.toBigDecimal())
        dailyStats.floor = bigIntMin(dailyStats.floor, price)
        dailyStats.save()
    }
}