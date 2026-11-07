# Authentication

WasteFi currently uses phone number and password sign-in. OTP login, phone
verification, PIN management and password reset are not available routes.

## Endpoints

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | 201, token response |
| POST | `/api/v1/auth/login` | Public | 200, token response |
| POST | `/api/v1/auth/refresh` | Public, valid refresh token required | 200, token response |
| GET | `/api/v1/auth/profile` | Active account, access token | 200, decoded access-token claims |
| POST | `/api/v1/auth/api-keys` | Active account, access token | 201, new key record |
| GET | `/api/v1/auth/api-keys` | Active account, access token | 200, key metadata array |
| DELETE | `/api/v1/auth/api-keys/:keyId` | Active account, access token; own key | 200, message |

## Register and log in

Registration accepts these fields:

| Field | Requirement |
| --- | --- |
| `phoneNumber` | Required string matching `^\+?[1-9]\d{1,14}$`; use international format such as `+254…` |
| `firstName`, `lastName` | Required, nonempty after trimming |
| `email` | Optional valid email; stored in lowercase |
| `password` | Optional in the registration router; provide one to enable password login |

A supplied nonempty password must be at least eight characters and include
uppercase, lowercase, a number and a special character. Registration always
creates a `COLLECTOR`; a request cannot choose an elevated role. Duplicate phone
numbers or email addresses fail registration.

New accounts are normally `PENDING`. An admin must activate them through the
[users status route](/api/users#admin-user-actions). On a testnet demo,
`DEMO_AUTO_ACTIVATE=true` makes new accounts active immediately; it is ignored on
mainnet. Protected endpoints and login reject inactive accounts.

For `POST /api/v1/auth/login`, send JSON with `phoneNumber` and a nonempty
`password`. There is no OTP fallback. Validation errors return 400; an invalid
password or inactive account returns 401.

Registration, login and refresh put the following fields directly under `data`:

| Field | Meaning |
| --- | --- |
| `accessToken` | Access JWT; send it as `Authorization: Bearer …` |
| `refreshToken` | Refresh JWT; send only to the refresh endpoint |
| `expiresIn` | Currently the string `7d` |
| `user` | `id`, `phoneNumber`, `firstName`, `lastName`, `role`, and optional `email` |

The tokens are not nested under a `tokens` property. Token values are omitted
from this reference. Use [users/me](/api/users) to fetch current profile and
account status; the authentication profile route returns token claims instead.

## Refresh and sign-out

`POST /api/v1/auth/refresh` takes JSON with `refreshToken` and returns the same
token-response shape. Access tokens currently expire after seven days and
refresh tokens after 30 days. Each kind is checked separately; a refresh token
cannot be used as an access token. Invalid or expired refresh tokens return 401.

Refresh-token rotation and server-side session revocation are not implemented.
There is no logout endpoint. The app signs out by clearing its locally stored
session; this does not revoke a token already issued by the server.

## API keys

Create a key with JSON containing `name` at `POST /api/v1/auth/api-keys`.
The returned `data` contains `id`, `key`, `name`, `createdAt`, and an optional
`expiresAt`. The plaintext `key` is returned only when created. Listing keys
returns metadata, including `isActive`, `lastUsedAt` and `expiresAt`, not plaintext
keys. Deleting your key marks it inactive.

Most mounted routes explicitly use JWT authentication, so they do not accept
`X-API-Key`. The [backup router](/api/operations#backups) accepts either a bearer
token or API key, with an `ADMIN` role required in both cases. Creating an API key
does not grant access to other accounts or bypass role checks.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/auth.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/auth.controller.ts),
[service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/auth.service.ts)
and [token utility](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/utils/jwt.util.ts).
