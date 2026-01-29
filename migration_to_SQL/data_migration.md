# Data Migration: Supabase to Data Connect

Migrating data involves exporting rows from Supabase (PostgreSQL) and importing them into your new Data Connect (Cloud SQL) database.

## Method 1: The "Pure SQL" approach (Recommended for Bulk)

Since both are PostgreSQL, you can use standard tools.

### 1. Export from Supabase
Use `pg_dump` to export your data (data only, no schema, as Data Connect manages schema).

```bash
# Get connection string from Supabase settings
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" \
  --data-only \
  --table=<my_table> \
  --column-inserts \
  > supabase_data.sql
```

### 2. Import to Cloud SQL
Connect to your Data Connect Cloud SQL instance and restore.
*Note: You may need to create a Bastion host or use the Cloud SQL Auth Proxy to connect inside a VPC.*

```bash
psql "postgresql://user:pass@localhost:5432/dataconnect" -f supabase_data.sql
```

> [!WARNING]
> **Schema Mismatch Risk**: Data Connect generates table names and column names based on your GraphQL schema. They might NOT match Supabase exactly (e.g., camelCase vs snake_case).
> **Solution**: Inspect the generated Cloud SQL schema first, then edit your `.sql` dump to match the table/column names.

## Method 2: Scripted GraphQL Mutations (Recommended for Safety)

This method ensures your data adheres to your new Data Connect schema validation and handles Foreign Keys correctly.

### 1. Export Data to JSON
Export your Supabase data to JSON files.

**Export Business Data:**
```bash
node SQLMigration/data/export_supabase_data.js
```

**Export Users (Reuse Auth Export):**
```bash
node SQLMigration/auth/export_supabase_auth.js
```

### 2. Import using Data Connect Admin SDK
We use the **Data Connect Admin SDK** to bypass Client Auth for migration scripts.

**Step 2.1: Import Users to Cloud SQL**
Since your tables likely reference users by Foreign Key, users must exist in the SQL `User` table first.
```bash
node SQLMigration/data/import_users_data.js
```

**Step 2.2: Import Business Data**
Then import your data tables, linking them to the correct user.
```bash
node SQLMigration/data/import_firebase_data.js
```

### Sample Script (`import_firebase_data.js`)
```javascript
const { importMyTable, connectorConfig } = require('../../src/dataconnect-admin-generated');
const { getDataConnect } = require('firebase-admin/data-connect');

// Initialize Admin SDK with Service Account...
const dataConnect = getDataConnect(connectorConfig);

async function runImport() {
  const items = require('./supabase_data.json');
  for (const item of items) {
    // Map fields from JSON to Mutation Arguments
    await importMyTable(dataConnect, {
      id: item.id,
      title: item.title,
      // ... match your schema
    });
  }
}
```

