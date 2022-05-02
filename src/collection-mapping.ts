import {near} from "@graphprotocol/graph-ts"
import {create} from "./actions/collection";
import {remove} from "./actions/collection"

export function handleReceipt(
    receipt: near.ReceiptWithOutcome
): void {
    const actions = receipt.receipt.actions;
    for (let i = 0; i < actions.length; i++) {
        handleAction(actions[i], receipt)
    }
}

function handleAction(
    action: near.ActionValue,
    receiptWithOutcome: near.ReceiptWithOutcome
): void {
    if (action.kind != near.ActionKind.FUNCTION_CALL) {
        return;
    }
    const logs = receiptWithOutcome.outcome.logs;
    const functionCall = action.toFunctionCall();
    const methodName = functionCall.methodName

    if (methodName == "create_collection" || methodName == "add_collection") {
        create(logs, receiptWithOutcome)
    } else if (methodName == "remove_collection_dev") {
        remove(logs)
    }
}