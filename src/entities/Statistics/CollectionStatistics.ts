import {BIG_INT_ONE, Maybe} from "../../types";
import {getCollectionUID} from "../Collection";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {bigIntMax} from "../../utils";
import {CollectionStatistic} from "../../../generated/schema";


export function getOrCreateCollectionsStatistic(
    contractId: string,
    collectionId: Maybe<string>
): Maybe<CollectionStatistic> {
    const uid = getCollectionUID(contractId, collectionId)
    if (uid) {
        let statistic = CollectionStatistic.load(uid)
        if (!statistic) {
            statistic = new CollectionStatistic(uid)
            statistic.sales = BigInt.zero()
            statistic.volume = BigInt.zero()
            statistic.average = BigDecimal.zero()
            statistic.listed = BigInt.zero()
            statistic.save()
        }
        return statistic
    }

    return null
}

function loadCollectionStatisticByUID(
    uid: Maybe<string>
): Maybe<CollectionStatistic> {
    if (uid) {
        return CollectionStatistic.load(uid)
    }

    return null
}

export function updateCollectionListings(
    uid: Maybe<string>,
    amount: BigInt
): void {
    const statistic = loadCollectionStatisticByUID(uid)
    if (statistic) {
        statistic.listed = statistic.listed.plus(amount)
        statistic.save()
    }
}

export function updateCollectionStatsAfterSale(
    uid: Maybe<string>,
    price: string
): void {
    const statistic = loadCollectionStatisticByUID(uid)
    if (statistic) {
        const bigIntPrice = BigInt.fromString(price)
        statistic.listed = statistic.listed.minus(BIG_INT_ONE)
        statistic.sales = statistic.sales.plus(BIG_INT_ONE)
        statistic.volume = statistic.volume.plus(bigIntPrice)
        statistic.average = statistic.volume.toBigDecimal().div(statistic.sales.toBigDecimal())

        const highestSale = statistic.highestSale
        if (highestSale) {
            statistic.highestSale = bigIntMax(bigIntPrice, highestSale)
        } else {
            statistic.highestSale = bigIntPrice
        }

        statistic.save()
    }
}