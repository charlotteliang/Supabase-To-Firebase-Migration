# Supabase to Firebase Migration Guide

This guide details how to migrate your Users and Data from Supabase to Firebase.

## Prerequisites

1.  **Install Dependencies**:
    ```bash
    npm install pg firebase-admin @supabase/supabase-js
    ```

2.  **Configuration**: 
    The scripts rely on `firebase-service.json` (for Firebase) and `supabase-service.json` (for Supabase).

    *   **Step 2.1: `supabase-service.json`** (For Supabase)
        *   Create `supabase-service.json` in the root directory if it doesn't exist.
        *   Fill in your Supabase connection details (matching the structure used in the forward migration guide):
            *   `dbHost`, `dbUser`, `dbPassword`, `dbPort`
            *   `projectUrl`, `serviceRoleKey`

    *   **Step 2.2: `firebase-service.json`**
        *   The scripts expect a `firebase-service.json` file in the root.
        *   **Generate this file**:
            1.  Go to the [Firebase Console](https://console.firebase.google.com/).
            2.  Navigate to **Project Settings** > **Service Accounts**.
            3.  Click **Generate new private key**.
            4.  Rename the downloaded file to `firebase-service.json` and place it in your project root.
3.  **Firebase Project Setup**:
    *   **Create Project**: Create a new Firebase project (or use an existing one) in the [Firebase Console](https://console.firebase.google.com/).
    *   **Enable Authentication**: Go to **Authentication** > **Get started**. You *must* initialize Authentication for the import to work, even if you don't enable specific providers yet.
    *   **Create Database**: 
        *   **Option A (CLI - Preferred)**: Run `firebase init firestore` (select your project), then `firebase deploy --only firestore`. This provisions the database in the default location.
        *   **Option B (Console)**: If CLI fails or you prefer the UI, go to **Firestore Database** > **Create database**. Select a region (e.g., `nam5`) and start in **Production mode**.
    *   **Service Account**: Go to Project Settings > Service Accounts > Generate new private key. Save this as `firebase-service.json` in your project root. **Crucial**: This key must match the project you are importing into.

## 1. Migrate Authentication

We will export users from Supabase, preserving their **Bcrypt** password hashes, and import them into Firebase.

### Step 1.1: Export Supabase Users
Supabase uses standard Bcrypt hashing. We must query the `auth.users` table directly to get these hashes.

```bash
node reverse_migration_tool/auth/export_supabase_auth.js
```
*Output: `reverse_migration_tool/auth/supabase_users.json`*

### Step 1.2: Import to Firebase
Import the users into Firebase Authentication. This script tells Firebase to interpret the hashes as Bcrypt.

```bash
node reverse_migration_tool/auth/import_firebase_auth.js
```
*Result: Users are created in Firebase with their same UIDs and passwords.*

## 2. Migrate Database (Firestore)

We will export tables from Supabase and import them into Firestore collections.

### Step 2.1: Export Data
Export data from Supabase tables (e.g., `todos`) to JSON.

```bash
node reverse_migration_tool/firestore/export_supabase_data.js
```
*Output: `reverse_migration_tool/firestore/todos_export.json`*

### Step 2.2: Import to Firestore
Import the JSON data into Firestore.
*   **IDs**: We preserve the Supabase UUIDs as the Firestore Document IDs.
*   **User References**: Since we migrated users with their keys intact, `uid` fields in your data will automatically match the imported users in Firebase! No ID mapping required.

```bash
node reverse_migration_tool/firestore/import_firebase_data.js
```

## 3. Verify and Secure
1.  **Firebase Console**: Check Authentication users and Firestore data to ensure everything was imported correctly.
2.  **App Config**: Update your app to point back to the Firebase config.
3.  **Security Rules**:
    *   The `firestore.rules` file in your project defines your database security.
    *   **Deploy Rules**: Run `firebase deploy --only firestore:rules` to deploy the rules from your local file.
    *   **Example (Locked down)**:
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if request.auth != null; // Only authenticated users
            }
          }
        }
        ```
    *   **Important**: The default rules set by `firebase_init` are often "Test Mode" (open to everyone). Update them to secure your user data!
4.  **Test Application**:
    *   Launch your app.
    *   **Sign In**: Try logging in with a migrated user (e.g., `test@example.com`) using their *original* password. It should work immediately.
    *   **Check Data**: Verify that their data (e.g., todo items) loads correctly.
