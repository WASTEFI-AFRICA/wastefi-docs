# API overview

The WasteFi backend is an Express API. The current demo uses Stellar testnet;
its WASTE rewards are separate from KES collection estimates and mobile money.

## Base URLs

| Server | Base URL |
| --- | --- |
| Hosted demo | `https://wastefi-backend.onrender.com/api/v1` |
| Local backend | `http://localhost:3001/api/v1` |

Every business endpoint below includes the `/api/v1` prefix. The hosted service
can take time to wake after being idle. Use the local backend for development
writes; the public examples below only read data.

```sh
curl --fail-with-body https://wastefi-backend.onrender.com/api/v1/public/materials
```

## Try a public request

<ApiPlayground />

The playground sends a request only when you select **Send request**. Browser
requests also require the backend's allowed origins to include the docs origin.
If the browser blocks a request, try the curl command above or your local setup.

## Reference

| Area | Routes | Reference |
| --- | --- | --- |
| Authentication | `/api/v1/auth` | [Passwords, tokens and API keys](/api/authentication) |
| Users | `/api/v1/users` | [Profile, KYC and admin user actions](/api/users) |
| Wallet | `/api/v1/wallet` | [WASTE balance and Stellar wallet operations](/api/wallet) |
| Collection points | `/api/v1/collection-points` | [Discovery and admin management](/api/collection-points) |
| Collections | `/api/v1/collections` | [Submission, review and history](/api/transactions) |
| Payments | `/api/v1/payments` | [Payment records and legacy payout routes](/api/payments) |
| Public materials | `/api/v1/public/materials` | [Codes, labels and KES prices](/api/materials) |
| Public statistics | `/api/v1/public/stats` | [Verified activity and on-chain totals](/api/impact) |
| Provider callbacks | `/api/v1/payments/callbacks` | [Existing callbacks and their limitations](/api/webhooks) |
| Admin, passports and backups | `/api/v1/admin`, `/api/v1/passports`, `/api/v1/backups` | [Additional mounted routes](/api/operations) |

`GET /api/v1` returns the API name, version and documentation location. The
backend also exposes Swagger UI at `/api/docs` and its JSON at `/api/docs.json`.
Some Swagger comments are older than the implementation; this reference follows
the routers, controllers and services in
[`wastefi-backend/src`](https://github.com/WASTEFI-AFRICA/wastefi-backend/tree/main/src).

## Authentication and roles

Protected routes use an access token:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The account must exist and be `ACTIVE`. A token issued during registration does
not bypass pending-account activation. Role names are `COLLECTOR`,
`COLLECTION_POINT`, `VERIFIER` and `ADMIN`; each page lists the router's role
requirements. API keys are not a substitute for JWT on routes that use
`authenticateJWT`. See [authentication](/api/authentication).

## Responses and errors

Most endpoints return JSON with `success` and `data`, sometimes with a `message`:

```json
{
  "success": true,
  "data": {}
}
```

This is an envelope example, not the payload of a specific endpoint. Failures
usually include `success: false`, `error`, and sometimes `message` or `details`:

```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

Validation normally returns HTTP 400. Missing or invalid authentication returns
401; insufficient role or collection ownership returns 403. Some lookup handlers
return 404, while service failures in several controllers return 500 even for a
bad resource ID or an invalid state. Do not assume a uniform error-code object.
Provider callback envelopes are different and documented [separately](/api/webhooks).

HTTP 429 indicates rate limiting. Respect the response headers and back off;
there is no documented subscription tier or per-API-key quota. Retry reads after
transient failures. Do not assume writes support an `Idempotency-Key` header:
no general idempotency middleware is mounted.

## Pagination and units

Paginated endpoints use `page` and `limit`, not cursors. Most default to page 1
and limit 20; the users list defaults to limit 10. Their responses put the array
in `data` and metadata in a sibling `pagination` object:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Collections and collection points also return `hasNextPage` and
`hasPreviousPage`. The nearby-points endpoint returns `count` instead of
pagination. Follow each endpoint's documented filters; arbitrary `sort`,
`cursor` or `fields` query parameters are not supported by these list routes.

API collection weights use kilograms. Collection `paymentAmount` is a KES value;
it is not a WASTE balance. On-chain amounts such as `chainAmount` and the WASTE
wallet balance are integer strings with seven decimal places. Keep them as
strings or use `BigInt` for arithmetic. See [wallet](/api/wallet) and the
[contract reference](/technical/smart-contracts).

## Scope

There is no general transactions, material CRUD, impact-reporting or webhook
subscription API. Client SDK packages, OTP login, PIN changes, server logout,
password reset and webhook signing are not implemented by the mounted routes.
The [roadmap](/community/roadmap) separates planned capabilities from current
testnet functionality.

Source: [route mounts](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/server.ts),
[JWT middleware](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/middleware/auth.middleware.ts)
and [error handling](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/middleware/error.middleware.ts).
