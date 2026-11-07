# Provider callbacks

WasteFi does not have an outbound webhook subscription API. Event subscriptions,
webhook secrets, delivery logs, signed event payloads and subscriber retry policies
described in earlier versions of this page are not implemented.

## Mounted inbound callbacks

The backend mounts these payment-provider handlers without JWT authentication:

| Method | Path | Current response envelope |
| --- | --- | --- |
| POST | `/api/v1/payments/callbacks/mpesa` | HTTP 200 with `ResultCode` and `ResultDesc` |
| POST | `/api/v1/payments/callbacks/mtn` | HTTP 200 with `success` |
| POST | `/api/v1/payments/callbacks/airtel` | HTTP 200 with `status` and `message` |

Payload parsing is provider-specific in `processMobileMoneyCallback` in the
[payment service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/payment.service.ts).
These handlers update legacy payment transaction records. They are not part of
the Soroban WASTE minting flow and are not endpoints for application clients to
confirm their own payments.

::: warning Authentication remains unfinished
The handlers do not currently verify provider signatures or authenticate the
provider before processing a callback. This is tracked in
[backend issue #35](https://github.com/WASTEFI-AFRICA/wastefi-backend/issues/35).
The routes' existence and HTTP 200 response do not establish authentic or settled
mobile-money payments. Cash-out remains post-MVP.
:::

The controllers also acknowledge some failures with HTTP 200, so HTTP status
alone does not indicate whether a transaction was matched or updated. Use the
implementation and provider-specific settlement requirements when completing
this integration; there is no WasteFi webhook-signing contract to implement
against today.

Outbound events remain a possible [future capability](/community/roadmap), with
no published event schema or delivery guarantee. For current transaction history,
use [payments](/api/payments); for WASTE payment evidence, use
[collections](/api/transactions#on-chain-fields).

Source: [payment router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/payment.routes.ts)
and [callback controllers](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/payment.controller.ts).
