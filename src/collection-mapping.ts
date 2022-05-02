import {near} from "@graphprotocol/graph-ts"
import {createCollection} from "./actions/collection";
import {handleRemoveCollection} from "./actions/collection"

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
        createCollection(logs, receiptWithOutcome)
    } else if (methodName == "remove_collection") {
        handleRemoveCollection(logs)
    }
}