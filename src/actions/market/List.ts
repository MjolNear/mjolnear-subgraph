import {BIG_INT_ONE, JSON} from "../../types";
import {BigInt, json, log, near} from "@graphprotocol/graph-ts";
import {getCollectionUID, getOrCreateCollection} from "../../entities/Collection";
import {MarketToken, SavedToken, TokenTrait} from "../../../generated/schema";
import {getOrCreateAccount, updateAccountListings} from "../../entities/Account";
import {TxInfo} from "../../entities/TxInfo";
import {ActivityEventType, createActivity} from "../../entities/Activity";
import {tokenUID} from "../../entities/Token";
import {getOrCreateContract, updateContractListings} from "../../entities/Contract";
import {updateMarketListings} from "../../entities/Statistics/MarketStatistics";

export function list(
    data: JSON,
    call: near.FunctionCallAction,
    tx: TxInfo
): void {
    const contractId = data.get("nft_contract_id")
    const tokenId = data.get("token_id")
    const jsonToken = data.get("json_nft")

    if (!contractId || !tokenId || !jsonToken) {
        return;
    }

    const tokenObject = json.try_fromString(jsonToken.toString())
    if (!tokenObject.isOk) {
        log.error("List resolver: JSON NFT parse error", [])
        return
    }

    const nft = tokenObject.value.toObject()

    const title = nft.get("title")
    const description = nft.get("description")
    const media = nft.get("media_url")
    const ownerId = nft.get("owner_id")
    const copies = nft.get("copies")
    const reference = nft.get("reference_url")
    const price = nft.get("price")
    const collectionMetadata = nft.get("collection_metadata")
    const traits = nft.get("traits")

    let collectionId: string | null = null
    let collectionName: string | null = null

    if (collectionMetadata && !collectionMetadata.isNull()) {
        const collectionObject = collectionMetadata.toObject()
        const optionalCollectionId = collectionObject.get("collection_id")
        const optionalCollectionName = collectionObject.get("collection_name")
        if (optionalCollectionId && optionalCollectionName) {
            collectionId = optionalCollectionId.toString()
            collectionName = optionalCollectionName.toString()
        }
    }

    if (!title || !media || !reference || !description || !copies || !ownerId || !price) {
        log.error("Place on market resolver: Missed json fields", [])
        return;
    }

    const id = tokenUID(contractId.toString(), tokenId.toString())

    const savedToken = new SavedToken(id)
    savedToken.tokenId = tokenId.toString()
    savedToken.contract = contractId.toString()
    savedToken.title = title.toString()
    savedToken.description = description.isNull()
        ? null
        : description.toString()

    savedToken.copies = copies.isNull()
        ? null
        : BigInt.fromString(copies.toString())

    savedToken.reference = reference.isNull()
        ? null
        : reference.toString()

    savedToken.media = media.toString()
    savedToken.collection = getCollectionUID(contractId.toString(), collectionId)
    savedToken.collectionTitle = collectionName
    savedToken.save()


    const exists = MarketToken.load(id) != null

    const token = new MarketToken(id)
    token.tokenId = tokenId.toString()
    token.contract = contractId.toString()
    token.owner = ownerId.toString()
    token.title = title.toString()
    token.description = description.isNull()
        ? null
        : description.toString()

    token.copies = copies.isNull()
        ? null
        : BigInt.fromString(copies.toString())

    token.reference = reference.isNull()
        ? null
        : reference.toString()

    token.media = media.toString()
    token.price = BigInt.fromString(price.toString())
    token.collection = getCollectionUID(contractId.toString(), collectionId)
    token.collectionTitle = collectionName
    token.listingTimestamp = tx.timestamp


    if (traits && !traits.isNull()) {
        const traitsList = traits.toArray()
        for (let j = 0; j < traitsList.length; j++) {
            const trait = traitsList[j].toObject()
            const maybeAttribute = trait.get("trait_type")
            const maybeValue = trait.get("value")
            if (maybeAttribute && maybeValue) {
                const traitEntity = new TokenTrait(`${id}-${maybeAttribute.toString()}-${maybeValue.toString()}`)
                traitEntity.token = id
                traitEntity.attribute = maybeAttribute.toString()
                traitEntity.value = maybeValue.toString()
                traitEntity.save()
            }
        }
    }

    token.save()


    if (!exists) {
        updateMarketListings(BIG_INT_ONE)
        updateAccountListings(getOrCreateAccount(ownerId.toString()), BIG_INT_ONE)
        updateContractListings(getOrCreateContract(contractId.toString()), BIG_INT_ONE)

        const collection = getOrCreateCollection(contractId.toString(), collectionId, collectionName)
        if (collection) {
            collection.listed = collection.listed.plus(BIG_INT_ONE)
            collection.save()
        }
    }

    createActivity(ActivityEventType.List, tx, token, null, price.toString())
}