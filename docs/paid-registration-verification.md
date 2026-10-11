# Paid event registration: release checklist

This change closes a payment-authorization gap: supplying a `paymentId` alone must **never** confirm paid tickets.

## Server-side checks

For events with `ticketPrice > 0`, `RegistrationServiceImpl` now calls the Razorpay API using the server's credentials before reducing seats:

1. The payment exists and its status is **captured** (not merely authorized).
2. The fetched payment ID and its order ID match the provider's records.
3. The payment and order each use INR and exactly match `event.ticketPrice × ticketCount` in paise.
4. The Razorpay order notes identify the same event ID and ticket quantity.
5. No registration has already consumed that payment ID. A unique database constraint prevents concurrent reuse.

For events where `ticketPrice == 0`, registration does not require payment and rejects an unrelated payment ID.

The frontend also clears a completed payment when ticket quantity/tier changes, only advances after capture, and displays a recoverable error if registration fails.

## Database rollout prerequisite

**Before merging or deploying**, inspect the current production registration table for reused non-null payment IDs:

```sql
SELECT payment_id, COUNT(*) AS uses
FROM registrations
WHERE payment_id IS NOT NULL
GROUP BY payment_id
HAVING COUNT(*) > 1;
```

Resolve any existing duplicates through an audited business process. Do **not** automatically delete or update historical registrations. Ensure the database enforces a unique constraint on `registrations.payment_id` (on PostgreSQL, for example, using a planned unique-index migration). Hibernate `ddl-auto: update` is not a reliable production schema-migration strategy.

## Limitations and follow-ups

- The current backend has **one event-wide `ticketPrice`**; the frontend displays multiple visual ticket tiers. Do not claim tier-specific backend pricing until persisted tiers and prices are implemented.
- Razorpay order creation currently accepts a client-supplied amount. This server-side registration gate rejects underpaid registrations, but order creation should separately compute the amount on the server (see issue #65 and its separate PR).
- The paid registration must be tested in a Razorpay **test-mode** environment and with a migrated PostgreSQL database before release.
- This PR does not replace booking/seat concurrency fixes, payment webhooks, refunds, or organizer authorization. Avoid representing it as full payment reconciliation.
