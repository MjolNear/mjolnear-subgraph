import {log, store} from "@graphprotocol/graph-ts";
import {parseData} from "../../parser";

export function handleRemoveCollection(
    logs: string[],
): void {
    for (let logIndex = 0; logIndex < logs.length; logIndex++) {
        let outcomeLog = logs[logIndex]

        log.info('outcome log {}', [outcomeLog])

        const data = parseData(outcomeLog);
        if (!data) {
            return;
        }

        const collectionId = data.get("collection_id")
        if (!collectionId) {
            return;
        }

        store.remove("Collection", collectionId.toString())
        store.remove("CollectionMedia", `${collectionId}-media`)
    }
}