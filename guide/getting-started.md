# Try the testnet demo

WasteFi records recyclable deliveries, lets an operator review them, and rewards
approved collections with WASTE on Stellar testnet. This guide follows the
working collector-to-operator flow.

## Open the app

| Service | Link |
| --- | --- |
| App and demo sign-in | [wastefi-frontend.vercel.app/login](https://wastefi-frontend.vercel.app/login) |
| Public statistics | [wastefi-frontend.vercel.app/stats](https://wastefi-frontend.vercel.app/stats) |
| Material catalogue | [Backend public materials](https://wastefi-backend.onrender.com/api/v1/public/materials) |
| Contract addresses | [Testnet deployment table](/technical/smart-contracts#testnet-deployment) |

The hosted API can take time to wake after inactivity. On-chain steps also take
time, so approval and payment are separate moments in the demo.

## Follow a collection

1. **Sign in as a collector.** Use the demo collector button on the sign-in page,
   or create an account at the app's registration page. New accounts normally
   need admin activation; the testnet demo can enable automatic activation.
2. **Submit a delivery.** Open Submit, choose an active collection point and a
   material, and enter its weight in kilograms. Material descriptions and KES
   prices come from the API. Submitting creates a record for review; it does not
   pay WASTE immediately.
3. **Switch to the operator.** Sign out using the account navigation, return to
   sign-in, and select the demo collection point operator. Open the verification
   queue and select the submitted delivery.
4. **Approve it.** Confirm the delivery details and approve. The backend queues
   the Soroban workflow in the background. A rejection is a reviewed collection,
   but it is excluded from public verified totals and does not queue a reward.
5. **Return to the collector.** Sign out, sign in as the collector again, and
   open the collection history. Follow the record, verification and payment
   transaction links as they become available. The workflow can take a minute
   or two; a successful approval response does not mean minting has finished.
6. **Check the result.** `chainStatus = PAID` reports a completed WASTE mint. The
   app reads the collector's token balance from the contract. The public stats
   page reports recorded on-chain payouts and aggregates across the demo.

Demo seeding can refill the pending queue after a review. Those extra deliveries
are sample activity, not submissions from a field pilot. Several account and
staff screens still use sample data; follow their notices and the
[remaining MVP work](/community/roadmap#mvp-work-remaining).

## What the chain does

The backend uses a custodial collector wallet to record the delivery with a
material-price lookup. The admin verifies it, creates a payment record and
completes the payment, which mints WASTE. There are four contract calls; the app
stores links for the record, verification and final payment transactions.

The deployed contracts currently trust the admin for delivery verification,
recipient and amount. Operators are not yet tied to their own point's queue or
authorized to verify as that point on-chain. See the
[contract flow](/technical/smart-contracts#from-approval-to-waste) and
[collection chain fields](/api/transactions#on-chain-fields).

## Read the numbers correctly

- API collection weights are kilograms. Contracts store whole grams.
- A collection's KES estimate is separate from its WASTE reward. It is not proof
  of cash settlement or a conversion rate.
- WASTE has seven decimal places in this deployment. Its wallet balance comes
  from the token contract, not a sum of KES estimates.
- Public statistics include demo activity. They do not establish certified CO2
  savings, carbon credits or measured adoption.

The demo does not offer working SMS commands, OTP sign-in, offline submissions or
mobile-money cash-out. For implementation details, use the
[API reference](/api/overview). To run the code, start with
[local development](/guide/local-development).
