# Public statistics

`GET /api/v1/public/stats` provides anonymous platform aggregates without
authentication. It is the data source for the app's public statistics page.
There is no dedicated per-user impact-reporting API or carbon-credit export API.

```sh
curl --fail-with-body https://wastefi-backend.onrender.com/api/v1/public/stats
```

The successful response is `{ "success": true, "data": … }` with the following
fields inside `data`:

| Field | Meaning |
| --- | --- |
| `generatedAt` | ISO timestamp of the aggregate snapshot |
| `currency` | `KES` for collection estimates |
| `totals.activeCollectors` | Number of active collector accounts |
| `totals.activeCollectionPoints` | Number of active collection points |
| `totals.collectionsRecorded` | All recorded collections |
| `totals.collectionsVerified` | Reviewed collections excluding `paymentStatus = CANCELLED` |
| `totals.verifiedWeightKg` | Sum of those collections' weight in kilograms |
| `totals.verifiedValue` | Sum of their KES estimates; not proof of cash payout |
| `byMaterial` | Up to eight entries with `materialType`, `collections`, `weightKg`, ordered by weight |
| `recentVerified` | Up to five entries with `materialType`, `weightKg`, `city`, `verifiedAt`, nullable `onChainTxHash` |
| `onChain.network`, `onChain.explorerUrl` | Configured Stellar network and explorer base URL |
| `onChain.collectionsPaid` | Collections whose stored `chainStatus` is `PAID` |
| `onChain.wasteMinted` | Sum of stored paid collections' `chainAmount`, converted from base units to WASTE |

The service caches the snapshot for 30 seconds and sends
`Cache-Control: public, max-age=30`. It does not query the ledger for every
request; paid totals come from backend records of completed chain work. The
wallet endpoint reads the token contract directly when you need an individual's
current balance.

The response has no collector names, phone numbers or user IDs. Demo-seeded
activity can contribute to these figures. Weight and token totals are not
audited field impact, certified CO2 savings or tradeable carbon credits. There
are no date-range, collector or material filter parameters on this endpoint.

Source: [public router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/public.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/public.controller.ts)
and [statistics service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/public-stats.service.ts).
