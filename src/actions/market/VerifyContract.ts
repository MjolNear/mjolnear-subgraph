import {JSON} from "../../types";
import {log, near} from "@graphprotocol/graph-ts";
import {TxInfo} from "../../entities/TxInfo";
import {updateContract} from "../../entities/Contract";

export function verifyContract(
    data: JSON,
    call: near.FunctionCallAction,
    tx: TxInfo
): void {
    const contractId = data.get("contract_id")
    const contractName = data.get("contract_name")

    if (!contractId || !contractName) {
        log.error("Verify contract resolver: Missed json fields", [])
        return
    }

    updateContract(contractId.toString(), contractName.toString(), true)
}