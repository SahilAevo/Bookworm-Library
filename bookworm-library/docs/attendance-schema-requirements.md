# QR attendance schema requirements

The existing schema already provides `attendance`, `attendance_qr_tokens`,
`attendance_audit_logs`, library scoped foreign keys, row level security, and
partial unique indexes for one open visit per student and one current occupant
per physical seat. It does not provide trusted attendance operations for student
accounts: students can only select their own attendance rows, and cannot create
or close a visit or read the shared seat inventory.

The QR workflow therefore needs one additive migration with these changes:

1. Add nullable `check_in_request_id` and `check_out_request_id` UUID columns to
   `attendance`, each with a unique partial index. These are idempotency keys so
   retrying a network request cannot toggle a check-in into a checkout or create
   a duplicate visit.
2. Expand the audit action constraint to include successful student check-in
   and checkout events. Check-in/out and audit writes must commit together.
3. Add security definer RPCs with a fixed empty search path to issue/retrieve or
   revoke the authenticated library's QR, return the authenticated student's
   attendance context and available seats, process a QR scan transactionally,
   and close a visit manually with a required audit reason.
4. In the scan RPC, derive student and library IDs from `auth.uid()`; validate
   membership, token hash, expiry, active state, seating mode and seat rules;
   serialize scans per student; and rely on the existing unique indexes to
   reject concurrent occupancy conflicts.
5. Grant execute only to `authenticated`. Student seat availability is returned
   by the scoped RPC, so the UI does not need broad direct read access to other
   students' attendance or allocations.

The `attendance_qr_tokens` table stores only a SHA-256 hash. A random UUID bearer
payload is derived from the token row ID; the RPC exposes it only to staff in
the owning library and validates its hash for student scans. The payload
contains no student information. Static QR retrieval remains possible without
storing a plaintext token column.

No existing table is duplicated. The migration is additive and leaves the
previous seat service contract and permanent allocation table in place.
