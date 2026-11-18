# GEOCIENCES S.A.C. Security Spec

## 1. Data Invariants
- A user can only read and write their own `/users/{userId}` record (`request.auth.uid == userId`).
- Users cannot set elevated system roles or modify unauthorized system properties.
- Audit logs `/audit_logs/{logId}` can only be appended by authenticated users for their own UID.
- All writes require verified emails (`request.auth.token.email_verified == true`).
- No blanket reads on collections.

## 2. The Dirty Dozen Payloads
1. Unauthorized User Read: Unauthenticated client reads `/users/user123`.
2. Impersonation Profile Write: User A writes to `/users/userB`.
3. Ghost Field Injection: Writing `/users/userA` with `{ "role": "SUPERADMIN", "isAdmin": true }`.
4. Over-length String Attack: Writing 100KB payload into displayName.
5. Insecure Audit Log Write: User A writes audit log claiming to be User B.
6. Missing Email Verification: Unverified email user writes to `/users/userA`.
7. Client-side blanket query: Querying all users without owner filter.
8. Malicious Document ID: Injecting 2KB path key as document ID.
9. Audit Log Mutation: Attempting to modify or update an existing audit log.
10. Audit Log Deletion: Attempting to delete an audit log.
11. User Profile Deletion by Non-Owner: User B attempts to delete `/users/userA`.
12. Schema Bypass: Inserting non-whitelisted keys on user profile.
