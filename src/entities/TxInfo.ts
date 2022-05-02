import {BigInt, near} from "@graphprotocol/graph-ts";
import {nanosec2timestamp} from "../utils";

export class TxInfo {
    hash: string
    blockHash: string
    timestamp: BigInt
    nanosec: u64

    constructor(receipt: near.ReceiptWithOutcome) {
        this.hash = receipt.receipt.id.toBase58()
        this.blockHash = receipt.block.header.hash.toBase58()
        this.timestamp = nanosec2timestamp(receipt.block.header.timestampNanosec)
        this.nanosec = receipt.block.header.timestampNanosec
    }
}