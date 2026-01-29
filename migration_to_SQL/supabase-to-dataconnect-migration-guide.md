# Supabase to Firebase Data Connect Migration Guide

This guide details how to migrate your Users and Data from Supabase to Firebase Data Connect (Cloud SQL).

## Prerequisites

1.  **Firebase Project**: A Firebase project with "Blaze" (Pay-as-you-go) plan (required for Cloud SQL).
2.  **Firebase CLI**: Installed and logged in (`npm install -g firebase-tools`).
3.  **VS Code Extension**: [Firebase Data Connect extension](https://marketplace.visualstudio.com/items?itemName=GoogleCloudTools.firebase-dataconnect-vscode) (Recommended for schema editing).

## 1. Set up Configuration
    
The migration scripts require credential files in your project root.

### 1.1 `supabase-service.json`
We have created a template for you at `supabase-service.json`. Please fill it with your Supabase credentials:

```json
{
  "dbHost": "db.PROJECT_ID.supabase.co",
  "dbUser": "postgres",
  "dbPassword": "YOUR_DB_PASSWORD_HERE",
  "dbPort": 5432,
  "projectUrl": "https://PROJECT_ID.supabase.co",
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

### 1.2 `firebase-service.json`
You need a Service Account key for Firebase Admin SDK.

1.  Go to **Firebase Console > Project Settings > Service accounts**.
2.  Click **Generate new private key**.
3.  Save the file as `firebase-service.json` in the root of this project (`/Users/chliang/SQLMigrationJan28/`).
    *   *Note: Ensure the filename is exactly `firebase-service.json`.*

## 2. Set up Infrastructure (CLI) - Recommended

Use the Firebase CLI to provision your Cloud SQL instance and set up the Data Connect service.

> [!IMPORTANT]
> **Prerequisite**: Your Firebase project **MUST** be on the **Blaze (Pay-as-you-go)** plan to create Cloud SQL instances.
>
> **Tip for Agent Users**: After upgrading to the Blaze plan, please explicitly tell your AI agent your **Project ID** (e.g., `supabase-migration-5976a`) so it can proceed with infrastructure setup.

1.  **Run Init**:
    ```bash
    firebase init dataconnect
    ```
2.  **Follow Prompts**:
    *   **Service ID**: Default is usually fine (e.g., `dataconnect`).
    *   **Region**: Select a region close to your users (e.g., `us-central1`).
    *   **Cloud SQL**: Select **"Create a new instance"**.
    *   **Instance ID**: Choose a name (e.g., `my-db` or `dataconnect-db`).
    *   **Database Version**: PostgreSQL 15 or higher.
    *   **Password**: The CLI might generate one or ask you to set it.
    *   **Wait**: It will take several minutes to provision the instance.

### Alternative: Console Setup
If you prefer the UI or hit issues with the CLI:
1.  Go to **Firebase Console > Build > Data Connect**.
2.  Click **Get Started** and follow the flow to Create a Service and new Cloud SQL instance.

3.  **Deploy Changes**:
    After initialization, deploy your schema and service to the cloud:
    ```bash
    firebase deploy --only dataconnect
    ```
    *   If prompted, select **"Execute all"** to apply the SQL schema migration to your Cloud SQL instance.

4.  **Verify in Console**:
    *   Go to **Firebase Console > Build > Data Connect**.
    *   Open your service (e.g. `todo-service`).
    *   Check the **Schema** tab to ensure your types are visible.
    *   Check the **Data** tab to see the tables created in your database.

> [!TIP]
> **Parallelize Work**: While you wait for the Cloud SQL instance to be provisioned (which might take a few minutes), you can proceed to **Step 2: Migrate Authentication**.

## 2. Migrate Authentication

*   **Prerequisite: Enable Authentication**
    1.  Go to **Authentication** > **Get started** in the Firebase Console.
    2.  Go to the **Sign-in method** tab.
    3.  Click **Email/Password** and **Enable** it. Assume you have the same Auth provider enabled in Supabase.
    *Why?* The import script creates the user records, but your app won't be able to log them in unless the Email/Password provider is actually enabled.

*   **Goal**: Move users from Supabase to Firebase Auth.
*   **Method**: Same as the Firestore migration. We use the `auth_migration.md` guide.
*   **See**: [Auth Migration Guide](./auth_migration.md)

## 3. Migrate Schema

*   **Goal**: Recreate your Supabase tables in Data Connect.
*   **Method**: Define a GraphQL schema that Data Connect uses to provision PostgreSQL.
*   **See**: [Schema Migration Guide](./schema_migration.md)

## 4. Migrate Data

*   **Goal**: Move existing rows from Supabase to the new Data Connect Postgres database.
*   **Method**: Export from Supabase, then use a script to insert via Data Connect mutations (ensuring type safety) OR direct `pg_dump`/`pg_restore` (advanced).
*   **See**: [Data Migration Guide](./data_migration.md)

## 5. Update Client Code

*   **Goal**: Switch from `supabase-js` to generated Data Connect SDKs.
*   **Method**: Ensure your app supports ES Modules (bundled via Webpack, Vite, etc.), generate the SDK, and refactor code to use Firebase Auth + Data Connect.
*   **See**: [Client Migration Guide](./client_migration.md)

### Example Conversion

**Supabase (Old):**
```javascript
const { data } = await supabase.from('todos').select('*');
```

**Data Connect (New):**
1.  Define Query in `queries.gql`:
    ```graphql
    query ListTodos {
      todos {
        id
        title
        isComplete
      }
    }
    ```
2.  Call in App:
    ```javascript
    import { listTodos } from '@todo-app/sdk';
    const { data } = await listTodos();
    ```
