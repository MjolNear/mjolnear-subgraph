import {JSON} from "../../types";
import {BigInt, log, near} from "@graphprotocol/graph-ts";
import {TxInfo} from "../../entities/TxInfo";
import {MarketToken} from "../../../generated/schema";
import {ActivityEventType, createActivity} from "../../entities/Activity";
import {tokenUID} from "../../entities/Token";

export function updatePrice(
    data: JSON,
    call: near.FunctionCallAction,
    tx: TxInfo
): void {
    const contractId = data.get("nft_contract_id")
    const tokenId = data.get("token_id")
    const price = data.get("price")

    if (!contractId || !tokenId || !price) {
        log.error("Update price resolver: Missed json fields", [])
        return
    }

    const id = tokenUID(contractId.toString(), tokenId.toString())
    const token = MarketToken.load(id)

    if (!token) {
        log.error("Update price resolver: Market token {} not found", [id])
        return;
    }

    token.price = BigInt.fromString(price.toString())
    token.save()

    createActivity(ActivityEventType.UpdatePrice, tx, token, null, price.toString())
}