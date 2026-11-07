# Wallet

The backend holds encrypted custodial Stellar keys for users. The demo uses
testnet. The WASTE balance comes from a Soroban token contract; Horizon account
balances and native XLM transfers are a separate interface.

## WASTE balance

`GET /api/v1/wallet/waste` requires an active account's access token. It reads
the token contract's `balance` method for the user's stored address:

```json
{
  "success": true,
  "data": {
    "address": null,
    "balance": "0",
    "explorerUrl": null
  }
}
```

This is the actual response shape for a user without a wallet address. With an
address, `address` is its public key, `explorerUrl` is the account explorer link,
and `balance` is an integer string in base units. `10000000` base units equals
1 WASTE. Do not parse it as a KES amount or sum collection estimates to produce
a token balance.

An account without an address returns HTTP 200 with zero. If it has an address
but Soroban is disabled, the route returns 503. An RPC read failure returns 502.

For WASTE payment history, use `GET /api/v1/collections/me`, select records with
`chainStatus = PAID`, and use `chainAmount` and `chainPaymentTxHash`. There is no
server-side `chainStatus` filter on that history endpoint; page through history
when a complete list is needed. See [collections](/api/transactions#on-chain-fields).

## Other mounted wallet routes

All routes below require an active account's access token except exchange rate:

| Method | Path | Input or result |
| --- | --- | --- |
| POST | `/api/v1/wallet/create` | Create or get a custodial wallet; `data` includes `publicKey`, `network`, `message` |
| GET | `/api/v1/wallet/balance` | `data.publicKey` and `data.balances`, an array of `{ balance, asset }` from Horizon |
| GET | `/api/v1/wallet/transactions` | Horizon-derived history in `data`; optional `limit`, default 10 |
| POST | `/api/v1/wallet/send` | Native XLM payment; JSON `destinationPublicKey`, `amount` as a decimal string in XLM, optional text `memo` up to 28 characters |
| GET | `/api/v1/wallet/exchange-rate` | Public; `data` contains `rate`, `from`, `to`, `timestamp` |

Balance and history return 404 when no wallet exists. Successful sends return
`data.transactionHash`; this endpoint sends XLM, not WASTE. The router declares
history limit bounds of 1 to 100 and a minimum send amount of 0.0000001, but does
not consume those validation results in these handlers. Use valid values rather
than relying on that validation as an enforced boundary.

The exchange-rate service currently returns a fixed **15.5 KES per XLM**. Its
timestamp is response time, not evidence of a live market feed. It is not a WASTE
redemption rate. A WASTE-send or WASTE-to-cash endpoint is not implemented.

Source: [router](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/routes/wallet.routes.ts),
[controller](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/controllers/wallet.controller.ts)
and [Stellar service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/stellar.service.ts).
