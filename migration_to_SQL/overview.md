# Overview: Supabase to Firebase Data Connect Migration

This guide outlines the architectural and practical differences when migrating from Supabase to Firebase Data Connect.

## Core Comparison

| Feature | Supabase | Firebase Data Connect |
| :--- | :--- | :--- |
| **Database Engine** | PostgreSQL (Direct Access) | PostgreSQL (Cloud SQL, Managed via GraphQL) |
| **API Layer** | Auto-generated REST / Realtime | Generated GraphQL (and generated SDKs) |
| **Schema Management** | SQL DDL / Migrations | GraphQL Schema (`.gql`) -> Auto-generated SQL |
| **Client Access** | `supabase-js` (SQL-like builder) | Generated strongly-typed SDKs (iOS, Android, Web) |
| **Authorization** | PostgreSQL RLS Policies | `@auth` directives in GraphQL Schema (compiled to SQL) |

## Architecture Shift

### From "Client-side SQL" to "Operation-based GraphQL"
In Supabase, you might write queries like this on the client:
```javascript
const { data } = await supabase
  .from('todos')
  .select('*')
  .eq('is_complete', false);
```

In Firebase Data Connect, you define **Operations** (Queries/Mutations) on the server side (in `.gql` files), and the client SDK only calls these named operations:
```graphql
# defined in server/queries.gql
query ListPendingTodos {
  todos(where: { isComplete: { eq: false } }) {
    id
    title
  }
}
```
Client code:
```javascript
// Generated SDK
import { listPendingTodos } from '@firebasegen/todo-app';

const { data } = await listPendingTodos();
```

## Migration Path

1.  **Auth Migration**: Move users from Supabase Auth to Firebase Auth (preserving UIDs).
2.  **Schema Migration**: Convert Supabase SQL tables to Data Connect GraphQL Types.
3.  **Data Migration**: Move valid data from Supabase tables to the new Cloud SQL instance.
4.  **App Migration**: Replace Supabase client calls with Data Connect SDK calls.
