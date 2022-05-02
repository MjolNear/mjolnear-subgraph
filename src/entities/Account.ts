import {Account} from "../../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {BIG_INT_ONE, Maybe} from "../types";
import {bigIntMax} from "../utils";

function createAccount(accountId: string): Account {
    const account = new Account(accountId)
    account.listed = BigInt.zero()
    account.sales = BigInt.zero()
    account.purchases = BigInt.zero()
    account.spent = BigDecimal.zero()
    account.earned = BigDecimal.zero()
    account.save()
    return account
}

export function getOrCreateAccount(accountId: string): Account {
    let account = Account.load(accountId)
    if (!account) {
        account = createAccount(accountId)
    }

    return account
}

export function updateAccountListings(
    account: Maybe<Account>,
    amount: BigInt
): void {
    if (account) {
        account.listed = account.listed.plus(amount)
        account.save()
    }
}

export function increaseAccountPurchases(
    account: Maybe<Account>,
    purchasePrice: string
): void {
    if (account) {
        account.purchases = account.purchases.plus(BIG_INT_ONE)
        account.spent = account.spent.plus(BigDecimal.fromString(purchasePrice))
        account.save()
    }
}

export function increaseAccountSales(
    account: Maybe<Account>,
    salePrice: Maybe<string>
): void {
    if (account) {
        account.sales = account.sales.plus(BIG_INT_ONE)
        if (salePrice) {
            account.earned = account.earned.plus(BigDecimal.fromString(salePrice))

            const highestSale = account.highestSale
            if (highestSale) {
                account.highestSale = bigIntMax(highestSale, BigInt.fromString(salePrice))
            } else {
                account.highestSale = BigInt.fromString(salePrice)
            }
        }
        account.save()
    }
}