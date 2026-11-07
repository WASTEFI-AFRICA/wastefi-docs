---
layout: home

hero:
  name: WasteFi
  text: Collect. Verify. Reward.
  tagline: Follow a recyclable delivery from submission to a WASTE reward on Stellar testnet.
  image:
    src: /logo.svg
    alt: WasteFi logo
  actions:
    - theme: brand
      text: Try the testnet demo
      link: https://wastefi-frontend.vercel.app/login
    - theme: alt
      text: Follow a collection
      link: /guide/getting-started

features:
  - title: Record a delivery
    details: Collectors choose a material and collection point, then submit a weight for review.
    link: /api/transactions
    linkText: Collection API
  - title: Trace the reward
    details: Approval queues an on-chain record, admin verification and a WASTE mint to the collector.
    link: /technical/smart-contracts
    linkText: Seven Soroban contracts
  - title: Check the evidence
    details: Public statistics show collection aggregates and recorded testnet payouts, with transaction links.
    link: /api/impact
    linkText: Public statistics API
---

## See the flow for yourself

Use the demo collector and operator buttons on the
[sign-in page](https://wastefi-frontend.vercel.app/login). Submit a delivery,
approve it as an operator, then return to the collector to follow its record,
verification and payment transactions on Stellar Expert. The
[quick start](/guide/getting-started) walks through each step.

The app runs on Vercel, the API on Render, PostgreSQL on Neon, and the contracts
on Stellar testnet. The backend creates custodial collector wallets and signs
the on-chain calls. The contract admin currently authorizes verification and
supplies payout values.

::: info What this demo establishes
The demo exercises software and testnet transactions. Seeded activity is not
evidence of a field pilot, audited environmental impact or commercial adoption.
WASTE is a testnet reward token. Mobile-money cash-out, carbon-credit minting,
escrow and mainnet operation are not available product features.
:::

## Build with WasteFi

Start with the [HTTP API](/api/overview), the
[contract reference](/technical/smart-contracts), or
[local development](/guide/local-development). The [roadmap](/community/roadmap)
lists remaining MVP work and contributor areas. Older guides that have not been
checked against the implementation stay in the source repository and are excluded
from this site.
