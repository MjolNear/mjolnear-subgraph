import {Maybe, MJOL_CONTRACT_ID} from "../types";
import {Collection} from "../../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {isMarketplaceContract} from "./Contract";


export function getCollectionUID(
    contractId: string,
    collectionId: Maybe<string>
): Maybe<string> {
    if (contractId == MJOL_CONTRACT_ID) {
        if (collectionId) {
            return `${contractId}-${collectionId}`
        } else {
            return null
        }
    }

    if (isMarketplaceContract(contractId)) {
        return null
    }

    return contractId
}

export function loadCollection(
    contractId: string,
    collectionId: Maybe<string>
): Maybe<Collection> {
    const uid = getCollectionUID(contractId, collectionId)
    if (uid) {
        return Collection.load(uid)
    }
    return null
}

export function createCollection(
    contractId: string,
    collectionId: Maybe<string>,
    title: Maybe<string>
): Maybe<Collection> {

    const uid = getCollectionUID(contractId, collectionId)

    if (uid) {
        const collection = new Collection(uid)
        collection.sales = BigInt.zero()
        collection.volume = BigInt.zero()
        collection.average = BigDecimal.zero()
        collection.listed = BigInt.zero()
        collection.contractId = contractId
        collection.collectionId = collectionId
        collection.title = title
        return collection
    }

    return null
}

export function getOrCreateCollection(
    contractId: string,
    collectionId: Maybe<string>,
    title: Maybe<string>
): Maybe<Collection> {
    const collection = loadCollection(contractId, collectionId)

    if (!collection) {
        return createCollection(contractId, collectionId, title)
    } else {
        if (collectionId && title) {
            collection.collectionId = collectionId
            collection.title = title
        }
    }

    return collection
}

export function updateCollectionListings(
    uid: Maybe<string>,
    amount: BigInt
): void {
    const collection = loadCollectionByUID(uid)
    if (collection) {
        collection.listed = collection.listed.plus(amount)
        collection.save()
    }
}

export function loadCollectionByUID(
    uid: Maybe<string>
): Maybe<Collection> {

    if (uid) {
        return Collection.load(uid)
    }

    return null
}