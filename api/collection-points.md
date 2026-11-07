# Collection points

The read endpoints are public. Management requires an active account's access
token with the `ADMIN` role.

## Public discovery

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/v1/collection-points` | Active points in `data`, with sibling `pagination` |
| GET | `/api/v1/collection-points/nearby` | Active nearby points in `data`, with sibling `count` |
| GET | `/api/v1/collection-points/:id` | Point in `data`, with `_count.collections`; 404 if absent |

The main list accepts `city` and `country` as case-insensitive partial matches,
plus `page` (default 1) and `limit` (default 20, range 1 to 100). The controller
reads `page`, but the router does not currently validate it; send a positive
integer. Without proximity filtering, results sort by creation time, newest first.

The list also accepts `latitude`, `longitude` and `radius` in kilometres (0.1 to
100). Its service currently uses truthiness checks for proximity filtering, so
zero coordinates are not handled correctly there. Use the dedicated nearby
endpoint for location queries.

For nearby points, `latitude` (-90 to 90) and `longitude` (-180 to 180) are
required. Optional `radius` defaults to 10 km and accepts 0.1 to 100; `limit`
defaults to 10 and accepts 1 to 50. Results sort by distance, nearest first, and
include a numeric `distance` in kilometres.

```sh
curl --fail-with-body 'https://wastefi-backend.onrender.com/api/v1/collection-points/nearby?latitude=-1.2921&longitude=36.8219&radius=10&limit=10'
```

## Returned fields

A point has an `id`, `name`, optional `description`, `latitude`, `longitude`,
`address`, `city`, `country`, `contactPerson`, `contactPhone`, optional
`contactEmail`, `isActive`, optional `verifiedAt`, optional `stellarAddress`,
`createdAt` and `updatedAt`.

`acceptedMaterials` and `operatingHours` are nullable JSON-encoded strings in
responses. Parse them defensively; do not assume they are arrays or objects
already. For example, `acceptedMaterials` may contain the string
`["PET","GLASS_CLEAR"]`. Missing hours do not establish that a point is open.
The API does not return ratings, review counts or live intake availability.

`stellarAddress` is the app's current public identity reference, not proof that
the point can sign or is registered in the on-chain registry. See the
[contract reference](/technical/smart-contracts#from-approval-to-waste).

## Admin management

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/v1/collection-points` | Create an active point; HTTP 201, point in `data` |
| PUT | `/api/v1/collection-points/:id` | Update point fields; HTTP 200, point in `data` |
| DELETE | `/api/v1/collection-points/:id` | Soft-delete by setting `isActive = false`; HTTP 200, message |
| POST | `/api/v1/collection-points/:id/verify` | Set `verifiedAt` and reactivate the point; HTTP 200, point in `data` |

Creation requires `name`, `latitude`, `longitude`, `address`, `city`,
`contactPerson` and `contactPhone`. Optional fields are `description`, `country`
(defaults to Kenya), `contactEmail`, `operatingHours` (object) and
`acceptedMaterials` (array). Coordinates must be in geographic bounds and a
supplied contact email must be valid.

The documented update fields are optional `name`, `description`, `latitude`,
`longitude`, `address`, `city`, `contactPerson`, `contactPhone`, `contactEmail`,
`operatingHours`, `acceptedMaterials` and boolean `isActive`. Send objects and
arrays for the two JSON fields; the service serializes them for storage.

The HTTP verification route changes a database record. It does not register or
verify a Soroban collection point, nor grant an operator on-chain permissions.
There are no rating, availability or point-statistics subroutes. Staff can use
[collection statistics](/api/transactions#statistics) filtered by
`collectionPointId`.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/collection-point.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/collection-point.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/collection-point.service.ts).
