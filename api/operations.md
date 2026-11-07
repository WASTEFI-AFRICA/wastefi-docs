# Additional mounted routes

These routers are mounted by the backend beyond the main collector flow. This
inventory describes their HTTP surface, not a claim that external integrations
have been deployed or verified. Use the linked implementations for detailed
payloads and deployment requirements.

## Admin

All routes require an active account's access token with the `ADMIN` role:

| Method | Path | Purpose and supported query fields |
| --- | --- | --- |
| GET | `/api/v1/admin/dashboard` | Dashboard aggregates |
| GET | `/api/v1/admin/activity` | Recent activity; `limit` from 1 to 200 |
| GET | `/api/v1/admin/health` | Service health information |
| GET | `/api/v1/admin/users` | Admin user view; `page`, `limit`, `role`, `kycStatus`, `status`, `search`, `sortBy`, `order` |
| GET | `/api/v1/admin/collections` | Admin collection view; `page`, `limit`, `status`, `materialType`, `collectionPointId`, `startDate`, `endDate` |
| GET | `/api/v1/admin/transactions` | Admin payment view; `page`, `limit`, `type`, `status`, `paymentMethod`, `userId`, `startDate`, `endDate` |
| GET | `/api/v1/admin/analytics` | `period`: `7d`, `30d`, `90d`, `1y`; `type`: `collections`, `transactions`, `users` |
| GET | `/api/v1/admin/export` | Required `type`: `users`, `collections`, `transactions`; optional `format`: `json`, `csv` |

The paginated admin views accept positive `page` values and `limit` from 1 to
100. Their filter sets differ from the core resource routers. In particular,
the admin users router still declares status/KYC values that do not all match
the database enums. Use the [users API](/api/users#admin-user-actions) for the
documented activation flow rather than assuming these filters are interchangeable.
Role assignment is not an admin-router endpoint.

Source: [admin router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/admin.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/admin.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/admin.service.ts).

## Material passport records

All routes require an active account's access token:

| Method | Path | Additional role requirement | Input or purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/passports` | `ADMIN` or `COLLECTION_POINT` | Required `wasteCollectionId` (UUID); create a database passport record |
| GET | `/api/v1/passports/me` | None | Own collection-linked passports; `page` and `limit` (1 to 100) |
| GET | `/api/v1/passports/:id` | None | Read a passport and optional RecycleGraph data |
| POST | `/api/v1/passports/:id/custody` | `ADMIN` or `COLLECTION_POINT` | Required string `location`, `custodian`, `action` |
| POST | `/api/v1/passports/:id/verify` | `ADMIN` | Optional string `verificationMethod` |
| POST | `/api/v1/passports/:id/carbon-credits` | None | Calculate and store estimated figures |

Passport creation also accepts optional `productName`, `manufacturer`,
`dimensions` (object), `color`, `composition` (object), `manufacturingDate`,
`expiryDate` (ISO 8601), and `recyclingInstructions`.

The service stores records in PostgreSQL and optionally calls an external
RecycleGraph API when configured. Its local carbon calculation uses fixed
category factors. These records and estimates do not establish certified carbon
credits or a deployed passport or carbon-credit contract. These routers are
separate from the seven [deployed Soroban contracts](/technical/smart-contracts).

Source: [passport router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/material-passport.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/material-passport.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/material-passport.service.ts).

## Backups

The backup router accepts an active admin's JWT or API key. These are maintenance
operations on the configured backend environment:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/backups` | Create a backup; optional body `type`, default `full` |
| GET | `/api/v1/backups` | List backup metadata |
| GET | `/api/v1/backups/stats` | Backup statistics |
| POST | `/api/v1/backups/cleanup` | Run backup cleanup |
| GET | `/api/v1/backups/:filename` | Read backup information |
| POST | `/api/v1/backups/:filename/restore` | Restore a backup, or verify it with body `verifyOnly: true` |
| DELETE | `/api/v1/backups/:filename` | Delete a backup |

Listing these endpoints does not establish that scheduled backups or recovery
have been configured on the hosted demo. Read the backup service and deployment
configuration before using maintenance operations.

Source: [backup router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/backup.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/backup.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/backup.service.ts).
