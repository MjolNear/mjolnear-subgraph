import {log, store} from "@graphprotocol/graph-ts";
import {parseData} from "../../parser";
import {getCollectionUID} from "../../entities/Collection";
import {Collection} from "../../../generated/schema";

export function remove(
    logs: string[],
): void {
    for (let logIndex = 0; logIndex < logs.length; logIndex++) {
        let outcomeLog = logs[logIndex]

        log.info('outcome log {}', [outcomeLog])

        const data = parseData(outcomeLog);
        if (!data) {
            log.error("Remove collection resolver: Error invalid data format.", [])
            return;
        }

        const collectionId = data.get("collection_id")
        const contractId = data.get("contract_id")

        if (!collectionId || !contractId) {
            log.error("Remove collection resolver: Error missed JSON fields", [])
            return;
        }

        const uid = getCollectionUID(contractId.toString(), collectionId.toString())

        if (uid) {
            const collection = Collection.load(uid)
            if (!collection) {
                log.error("Remove collection resolver: Collection doesn't exists", [])
                return;
            }

            // const mediaRef = collection.media

            // store.remove("CollectionStatistic", collection.statistics)
            // if (mediaRef) {
            //     store.remove("CollectionMedia", mediaRef)
            // }
            //
            // for (let j = 0; j < collection.traits.length; j++) {
            //     const traitKey = collection.traits[j]
            //     store.remove("CollectionTrait", traitKey)
            // }

            // for (let j = 0; j < collection.dailyStats.length; j++) {
            //     const statsKey = collection.dailyStats[j]
            //     store.remove("DailyCollectionStat", statsKey)
            // }


            store.remove("Collection", uid)
        }
    }
}