# Roadmap

WasteFi is building a testnet MVP that rewards collectors for verified recyclable
deliveries. This page describes the current scope and remaining work. It is not
a dated release promise or a record of pilot operations, partnerships or impact.

## Working on testnet

- Collector sign-up, sign-in and collection submission through the app and API.
- An operator review queue that approves or rejects submitted deliveries.
- Background recording and point-signed verification of new approved collections on Soroban,
  followed by WASTE minting to the collector's custodial wallet.
- On-chain balance reads and links to the record, verification and payment
  transactions for collectors.
- Public statistics, with paid-on-chain totals and transaction links.
- Collection point discovery using API data in the list and map.
- Real wallet payment history, profile editing and point dashboard totals.
- Admin account activation and operator assignment to an active point.
- Published documentation with pull-request build checks.

The frontend runs on Vercel, the backend on Render, and PostgreSQL on Neon.
Contracts run on Stellar testnet. Demo accounts and seeded collections exercise
the product; demo activity is not evidence of a field pilot or measured impact.
See the [app](https://wastefi-frontend.vercel.app),
[backend README](https://github.com/WASTEFI-AFRICA/wastefi-backend) and
[contract reference](/technical/smart-contracts) for the current implementation.

## MVP work remaining

The next steps are:

1. Make the payment contract read the recipient and amount from the verified
   transaction. Today the admin supplies both values.
2. Fix or remove the unused offline queue. The submission form currently requires
   a connection; queued offline submission is not a working feature.

The point-verification rollout preserves the original token and old contract
roles. Deployment requires pinning historical collections to their original
contracts before switching the API defaults. Custodial keys and the explicit
admin verification override remain part of the trust model.

Contract changes are tracked in
[collection point verification #43](https://github.com/WASTEFI-AFRICA/wastefi-contracts/issues/43)
and [on-chain payment derivation #44](https://github.com/WASTEFI-AFRICA/wastefi-contracts/issues/44).

## Contributor work

Open work includes photo uploads, phone verification, password reset, refresh
token rotation, payment callback authentication, frontend accessibility and test
coverage. Check issue assignments before starting a change:

- [Backend issues](https://github.com/WASTEFI-AFRICA/wastefi-backend/issues)
- [Frontend issues](https://github.com/WASTEFI-AFRICA/wastefi-frontend/issues)
- [Contract issues](https://github.com/WASTEFI-AFRICA/wastefi-contracts/issues)
- [Documentation issues](https://github.com/WASTEFI-AFRICA/wastefi-docs/issues)

## Beyond the testnet MVP

These are future directions, not available product features:

| Direction | Work still needed |
| --- | --- |
| Mobile-money cash-out | Authenticate provider callbacks and verify settlement flows before enabling real payouts |
| Mainnet deployment | Complete security work, review custody and admin controls, and obtain an independent contract audit |
| Multisig administration | Replace reliance on a single trusted admin key |
| Escrow and dispute arbitration | Design and implement contracts and operational processes |
| Carbon credits and material passports | Define verification and evidence requirements, then implement the services and contracts |
| RecycleGraph interoperability | Validate the proposed standards against working integrations |

There are no deployed carbon credit, material passport or escrow contracts.
WASTE rewards do not establish a carbon credit, cash balance or redemption rate.

## Progress and contributions

Repository commits, tests and linked transactions provide evidence of progress.
This page does not claim completed historical releases, collector adoption,
tonnage, revenue, carbon savings or partner commitments. Those need independent
records before they can be reported.

Use the issue tracker in the relevant repository to propose or take on work.
Keep changes focused, test them, and describe the behavior that actually exists.
