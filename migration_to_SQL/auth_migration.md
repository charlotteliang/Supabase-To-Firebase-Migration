# Auth Migration: Supabase to Firebase

This guide explains how to migrate users from Supabase Auth to Firebase Auth.

> [!NOTE]
> This process is identical to the Firestore migration path because User authentication is a shared service in Firebase.

## Prerequisites
- `firebase-admin` SDK initialized with service account key.
- `supabase-js` client initialized with `service_role` key.
- `pg` client (Data Connect doesn't provide direct access to Supabase's auth schema, so we query Supabase Postgres directly).

## Scripts

We have provided two scripts in the `auth/` directory:
1.  `export_supabase_auth.js`: Fetches users and Bcrypt password hashes from Supabase.
2.  `import_firebase_auth.js`: Imports them into Firebase Auth.

### 1. Export Users
Supabase stores users in the `auth.users` table. The `encrypted_password` column contains the Bcrypt hash.

Run:
```bash
node SQLMigration/auth/export_supabase_auth.js
```

### 2. Import Users
Firebase Auth supports importing Bcrypt hashes directly.

Run:
```bash
node SQLMigration/auth/import_firebase_auth.js
```

## Verification
After running the import, go to the **Firebase Console > Authentication** and verify your users are listed. Try logging in with a migrated user credentials in your new app.
