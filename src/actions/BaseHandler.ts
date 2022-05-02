import {log, near} from "@graphprotocol/graph-ts";
import {JSON} from "../types";
import {TxInfo} from "../entities/TxInfo";
import {parseData} from "../parser";

export function baseHandler(
    receipt: near.ReceiptWithOutcome,
    functionCall: near.FunctionCallAction,
    handler: (data: JSON, call: near.FunctionCallAction, tx: TxInfo) => void
): void {

    const tx = new TxInfo(receipt)

    for (let logIndex = 0; logIndex < receipt.outcome.logs.length; logIndex++) {
        let outcomeLog = receipt.outcome.logs[logIndex]
            .replace("EVENT_JSON:", "")
            .replace("Transfer OK.", "")

        log.info("{} log: {}", [functionCall.methodName, outcomeLog])

        const data = parseData(outcomeLog);
        if (!data) {
            log.error("Base handler: Parse data error [{}] in {}", [outcomeLog, functionCall.methodName])
            return;
        }
        handler(data, functionCall, tx)
    }
}