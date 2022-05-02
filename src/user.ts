import {User} from "../generated/schema";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";

export function createUser(userId: string): User {
    const user = new User(userId)
    user.sales = BigInt.zero()
    user.purchases = BigInt.zero()
    user.spent = BigDecimal.zero()
    user.earned = BigDecimal.zero()
    return user
}