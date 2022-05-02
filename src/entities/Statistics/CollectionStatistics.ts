import {BIG_INT_ONE, Maybe} from "../../types";
import {loadCollectionByUID} from "../Collection";
import {BigInt} from "@graphprotocol/graph-ts";
import {bigIntMax} from "../../utils";

export function updateCollectionStatsAfterSale(
    uid: Maybe<string>,
    price: string
): void {
    const collection = loadCollectionByUID(uid)
    if (collection) {
        const bigIntPrice = BigInt.fromString(price)
        collection.listed = collection.listed.minus(BIG_INT_ONE)
        collection.sales = collection.sales.plus(BIG_INT_ONE)
        collection.volume = collection.volume.plus(bigIntPrice)
        collection.average = collection.volume.toBigDecimal().div(collection.sales.toBigDecimal())

        const highestSale = collection.highestSale
        if (highestSale) {
            collection.highestSale = bigIntMax(bigIntPrice, highestSale)
        } else {
            collection.highestSale = bigIntPrice
        }

        collection.save()
    }
}