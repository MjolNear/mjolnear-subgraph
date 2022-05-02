import {near} from "@graphprotocol/graph-ts"
import {JSON, Maybe} from "./types";
import {TxInfo} from "./entities/TxInfo";

import {baseHandler} from "./actions/BaseHandler"

import {buy, unlist, list, updatePrice, verifyContract} from "./actions/market";


export function handleReceipt(
    receipt: near.ReceiptWithOutcome
): void {
    const actions = receipt.receipt.actions;
    for (let i = 0; i < actions.length; i++) {
        handleMarketAction(actions[i], receipt)
    }
}

function handleMarketAction(
    action: near.ActionValue,
    receiptWithOutcome: near.ReceiptWithOutcome
): void {

    if (action.kind != near.ActionKind.FUNCTION_CALL) {
        return;
    }

    const functionCall = action.toFunctionCall();
    const methodName = functionCall.methodName

    let handler: Maybe<(data: JSON, call: near.FunctionCallAction, tx: TxInfo) => void> = null

    if (methodName == "remove_from_market" || methodName == "remove_old_listing") {
        handler = unlist
    }
    if (methodName == "nft_on_approve") {
        handler = list
    }
    if (methodName == "resolve_purchase" || methodName == "resolve_purchase_no_payouts") {
        handler = buy
    }
    if (methodName == "update_token_price") {
        handler = updatePrice
    }
    if (methodName == "verify_contract") {
        handler = verifyContract
    }

    if (handler) {
        baseHandler(receiptWithOutcome, functionCall, handler)
    }
}