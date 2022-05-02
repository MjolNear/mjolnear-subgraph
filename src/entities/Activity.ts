import {TxInfo} from "./TxInfo";
import {Activity, MarketToken} from "../../generated/schema";
import {Maybe} from "../types";
import {BigInt} from "@graphprotocol/graph-ts";

export enum ActivityEventType {
    Buy,
    List,
    Unlist,
    Transferred,
    UpdatePrice,
    RemoveOffer,
    MakeOffer,
    AcceptOffer
}

function activityTypeToString(type: ActivityEventType): string {
    switch (type) {
        case ActivityEventType.Buy:
            return "Buy"
        case ActivityEventType.List:
            return "List"
        case ActivityEventType.Unlist:
            return "Unlist"
        case ActivityEventType.Transferred:
            return "Transferred"
        case ActivityEventType.UpdatePrice:
            return "UpdatePrice"
        case ActivityEventType.AcceptOffer:
            return "AcceptOffer"
        case ActivityEventType.MakeOffer:
            return "MakeOffer"
        case ActivityEventType.RemoveOffer:
            return "RemoveOffer"
    }
    return ""
}

export function createActivity(
    eventType: ActivityEventType,
    tx: TxInfo,
    token: MarketToken,
    buyer: Maybe<string>,
    price: Maybe<string>
): void {
    const activity = new Activity(tx.hash)

    activity.txHash = tx.hash
    activity.blockHash = tx.blockHash
    activity.timestamp = tx.timestamp

    activity.contract = token.contract
    activity.token = token.id
    activity.owner = token.owner
    activity.buyer = buyer
    activity.collection = token.collection

    activity.eventType = activityTypeToString(eventType)

    if (price) {
        activity.price = BigInt.fromString(price)
    }

    activity.save()
}