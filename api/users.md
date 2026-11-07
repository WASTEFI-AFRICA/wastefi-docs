# Users

All endpoints on this page require an access token for an `ACTIVE` account.
An admin is needed to activate a pending account before it can use private routes.

## Current profile

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/v1/users/me` | Current user's stored profile in `data` |
| PUT | `/api/v1/users/me` | Updated profile fields in `data`, plus a message |
| POST | `/api/v1/users/me/profile-picture` | Profile with the updated picture URL in `data` |

The GET profile includes `id`, `phoneNumber`, `email`, `firstName`, `lastName`,
`role`, `status`, `kycStatus`, `profilePicture`, `nationalId`, `address`, `city`,
`country`, `stellarPublicKey`, `mobileMoneyNumber`, `createdAt`, `updatedAt` and
`lastLoginAt`. Optional database values can be `null`. Passwords and wallet
secrets are not included in this selected response.

The documented profile update fields are optional `firstName`, `lastName`,
`email`, `address` and `city`. Names must remain nonempty after trimming and an
email must be valid. For example:

```http
PUT /api/v1/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Amina",
  "lastName": "Otieno",
  "city": "Nairobi"
}
```

The update response is a smaller profile selection than GET; refetch GET when
you need role, account status or wallet address. There is no dedicated
role-assignment or password-change route in this router.

For a profile picture, send `multipart/form-data` with one file named
`profilePicture`. This is a separate local-file upload handler, not a general
collection-photo storage service. Collection images are URL records described
under [collections](/api/transactions#images-and-deletion).

## KYC records

| Method | Path | Access | Input or result |
| --- | --- | --- | --- |
| POST | `/api/v1/users/kyc/submit` | Active account | Required `nationalId`, `address`, `city`; optional URL fields `idDocumentUrl`, `photoUrl` |
| GET | `/api/v1/users/kyc/status` | Active account | Stored KYC fields and status in `data` |
| POST | `/api/v1/users/:userId/kyc/verify` | `ADMIN` or `VERIFIER` | Required boolean `approved`; optional `notes` |

Submission records KYC as `PENDING`. Verification requires a pending KYC record;
approval sets KYC to `APPROVED` and account status to `ACTIVE`, while rejection
sets KYC to `REJECTED` and account status to `PENDING`. These are record and
review endpoints, not an automated identity-verification integration.

## Admin user actions

Every route in this table requires `ADMIN`:

| Method | Path | Input or result |
| --- | --- | --- |
| GET | `/api/v1/users` | Filtered users in `data`, with sibling `pagination` |
| GET | `/api/v1/users/:userId` | Selected user profile in `data`; 404 if absent |
| PUT | `/api/v1/users/:userId/status` | Required `status`: `ACTIVE`, `SUSPENDED` or `BANNED`; optional `reason` |
| DELETE | `/api/v1/users/:userId` | Service soft-deletes by banning the account; returns a message |

The list accepts `status` (`PENDING`, `ACTIVE`, `SUSPENDED`, `BANNED`), `role`
(`COLLECTOR`, `ADMIN`, `COLLECTION_POINT`, `VERIFIER`), `kycStatus`
(`NOT_STARTED`, `PENDING`, `APPROVED`, `REJECTED`), `page` (default 1) and `limit`
(default 10, range 1 to 100). Activation does not assign a role.

There are no per-user statistics, impact reports, wallet subroutes or self-service
account-deletion endpoints here. Use [collections](/api/transactions),
[wallet](/api/wallet) and [public statistics](/api/impact) for the existing data.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/user.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/user.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/user.service.ts).
