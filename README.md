# MjolNear NFT marketplace Subgraph

This Subgraph sources events from contracts of [MjolNear marketplace](https://mjolnear.com)  on NEAR chain.

# GraphQL API

https://api.thegraph.com/subgraphs/name/mjolnear/indexer

# Example Query

Here we have an example query for getting NFT details.

```graphql
{
    marketTokens(
        first: 1
        orderBy: listingTimestamp
        where: {
            collection: "asac.near"
        }
    )
    {
        title
        owner {
            id
        }
        collection {
            title
        }
        contract {
            id
            isVerified
        }
    }
    activities(first: 1) {
        eventType
        txHash
        timestamp
    }
}
```

# Example Response

Here we have response for the query above.

```json
{
  "data": {
    "marketTokens": [
      {
        "title": "2710",
        "owner": {
          "id": "danielto.near"
        },
        "collection": {
          "title": "Antisocial Ape Club"
        },
        "contract": {
          "id": "asac.near",
          "isVerified": true
        }
      }
    ],
    "activities": [
      {
        "eventType": "List",
        "txHash": "1LjX7NSWz3XCDP6z2vBFsHjMdtTyf9uVtcsWqXmNYsz",
        "timestamp": "1649706537056"
      }
    ]
  }
}
```