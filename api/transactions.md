# Collections

Waste deliveries are recorded under `/api/v1/collections`. This page retains its
old documentation URL for existing links. There is no standalone transactions
router for deliveries; [payment records](/api/payments) are a separate resource.
All collection endpoints require an access token for an active account.

## Submit a collection

`POST /api/v1/collections` records a delivery for the authenticated user.

| Field | Requirement |
| --- | --- |
| `collectionPointId` | Required ID of an existing active point |
| `materialType` | Required code from [public materials](/api/materials), such as `PET` |
| `materialCategory` | Required category from the same material record, such as `Plastic` |
| `weight` | Required number in kilograms, at least 0.1 |
| `quantity` | Optional integer, at least 1 |
| `imageUrls` | Optional array of image URL records |
| `notes` | Optional trimmed text |

```http
POST /api/v1/collections
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "collectionPointId": "REPLACE_WITH_AN_ACTIVE_POINT_ID",
  "materialType": "PET",
  "materialCategory": "Plastic",
  "weight": 5.5
}
```

Fetch a real point ID first; the placeholder above is not a usable database ID.
The API calculates `paymentAmount` in KES and returns HTTP 201 with the collection
in `data`. Do not send `collectorId`, a payout amount or chain identifiers. The
pricing helper currently accepts unknown codes with a fallback price, so clients
must use the published list instead of treating that fallback as a supported material.

## Read collections

| Method | Path | Access | Response |
| --- | --- | --- | --- |
| GET | `/api/v1/collections/me` | Active account, own history | `data`, `pagination`, `summary` |
| GET | `/api/v1/collections/:id` | Owner, `ADMIN`, `VERIFIER` or `COLLECTION_POINT` | Collection in `data`; 404 if absent, 403 for another collector's record |
| GET | `/api/v1/collections` | `ADMIN`, `COLLECTION_POINT` or `VERIFIER` | Filtered `data` and `pagination` |

Both list routes accept `page` (default 1) and `limit` (default 20, range 1 to
100). The staff list also accepts `collectorId`, `collectionPointId` (UUIDs),
`materialType` (case-insensitive partial match), `status` (filters
`paymentStatus`), `verified` (boolean), and ISO 8601 `startDate`, `endDate`
(filter creation time). `status` values are `PENDING`, `PROCESSING`, `COMPLETED`,
`FAILED` and `CANCELLED`.

For the unreviewed queue, use:

```http
GET /api/v1/collections?verified=false&page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

`verified=false` means no review timestamp and sorts oldest first. `verified=true`
means reviewed, including rejected records; it is not an approval-only filter.
Other lists sort newest first. Collection point operators are restricted to their
assigned active point. A filter naming another point returns 403; a foreign
collection ID returns 404. Admins and central verifiers retain platform review
access. Unassigned operators receive 403 with `COLLECTION_POINT_REQUIRED`;
operators assigned to an inactive point receive `COLLECTION_POINT_INACTIVE`.
Administrators manage assignments through the [users API](/api/users#admin-user-actions).

Staff list responses include a sibling `scope`: either
`{"mode":"assigned_point","point":{"id":"...","name":"..."}}` for an operator
or `{"mode":"platform","point":null}` for central staff. This describes the
server-enforced access scope; additional list filters still apply.

The own-history `summary` contains `totalCollections`, `totalWeight` and
`totalEarnings`, aggregated across that user's submissions. `totalEarnings` is a
sum of KES collection values, not confirmation of completed payments.

## Review a delivery

`POST /api/v1/collections/:id/verify` requires `ADMIN`, `VERIFIER` or
`COLLECTION_POINT`. Send a boolean `approved`, optional `notes`, optional
`adjustedWeight` (at least 0.1 kg) and optional `adjustedAmount` (nonnegative KES).

```json
{
  "approved": true,
  "notes": "Weight checked at intake"
}
```

The response is HTTP 200 with the updated collection in `data` and a message.
Both approval and rejection set `verifiedAt` and `verifiedBy`. Rejection sets
`paymentStatus` to `CANCELLED`. A reviewed collection cannot be reviewed again.
Operators can review only deliveries at their assigned active point. A
conditional write checks assignment again and prevents simultaneous decisions
from overwriting each other. A duplicate decision or access change during the
write returns 409; refresh the queue before continuing.

When on-chain recording is enabled, approval queues the Soroban workflow and
returns before payment finishes. The current service applies `adjustedAmount`
only when truthy, so zero does not override the amount even though validation
accepts it. KES adjustments do not set the WASTE token price on-chain.

## On-chain fields

Read a collection again to observe background progress:

| Field | Meaning |
| --- | --- |
| `chainStatus` | `null` until queued; then `PENDING`, `RECORDED`, `VERIFIED`, `PAID`, or `FAILED` |
| `chainTransactionId`, `chainPaymentId` | Numeric contract IDs stored as strings |
| `chainContext` | Saved public network, contract bundle, signing addresses and flow (`admin_v1` or `point_owner_v1`); no private keys |
| `chainAmount` | WASTE amount as an integer base-unit string, seven decimal places |
| `chainRecordTxHash`, `chainVerifyTxHash`, `chainPaymentTxHash` | Stellar transaction hashes as they become available |
| `chainAttempts`, `chainError` | Retry information and latest error, when present |

`chainStatus = PAID` reports the completed WASTE mint. `paymentStatus` belongs to
the separate legacy payment flow and can remain `PENDING` for a WASTE-paid
collection. Do not use it as the WASTE payment indicator. See
[smart contracts](/technical/smart-contracts#from-approval-to-waste).

`imageUrls` is returned as a JSON-encoded string, not an array. Collections also
include material, weight, KES payment fields, review timestamps, notes and related
collector or point selections; those relation selections vary by operation.

## Statistics

| Method | Path | Access | Filters |
| --- | --- | --- | --- |
| GET | `/api/v1/collections/statistics` | `ADMIN` or `COLLECTION_POINT` | `userId`, `collectionPointId`, `startDate`, `endDate` |
| GET | `/api/v1/collections/statistics/materials` | `ADMIN` or `COLLECTION_POINT` | `collectionPointId`, `startDate`, `endDate` |

IDs in these filters must be UUIDs; dates must be ISO 8601. Results are under
`data`. General statistics contain `totalCollections`, `totalWeight`,
`totalPayments`, `byMaterial` and `byStatus`. These aggregates include matching
submissions across review and payment states. For approval-only public totals,
use [public statistics](/api/impact). Operator statistics are restricted to their
assigned active point, even when other filters are supplied. General statistics
include the same sibling `scope` metadata as the staff collection list.

The materials statistics payload contains `summary`, `byMaterialType`,
`byCategory` and `filters`. It is cached for five minutes through the cache
helper, which falls back to the database when Redis is unavailable.

## Images and deletion

| Method | Path | Access | Input or behavior |
| --- | --- | --- | --- |
| POST | `/api/v1/collections/:collectionId/images` | Active account | JSON `imageUrls`: nonempty array of valid URLs; appends stored URLs |
| DELETE | `/api/v1/collections/:id` | `ADMIN` | Deletes a collection unless the service considers its legacy payment completed |

The images endpoint stores URLs; it does not upload image files. Collectors may append URLs only to their own records; operators are restricted
to their assigned active point. Admins and central verifiers retain staff access.
A foreign operator record returns 404 and another collector's record returns
403. File upload remains contributor work. There are no collection cancellation,
dispute or export routes in this router.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/waste-collection.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/waste-collection.controller.ts),
[collection service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/waste-collection.service.ts)
and [on-chain service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/onchain-collection.service.ts).
