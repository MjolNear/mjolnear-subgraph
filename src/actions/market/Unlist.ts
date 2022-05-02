import {BIG_INT_MINUS_ONE, JSON} from "../../types";
import {log, near, store} from "@graphprotocol/graph-ts";
import {TxInfo} from "../../entities/TxInfo";
import {Account, Contract, MarketToken} from "../../../generated/schema";
import {ActivityEventType, createActivity} from "../../entities/Activity";
import {updateAccountListings} from "../../entities/Account";
import {tokenUID} from "../../entities/Token";
import {updateContractListings} from "../../entities/Contract";
import {updateMarketListings} from "../../entities/Statistics/MarketStatistics";
import {updateCollectionListings} from "../../entities/Statistics/CollectionStatistics";

export function unlist(
    data: JSON,
    call: near.FunctionCallAction,
    tx: TxInfo
): void {
    const contractId = data.get("nft_contract_id")
    const tokenId = data.get("token_id")

    if (!contractId || !tokenId) {
        log.error("Unlist resolver: Missed json fields", [])
        return
    }

    const id = tokenUID(contractId.toString(), tokenId.toString())
    const token = MarketToken.load(id)

    if (!token) {
        log.error("Cancel listing resolver: Market token {} not found", [id])
        return;
    }

    updateAccountListings(Account.load(token.owner), BIG_INT_MINUS_ONE)
    updateContractListings(Contract.load(token.contract), BIG_INT_MINUS_ONE)
    updateCollectionListings(token.collection, BIG_INT_MINUS_ONE)
    updateMarketListings(BIG_INT_MINUS_ONE)

    createActivity(
        call.methodName == "remove_old_listing"
            ? ActivityEventType.Transferred
            : ActivityEventType.Unlist,
        tx,
        token,
        null,
        null
    )

    const traits = token.traits

    if (traits) {
        for (let j = 0; j < traits.length; j++) {
            const traitKey = traits[j]
            store.remove("TokenTrait", traitKey)
        }
    }


    store.remove("MarketToken", id);
}