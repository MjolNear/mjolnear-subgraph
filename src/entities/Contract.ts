import {Contract} from "../../generated/schema";
import {BIG_INT_ONE, Maybe} from "../types";
import {BigDecimal, BigInt} from "@graphprotocol/graph-ts";

export function isMarketplaceContract(contractId: string): boolean {
    // Paras marketplace
    if (contractId == "x.paras.near") {
        return true
    }

    // Mintbase stores
    if (contractId.endsWith(".mintbase1.near")) {
        return true
    }

    // Pluminute marketplace
    if (contractId == "pluminite.near") {
        return true
    }

    // MjolNear marketplace
    if (contractId == "mjol.near") {
        return true
    }

    return false
}

function createContract(
    contractId: string,
    name: Maybe<string>,
    isVerified: boolean
): Contract {
    const contract = new Contract(contractId)

    // Auto Mintbase stores verification
    if (contractId.endsWith(".mintbase1.near")) {
        contract.name = contractId.replace(".mintbase1.near", "")
        contract.isVerified = true
    } else {
        contract.name = name
        contract.isVerified = isVerified
    }

    contract.listed = BigInt.zero()
    contract.volume = BigInt.zero()
    contract.sales = BigInt.zero()
    contract.average = BigDecimal.zero()
    contract.save()
    return contract
}

export function updateContract(
    contractId: string,
    name: string,
    isVerified: boolean,
): Contract {
    let contract = Contract.load(contractId)
    if (contract) {
        contract.name = name
        contract.isVerified = isVerified
        contract.save()
        return contract
    }

    return createContract(contractId, name, isVerified)
}

export function getOrCreateContract(contractId: string): Contract {
    let contract = Contract.load(contractId)
    if (!contract) {
        contract = createContract(contractId, null, false)
    }

    return contract
}

export function updateContractListings(
    contract: Maybe<Contract>,
    amount: BigInt
): void {
    if (contract) {
        contract.listed = contract.listed.plus(amount)
        contract.save()
    }
}