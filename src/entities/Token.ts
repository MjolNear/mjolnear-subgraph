export function tokenUID(
    contractId: string,
    tokenId: string
): string {
    return `${contractId}:${tokenId}`
}