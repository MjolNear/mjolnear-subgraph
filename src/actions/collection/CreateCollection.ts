import {ipfs, json, log, near} from "@graphprotocol/graph-ts";
import {parseData} from "../../parser";
import {Collection, CollectionMedia, CollectionTrait} from "../../../generated/schema";
import {nanosec2timestamp} from "../../utils";
import {getCollectionUID} from "../../entities/Collection";

export function createCollection(
    logs: string[],
    receipt: near.ReceiptWithOutcome
): void {
    for (let logIndex = 0; logIndex < logs.length; logIndex++) {
        let outcomeLog = logs[logIndex]

        log.info('outcome log {}', [outcomeLog])

        const data = parseData(outcomeLog);
        if (!data) {
            return;
        }

        const collectionId = data.get("collection_id")
        const contractId = data.get("collection_contract")
        const ownerId = data.get("owner_id")
        const title = data.get("title")
        const description = data.get("desc")
        const image = data.get("media")
        const reference = data.get("reference")

        if (!collectionId || !contractId || !ownerId || !title || !description || !image || !reference) {
            return
        }

        const uid = getCollectionUID(contractId.toString(), collectionId.toString())

        if (uid) {
            let collection = Collection.load(uid)
            if (!collection) {
                collection = new Collection(uid)
            }

            collection.collectionId = collectionId.toString()
            collection.contractId = contractId.toString()
            collection.ownerId = ownerId.toString()
            collection.title = title.toString()
            collection.description = description.toString()
            collection.image = image.toString()
            collection.reference = reference.isNull() ? null : reference.toString()
            collection.createdAt = nanosec2timestamp(receipt.block.header.timestampNanosec)

            const collectionReference = collection.reference
            if (collectionReference && collectionReference.length > 21) {
                const collectionMetadata = ipfs.cat(collectionReference.substring(21))
                if (collectionMetadata) {
                    const jsonMetadata = json.fromBytes(collectionMetadata).toObject()
                    if (jsonMetadata) {

                        const bannerUrl = jsonMetadata.get("bannerImage")
                        if (bannerUrl) {
                            collection.bannerImage = bannerUrl.isNull() ? null : bannerUrl.toString()
                        }

                        const media = jsonMetadata.get("media")
                        if (media) {
                            const mediaObject = new CollectionMedia(`${collectionId}-media`)
                            mediaObject.collection = collectionId.toString()
                            collection.media = mediaObject.id

                            if (!media.isNull()) {
                                const mediaJson = media.toObject()
                                const twitter = mediaJson.get("twitter")
                                if (twitter) {
                                    mediaObject.twitter = twitter.isNull() ? null : twitter.toString()
                                }
                                const telegram = mediaJson.get("telegram")
                                if (telegram) {
                                    mediaObject.telegram = telegram.isNull() ? null : telegram.toString()
                                }
                                const discord = mediaJson.get("discord")
                                if (discord) {
                                    mediaObject.discord = discord.isNull() ? null : discord.toString()
                                }
                                const website = mediaJson.get("website")
                                if (website) {
                                    mediaObject.website = website.isNull() ? null : website.toString()
                                }
                            }

                            mediaObject.save()
                        }

                        const traits = jsonMetadata.get("traits")
                        if (traits) {
                            if (!traits.isNull()) {
                                const traitsEntries = traits.toObject().entries
                                for (let i = 0; i < traitsEntries.length; i++) {
                                    const entry = traitsEntries[i]
                                    const attribute = entry.key
                                    const values = entry.value.toArray()
                                    const trait = new CollectionTrait(`${collectionId}-${attribute}`)
                                    trait.collection = collectionId.toString()
                                    trait.attribute = attribute.trim()
                                    let traitValues: string[] = []
                                    for (let j = 0; j < values.length; j++) {
                                        traitValues.push(values[j].toString().trim())
                                    }
                                    trait.values = traitValues
                                    trait.save()
                                }
                            }
                        }
                    }
                }
            }
            collection.save()
        }
    }
}