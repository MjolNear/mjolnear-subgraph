import {BIG_INT_MINUS_ONE, BIG_INT_ONE, JSON} from "../../types";
import {BigDecimal, log, near, store} from "@graphprotocol/graph-ts";
import {Account, Contract, MarketToken} from "../../../generated/schema";
import {updateDailyAccountStats, updateDailyCollectionsStats, updateDailyMarketStats} from "../../updaters";
import {TxInfo} from "../../entities/TxInfo";
import {getOrCreateAccount, increaseAccountPurchases, updateAccountListings} from "../../entities/Account";
import {ActivityEventType, createActivity} from "../../entities/Activity";
import {updateContractListings} from "../../entities/Contract";
import {updateMarketStatsAfterSale} from "../../entities/Statistics/MarketStatistics";
import {updateCollectionStatsAfterSale} from "../../entities/Statistics/CollectionStatistics";

export function buy(
    data: JSON,
    call: near.FunctionCallAction,
    tx: TxInfo
): void {
    const price = data.get("price")
    const buyerId = data.get("buyer_id")
    const sellerId = data.get("seller_id")
    const tokenUID = data.get("nft_uid")
    const payouts = data.get("payout")

    if (!price || !buyerId || !sellerId || !tokenUID || !payouts) {
        log.error("Buy resolver: Missed json fields", [])
        return;
    }

    const id = tokenUID.toString()
    const token = MarketToken.load(id)

    if (!token) {
        log.error("Buy resolver: Market token {} not found", [id])
        return;
    }

    const payoutEntries = payouts.toObject().entries
    for (let i = 0; i < payoutEntries.length; i++) {
        const entry = payoutEntries[i]
        const accountId = entry.key
        const payout = entry.value.toString()
        const earned = BigDecimal.fromString(payout)

        const account = getOrCreateAccount(accountId)
        account.earned = account.earned.plus(earned)

        if (sellerId && accountId == sellerId.toString()) {
            updateDailyAccountStats(
                tx.nanosec,
                price.toString(),
                payout,
                buyerId.toString(),
                sellerId.toString()
            )
            account.sales = account.sales.plus(BIG_INT_ONE)
        }
        account.save()
    }

    let buyer = getOrCreateAccount(buyerId.toString())
    increaseAccountPurchases(buyer, price.toString())

    updateContractListings(Contract.load(token.contract), BIG_INT_MINUS_ONE)
    updateAccountListings(Account.load(sellerId.toString()), BIG_INT_MINUS_ONE)

    updateMarketStatsAfterSale(price.toString())
    updateCollectionStatsAfterSale(token.collection, price.toString())

    updateDailyMarketStats(tx.nanosec, price.toString())
    updateDailyCollectionsStats(tx.nanosec, token.collection, price.toString())

    createActivity(ActivityEventType.Buy, tx, token, buyer.id, price.toString())

    store.remove("MarketToken", id);
}