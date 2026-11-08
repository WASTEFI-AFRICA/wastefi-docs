# Smart contracts

WasteFi uses seven Soroban contracts on Stellar testnet to record approved
collections and mint WASTE rewards. The contracts are written in Rust with
`soroban-sdk` 23. The `common` crate supplies shared types and helpers; it is a
library, not an eighth deployed contract.

::: warning Current trust model
New point-mode deliveries are verified with the collection point owner's key.
The backend holds encrypted custodial keys, and the platform administers registry
trust, retains an explicit verification override and supplies payment recipients
and amounts. The payment contract does not yet derive them from the verified
collection. Older saved collections keep their original admin flow.
The contracts have not been audited and there is no mainnet deployment.
:::

## Contract map

| Contract | Responsibility |
| --- | --- |
| `collector_registry` | Collector registration, profile and activation status |
| `collection_point` | Collection point registration, ownership and verification status |
| `material_pricing` | Prices per kilogram for each on-chain material category |
| `waste_transaction` | Delivery records, calculated value and point or admin verification |
| `reputation` | Collector scores and transaction outcome counts |
| `payment_distribution` | One payment record per transaction and WASTE minting on completion |
| `waste_token` | WASTE balances, transfers, allowances and capped minting |

## From approval to WASTE

An operator approves a collection through the backend. With `point_owner_v1`
selected for new work, the
[on-chain collection service](https://github.com/WASTEFI-AFRICA/wastefi-backend/blob/main/src/services/onchain-collection.service.ts)
then runs the following steps in the background:

1. **Prepare the collector.** The backend creates a custodial testnet wallet if
   needed, registers it in `collector_registry` under a pseudonym, and uses the
   admin to activate it. The app does not put the collector's real name or phone
   number in that registry.
2. **Record the delivery.** The collector's wallet signs
   `waste_transaction.record_with_price_lookup`. It reads the material price,
   calculates `total_amount` and stores a record with `status = Pending` and
   `verified = false`.
3. **Verify the record.** The collection point wallet signs
   `waste_transaction.verify_transaction_by_point`. The point must be registered
   and verified, accept the material, and both contracts must be unpaused. This
   sets `verified = true` and `status = Completed`, then updates reputation.
4. **Create the payment.** The admin signs
   `payment_distribution.process_payment`. The backend supplies the collector's
   wallet address and the record's `total_amount`. This creates a pending payment;
   it does not mint tokens yet.
5. **Pay the collector.** The admin signs
   `payment_distribution.update_payment_status` with `Completed`. The payment
   contract calls `waste_token.mint_from` and the recipient receives WASTE.

The backend stores transaction hashes and checks existing records before retrying
interrupted work. Approval in the API returns before the chain work finishes;
it does not mean the WASTE has already been minted.

::: info Collection point identities and legacy work
The API provisions an encrypted private point wallet only for an active,
administratively verified database point. It registers pseudonymous metadata,
synchronizes accepted material categories and has the registry admin verify that
trusted point. Operators review only their assigned active point's collections.
The API signs on behalf of the point; this does not give operators independent
custody of its key. Failed point authorization never falls back to admin.

Each collection saves its contracts, addresses and flow before recording.
Historical `admin_v1` work keeps its original admin verification and payment map.
The old public-only `stellarAddress` remains for those records; it is separate
from the private signing wallet. A missing or corrupt pinned key is held for
review. The legacy backfill must complete before switching the API defaults.
`/stats` reports the configured mode for new work, not the mode of every
historical transaction. Admin verification remains an explicit contract override.
:::

## Main entry points and authorization

These tables cover the main integration calls. An authorization requirement here
means Soroban authorization by that address, not an HTTP role or access token.
The backend signs custodial collector, point and admin calls on users' behalf.

For exact signatures and additional methods, use the Rust source linked under
each contract. The contracts repository also has a broader
[`docs/API.md` reference](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/docs/API.md),
but it contains older examples; the linked implementations are the authority for
current argument lists, types and authorization.

### Collector registry

[Source: `collector_registry`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/collector_registry/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `register` | Create a collector with `Pending` status | Collector |
| `update_profile` | Change the stored name and phone fields | Collector |
| `update_status` | Activate, suspend or ban a collector within allowed transitions | Admin |
| `get_collector`, `is_active`, `exists` | Read registration and status | None |

The deployed transaction contract is configured to check `is_active` before
recording a delivery.

### Collection point registry

[Source: `collection_point`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/collection_point/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `register_point` | Store the owner, name, location and accepted materials | Owner |
| `update_point` | Change a registered point's information | Stored owner |
| `verify_point`, `update_verification_status` | Set the point's verification status | Admin |
| `get_point`, `get_point_by_owner`, `find_point_by_owner` | Read point information or its numeric ID; `find_point_by_owner` returns an optional ID | None |

A verified point can authorize its own pending deliveries when the configured
transaction contract checks this registry and the material is accepted.

### Material pricing

[Source: `material_pricing`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/material_pricing/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `get_price`, `get_price_record`, `get_all_prices` | Read prices and update metadata | None |
| `set_price`, `batch_update_prices` | Change prices for material categories | Admin |

Prices are stored values, not a live exchange-rate feed. `record_with_price_lookup`
uses this contract; `record_collection` accepts a caller-supplied price instead.

### Waste transactions

[Source: `waste_transaction`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/waste_transaction/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `record_with_price_lookup` | Record a delivery using the configured material price | Collector |
| `record_collection` | Record a delivery with a caller-supplied price | Collector |
| `verify_transaction_by_point` | Verify the recorded point's delivery and update reputation after registry, material and pause checks | Recorded point owner |
| `verify_transaction` | Explicit verification override; also supports legacy records | Admin |
| `update_status` | Set a transaction status | Admin |
| `get_transaction`, `get_collector_transactions` | Read delivery records | None |
| `set_material_pricing_contract`, `set_reputation_contract`, `set_collector_registry_contract`, `set_collection_point_contract` | Configure contract dependencies | Admin |

Both recording methods require the collector's authorization and apply the same
validation, active-collector check when a registry is configured, rate limit and
duplicate detection. Verification rejects an already verified record.

### Reputation

[Source: `reputation`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/reputation/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `record_transaction` | Add an outcome to a collector's history and update the score | Supplied caller must be admin or an approved operator |
| `update_score`, `set_score`, `reset_score` | Update or override reputation | Admin |
| `add_operator`, `remove_operator` | Manage callers allowed to record outcomes | Admin |
| `get_score`, `calculate_score` | Read the reputation record or calculated score | None |

Scores range from 0 to 1000, with a neutral starting score of 500. Deployment
grants `waste_transaction` the operator role so it can record successful
verification outcomes. This role is a contract permission, separate from the
app's collection point operator account.

### Payment distribution

[Source: `payment_distribution`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/payment_distribution/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `process_payment` | Create a payment from a transaction ID, recipient and positive amount | Admin |
| `batch_process` | Create multiple payments from caller-supplied values | Admin |
| `update_payment_status` | Change status; `Completed` mints the amount to the recipient | Admin |
| `get_payment`, `get_payment_for_transaction`, `get_recipient_payments` | Read payments and the transaction-to-payment index | None |

The transaction-to-payment index rejects a second payment for the same transaction
ID. Completed and failed payments cannot be modified. If minting fails during
completion, the call fails and the payment's previous state is preserved.

The contract does not currently read `waste_transaction` to validate the
transaction, its verification, recipient or amount. Those checks remain dependent
on the backend and trusted admin.

### WASTE token

[Source: `waste_token`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/waste_token/src/lib.rs)

| Entry point | Purpose | Required authorization |
| --- | --- | --- |
| `balance`, `total_supply`, `decimals`, `allowance` | Read balances, metadata and allowances | None |
| `transfer`, `burn` | Move or destroy tokens | Address spending the tokens |
| `approve` | Set a spender's allowance | Owner |
| `transfer_from` | Spend within the owner's allowance | Spender |
| `mint` | Mint within the supply cap | Admin |
| `mint_from` | Mint within the supply cap as an approved minter | Approved minter |
| `add_minter`, `remove_minter` | Manage minting permissions | Admin |

The deployment script approves `payment_distribution` as a minter. The cap is
`10,000,000,000,000,000` base units, or one billion WASTE with the deployed token's
seven decimal places. WASTE is a testnet reward token; this flow does not send XLM
or settle a mobile-money payment.

## Units, categories and states

| Value | On-chain representation |
| --- | --- |
| Weight | Whole grams (`u64`); the backend converts kilograms by rounding `kg × 1000` |
| Price per kilogram | Integer base units (`i128`) |
| Total amount | Integer arithmetic: `(weight_grams × price_per_kg) / 1000`, truncated to a whole base unit |
| WASTE balance and payment amount | Integer base units; `10,000,000` units = 1 WASTE in this deployment |
| Transaction and payment IDs | Numeric `u64` identifiers; distinct from backend database IDs and Stellar transaction hashes |
| Timestamps | Ledger Unix timestamps in seconds |

For example, 1500 grams at `8,000,000` base units per kilogram produces
`12,000,000` base units, or 1.2 WASTE. This is an arithmetic example, not a quote.
The API's KES material prices and the contract's token prices are separate;
there is no automatic KES-to-WASTE exchange rate.

The on-chain `MaterialType` variants are `Plastic`, `Glass`, `Metal`, `Paper`,
`Cardboard`, `Electronics`, `Organic`, `Textile`, `Rubber` and `Other`. The backend
maps a material's category to one of these variants; individual API codes such as
`GLASS_CLEAR` are not contract enum variants.

`TransactionStatus` has `Pending`, `Completed`, `Disputed` and `Cancelled`. A
`WasteRecord` also has a separate `verified` boolean. `PaymentStatus` has `Pending`,
`Processing`, `Completed`, `Failed` and `Refunded`; those variants do not imply an
implemented external refund or dispute service. App `chainStatus` values are
backend progress markers, not these Soroban enums.

Definitions: [shared types](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/common/src/types.rs)
and [amount calculation](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/contracts/common/src/utils.rs).

## Testnet deployment

These addresses come from
[`deployed_addresses_testnet.json`](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/deployed_addresses_testnet.json),
which records a bundle update on **8 November 2026** with new point registry,
transaction and payment contracts from source `edbbec3`. The token, collector
registry, pricing and reputation retain their **28 October 2026** deployments.
The [original manifest](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/deployments/testnet-2026-10-28.json)
is retained for historical backfill and pending collections.
Each link opens the contract on Stellar Expert testnet.

| Contract | Testnet address |
| --- | --- |
| `waste_token` | [`CDOK6OEYIINSA2KP23UU72BSNST7PFNVD67DI2PDELCZIQYUV7XK7SH6`](https://stellar.expert/explorer/testnet/contract/CDOK6OEYIINSA2KP23UU72BSNST7PFNVD67DI2PDELCZIQYUV7XK7SH6) |
| `collector_registry` | [`CCP4QOY57OKA6DNRU2XG5AD5B2YSVNSUG7BRVWR5XJRDMGY62VQ7JHII`](https://stellar.expert/explorer/testnet/contract/CCP4QOY57OKA6DNRU2XG5AD5B2YSVNSUG7BRVWR5XJRDMGY62VQ7JHII) |
| `collection_point` | [`CADEZ64CHYORQLRKD3JLV6QLW7IHJAUWEAAOPS6K2DNMQSXZCSPLGMHW`](https://stellar.expert/explorer/testnet/contract/CADEZ64CHYORQLRKD3JLV6QLW7IHJAUWEAAOPS6K2DNMQSXZCSPLGMHW) |
| `material_pricing` | [`CA6BP7PC7OPZPT4MFHIJAPXB237BVP72GVNVPI67GPH3QYYBCJDN2Z5G`](https://stellar.expert/explorer/testnet/contract/CA6BP7PC7OPZPT4MFHIJAPXB237BVP72GVNVPI67GPH3QYYBCJDN2Z5G) |
| `reputation` | [`CCXDYT3RIM2D356CYUZJ7SVD5PRFUVNJDZDAKSI5WITMMW5QMXZHIB5A`](https://stellar.expert/explorer/testnet/contract/CCXDYT3RIM2D356CYUZJ7SVD5PRFUVNJDZDAKSI5WITMMW5QMXZHIB5A) |
| `waste_transaction` | [`CB77D77P7RLXHPXNCZG4PJE6OVAXWYWAY2KBDX2SO76FMSBL7XOTYDIT`](https://stellar.expert/explorer/testnet/contract/CB77D77P7RLXHPXNCZG4PJE6OVAXWYWAY2KBDX2SO76FMSBL7XOTYDIT) |
| `payment_distribution` | [`CA5BJ6WCZEVLV7YNZY7XXERXSDHSYMW5XKCQOU3BTXWNG2DQRR74PB2W`](https://stellar.expert/explorer/testnet/contract/CA5BJ6WCZEVLV7YNZY7XXERXSDHSYMW5XKCQOU3BTXWNG2DQRR74PB2W) |

The manifest records one deployer account as admin for all seven contracts.
Testnet can reset. After a redeploy, update the manifest, the contracts README,
the backend's `src/config/soroban-contracts.ts`, the frontend's `lib/contracts.ts`
and this address table together.

## Build and exercise the contracts

Run these from a checkout of
[`wastefi-contracts`](https://github.com/WASTEFI-AFRICA/wastefi-contracts):

```sh
make build              # scripts/build-wasm.sh builds all seven contract Wasm files
cargo fmt --check
cargo clippy --workspace -- -D warnings
cargo test --workspace
```

Use `make build` or `scripts/build-wasm.sh` for deployment artifacts. The target is
`wasm32v1-none`, and the output directory is `target/wasm32v1-none/release/`.
The repository's pinned Rust toolchain supplies the target.

`make smoke-test` runs the
[testnet smoke script](https://github.com/WASTEFI-AFRICA/wastefi-contracts/blob/main/scripts/smoke-test.sh).
It creates throwaway accounts and submits real testnet transactions through
registration, pricing, recording, verification and minting. For deployment and
wiring instructions, see the
[contracts README](https://github.com/WASTEFI-AFRICA/wastefi-contracts#deployment).

## Planned capabilities

Deriving payout recipients and amounts on-chain and reducing reliance on platform
custody and one admin key remain work to do. Multisig escrow,
dispute arbitration, carbon credit minting and material passport contracts are
not deployed features. Shared `CarbonCredit` and `MaterialPassport` data types
do not implement those services. See the [roadmap](/community/roadmap).
