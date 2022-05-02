import {log, near} from "@graphprotocol/graph-ts";
import {TxInfo} from "../../entities/TxInfo";
import {parseDataArray} from "../../parser";
import {ActivityEventType, createActivity} from "../../entities/Activity";
import {Account, MarketToken} from "../../../generated/schema";
import {tokenUID} from "../../entities/Token";

export function buy(
    receipt: near.ReceiptWithOutcome
): void {


    const tx = new TxInfo(receipt)

    for (let logIndex = 0; logIndex < receipt.outcome.logs.length; logIndex++) {
        let outcomeLog = receipt.outcome.logs[logIndex]
            .replace("EVENT_JSON:", "")
            .replace("Transfer OK.", "")

        log.info("{} log: {}", ["NFT Transfer", outcomeLog])

        const data = parseDataArray(outcomeLog);
        if (!data) {
            log.error("NFT Transfer handler: Parse data error [{}] in {}", [outcomeLog, "NFT transfer method"])
            return;
        }

        if (data.length === 0) {
            log.error("NFT Transfer handler: Transfer outcome has no logs.", [])
        }

        const transferData = data[0].toObject()


        // [{
        //   "old_owner_id": "dashsesh.near",
        //   "new_owner_id": "sunstrike.near",
        //   "token_ids": [
        //     "828"
        //   ]
        // }]

        const oldOwner = transferData.get("old_owner_id")
        const newOwner = transferData.get("new_owner_id")
        const tokens = transferData.get("token_ids")

        if (!oldOwner || !newOwner || !tokens || tokens.toArray().length === 0) {
            log.error("NFT Transfer resolver: Missed json fields", [])
            return;
        }

        const tokenId = tokens.toArray()[0]

        const token = MarketToken.load(
            tokenUID(receipt.receipt.predecessorId, tokenId.toString())
        )

        if (!token) {
            log.error("NFT Transfer resolver error. Token not found.", [])
            return;
        }

        createActivity(
            ActivityEventType.Transferred,
            new TxInfo(receipt),
            token,
            newOwner.toString(),
            null
        )
    }
}