import {BigInt} from "@graphprotocol/graph-ts";

export function nanosec2millisec(nanoSeconds: u64): u64 {
    return nanoSeconds / 1_000_000 as u64
}

export function nanosec2timestamp(nanoSeconds: u64): BigInt {
    const milliseconds = nanosec2millisec(nanoSeconds)
    return BigInt.fromString(milliseconds.toString())
}

export function nanosec2date(nanoSeconds: u64): Date {
    const milliseconds = nanosec2millisec(nanoSeconds)
    const date = new Date(milliseconds)
    date.setUTCHours(0)
    date.setUTCSeconds(0)
    date.setUTCMinutes(0)
    date.setUTCMilliseconds(0)
    return date
}

export function nanosec2dayTimestamp(nanoSeconds: u64): string {
    return nanosec2date(nanoSeconds).getTime().toString()
}

export function bigIntMax(a: BigInt, b: BigInt): BigInt {
    return BigInt.compare(a, b) === 1 ? a : b
}

export function bigIntMin(a: BigInt, b: BigInt): BigInt {
    return BigInt.compare(a, b) == -1 ? a : b
}