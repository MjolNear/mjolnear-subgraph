import {BigInt, JSONValue, TypedMap} from "@graphprotocol/graph-ts";

export const MJOL_CONTRACT_ID = "mjol.near"

export const BIG_INT_ONE = BigInt.fromI32(1)
export const BIG_INT_MINUS_ONE = BigInt.fromI32(-1)

export type JSON = TypedMap<string, JSONValue>
export type JSONArray = Array<JSONValue>
export type Maybe<T> = T | null

