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
        *   **File Content**:
            ```json
            {
              "dbHost": "db.cvymjejszmjvfnvzadie.supabase.co",
              "dbUser": "postgres",
              "dbPassword": "YOUR_DB_PASSWORD_HERE",
              "dbPort": 5432,
              "projectUrl": "https://cvymjejszmjvfnvzadie.supabase.co",
              "serviceRoleKey": "YOUR_SERVICE_ROLE_KEY_HERE"
            }
            ```
        *   **Where to find these values**:
            *   Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
            *   **dbHost**: Settings > Database > Connection parameters > Host.
            *   **dbUser**: Settings > Database > Connection parameters > User (default is `postgres`).
            *   **dbPassword**: The password you set when creating the project. If you forgot it, reset it in Settings > Database > Reset Database Password.
            *   **dbPort**: Settings > Database > Connection parameters > Port (default is `5432` or `6543`). Use `5432` for direct connection.
            *   **projectUrl**: Settings > API > Project URL.
            *   **serviceRoleKey**: Settings > API > Project API keys > `service_role` (Reveal it). **Keep this secret!**

    *   **Step 2.2: `firebase-service.json`**
        *   The scripts expect a `firebase-service.json` file in the root.
        *   **Generate this file**:
            1.  Go to the [Firebase Console](https://console.firebase.google.com/).
            2.  **Create a new project** if you haven't done so (or select an existing one).
            3.  Navigate to **Project Settings** (click the gear icon ⚙️ in the top left).
            4.  Go to the **Service accounts** tab.
            5.  Click **Generate new private key**.
            6.  Rename the downloaded file to `firebase-service.json` and place it in your project root.
            **Crucial**: This key must match the project you are importing into.

## 1. Migrate Authentication

*   **Prerequisite: Enable Authentication**
    1.  Go to **Authentication** > **Get started** in the Firebase Console.
    2.  Go to the **Sign-in method** tab.
    3.  Click **Email/Password** and **Enable** it. Assume you have the same Auth provider enabled in Supabase.
    *Why?* The import script creates the user records, but your app won't be able to log them in unless the Email/Password provider is actually enabled.

We will export users from Supabase, preserving their **Bcrypt** password hashes, and import them into Firebase.

### Step 1.1: Export Supabase Users
Supabase uses standard Bcrypt hashing. We must query the `auth.users` table directly to get these hashes.

```bash
node migration_tool/auth/export_supabase_auth.js
```
*Output: `migration_tool/auth/supabase_users.json`*

### Step 1.2: Import to Firebase
Import the users into Firebase Authentication. This script tells Firebase to interpret the hashes as Bcrypt.

```bash
node migration_tool/auth/import_firebase_auth.js
```
*Result: Users are created in Firebase with their same UIDs and passwords.*

## 2. Migrate Database (Firestore)

We will export tables from Supabase and import them into Firestore collections.

### Step 2.1: Export Data
Export data from Supabase tables (e.g., `todos`) to JSON.

```bash
node migration_tool/firestore/export_supabase_data.js
```
*Output: `migration_tool/firestore/todos_export.json`*

### Step 2.2: Import to Firestore

*   **Prerequisite: Create Database**
    Before importing, ensure Firestore is provisioned:
    *   **Option A (CLI - Preferred)**: Run `firebase init firestore` (select your project), then `firebase deploy --only firestore`.
        > [!WARNING]
        > **Do not skip `firebase init`!**
        > Do not attempt to manually create `firebase.json` or `.firebaserc`. The CLI initialization sets up crucial project links and authentication states that are required for the migration scripts to work correctly.

    *   **Option B (Console)**: If CLI fails or you prefer the UI, go to **Firestore Database** > **Create database**. Select a region (e.g., `nam5`) and start in **Production mode**.

Import the JSON data into Firestore.
*   **IDs**: We preserve the Supabase UUIDs as the Firestore Document IDs.
*   **User References**: Since we migrated users with their keys intact, `uid` fields in your data will automatically match the imported users in Firebase! No ID mapping required.

```bash
node migration_tool/firestore/import_firebase_data.js
```

## 3. Update Client Code

Update your frontend application (`index.html`, `app.js`) to use the Firebase SDK instead of Supabase. Replace Supabase client initialization, Auth, and Database calls with Firebase equivalents.

> [!TIP]
> **Automate this with MCP**: If you are using an AI agent with the **Firebase MCP Server**, you can simply ask it to *"fetch my firebase config and update app.js"*. The agent can retrieve your API keys directly from the project and inject them for you, skipping manual console lookups.

## 4. Verify and Secure
1.  **Firebase Console**: Check Authentication users and Firestore data to ensure everything was imported correctly.
2.  **Security Rules**:
    *   The `firestore.rules` file in your project defines your database security.
    *   **Deploy Rules**: Run `firebase deploy --only firestore:rules` to deploy the rules from your local file.
    *   **Example (Secure User Data)**:
        ```javascript
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /todos/{document} {
              // Ensure user_id matches the authenticated user
              allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
              allow read, update, delete: if request.auth != null && resource.data.user_id == request.auth.uid;
            }
          }
        }
        ```
    *   **Important**: Use these rules to ensure users can ONLY access their own data.
    *   **Note**: When using these rules, your client queries **MUST** includes a filter for `user_id`.
        ```javascript
        // App code must match rules:
        const q = query(
            collection(db, "todos"), 
            where("user_id", "==", auth.currentUser.uid)
        );
        ```
3.  **Test Application**:
    *   Launch your app.
    *   **Sign In**: Try logging in with a migrated user (e.g., `test@example.com`) using their *original* password. It should work immediately.
    *   **Check Data**: Verify that their data (e.g., todo items) loads correctly.
