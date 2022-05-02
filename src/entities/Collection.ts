import {Maybe, MJOL_CONTRACT_ID} from "../types";
import {isMarketplaceContract} from "./Contract";


export function getCollectionUID(
    contractId: string,
    collectionId: Maybe<string>
): Maybe<string> {
    if (contractId == MJOL_CONTRACT_ID) {
        if (collectionId) {
            return `${contractId}-${collectionId}`
        } else {
            return null
        }
    }

    if (isMarketplaceContract(contractId)) {
        return null
    }

    return contractId
}