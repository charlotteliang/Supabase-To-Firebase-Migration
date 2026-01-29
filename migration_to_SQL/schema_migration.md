# Schema Migration: SQL to Data Connect GraphQL

Supabase uses standard PostgreSQL Data Definition Language (DDL). Firebase Data Connect uses a GraphQL schema to generate the underlying PostgreSQL schema.

## 1. Init Data Connect

Run the following command in your project root to initialize Data Connect:
```bash
firebase init dataconnect
```
- Select your Service ID (e.g., `todo-service`).
- Select your Cloud SQL instance (or create a new one).
- This will create a `dataconnect/` folder with `schema/schema.gql`.

## 2. Mapping Types

Map your Supabase SQL types to Data Connect GraphQL types.

| Supabase SQL | Data Connect GraphQL | Notes |
| :--- | :--- | :--- |
| `uuid` | `UUID` | Built-in scalar |
| `text` / `varchar` | `String` | |
| `boolean` | `Boolean` | |
| `int` | `Int` | |
| `timestamptz` | `Timestamp` | |
| `references table(id)` | `@ref` directive | Used for relationships |

## 3. Example Mapping: `todos` Table

Below is an example of how to map a standard SQL table to Data Connect.

### Supabase SQL (Source)
```sql
create table todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_complete boolean default false,
  created_at timestamptz default now(),
  user_id uuid default auth.uid() references auth.users(id)
);
```

### Data Connect Schema (`schema.gql`) (Target)

In Data Connect, you define Types (`@table`) which generate the underlying SQL.
*Note: You don't manage `auth.users` directly in Data Connect schema usually, but you can reference the `uid`.*

```graphql
# We define a User type if we want to store extra profile data, 
# or we can just store the uid string in Todo.
# For strict foreign key constraints, usually we map the User.

type User @table {
  id: String! @col(name: "uid") # Map to Firebase Auth UID
  email: String
}

type Todo @table {
  id: UUID! @default(expr: "uuid_generate_v4()")
  title: String!
  isComplete: Boolean! @default(value: false)
  createdAt: Timestamp! @default(expr: "now()")
  # Relationship to User
  user: User! @ref
}
```

## 4. Security (RLS vs @auth)

### Supabase RLS
```sql
create policy "Users can view their own todos" on todos
for select using (auth.uid() = user_id);
```

### Data Connect Auth
Use `@auth` directives on the generic Table Access or specific Queries.
*Currently, Data Connect recommends securing access via **Connectors** (Queries/Mutations) with `@auth` directives.*

```graphql
# In `dataconnect/connector/queries.gql`

query ListMyTodos @auth(level: USER) {
  # The WHERE clause simulates the RLS "using" clause
  todos(where: { user: { id: { eq_expr: "auth.uid" } } }) {
    id
    title
    isComplete
  }
}
```
*Note: Data Connect security is evolving. Check the latest docs for Schema-level `@auth` availability.*
