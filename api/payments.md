# Payments

::: warning Separate from testnet WASTE rewards
The app's approval workflow mints WASTE through Soroban. The payment routes below
are a separate, older XLM and mobile-money implementation. They do not redeem
WASTE. Mobile-money cash-out is post-MVP and depends on provider configuration,
callback authentication and settlement verification that are not complete.
:::

## Existing routes

All routes in this table require an active account's access token:

| Method | Path | Role requirement | Input or result |
| --- | --- | --- | --- |
| POST | `/api/v1/payments/process` | `ADMIN` or `COLLECTION_POINT` | JSON `collectionId` (UUID); attempts the legacy XLM collection payout |
| GET | `/api/v1/payments/transactions/me` | Any active account, own records | `data`, `pagination`, `summary`; `page` default 1, `limit` default 20, maximum 100 |
| GET | `/api/v1/payments/transactions/:id` | Any active account | Database transaction in `data`; 404 if absent |
| POST | `/api/v1/payments/transactions/:id/retry` | `ADMIN` | Retry a failed payment through the legacy service |
| DELETE | `/api/v1/payments/transactions/:id` | Any active account | Cancel a pending database transaction; returns a message |
| POST | `/api/v1/payments/withdraw` | Any active account | JSON `amount`, `phoneNumber`, `paymentMethod` |
| GET | `/api/v1/payments/statistics` | `ADMIN` | Statistics in `data`; optional ISO 8601 `startDate`, `endDate` |

These describe the current router, not an endorsement of these flows for real
payments. The transaction detail and cancellation handlers do not currently
enforce record ownership. Cancellation only changes a pending database record;
it does not reverse a Stellar transaction or completed provider payment.

`POST /api/v1/payments/process` converts the collection's KES estimate to XLM
using the fixed exchange-rate helper and attempts a native payment. It does not
call the Soroban WASTE payment contract. Do not call it after approval expecting
it to complete the WASTE workflow.

The withdrawal route accepts KES `amount` of at least 100, an international
`phoneNumber`, and `paymentMethod` equal to `MPESA`, `MTN_MONEY` or `AIRTEL_MONEY`.
Its service checks the custodial wallet's XLM balance and configured provider;
this is not a WASTE balance check. A successful request does not establish final
provider settlement. This reference deliberately does not give a real-money
withdrawal walkthrough while those gaps remain.

## Responses and history

The create, retry and withdrawal handlers return HTTP 200 with a database
transaction in `data` when their service reports success. Service-declared
failures return 400 with `error`; unexpected failures can return 500.

Transaction records include `id`, `userId`, `amount`, `currency`, `type`, `status`,
`paymentMethod` and optional `stellarTxHash`, provider references, description or
metadata. The own-history summary contains `totalTransactions` and `totalAmount`
aggregated over completed database transactions. It is not an on-chain balance
or a list of Soroban WASTE mints.

For the working reward flow, read the [WASTE balance](/api/wallet) and
[collection chain fields](/api/transactions#on-chain-fields). For the mounted
provider callbacks and their current limitations, see [callbacks](/api/webhooks).
No generic payment-create, refund, escrow or dispute route is mounted.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/payment.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/payment.controller.ts)
and [service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/payment.service.ts).
