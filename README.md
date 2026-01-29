# Supabase to Firebase Migration Tools

This repository contains tools and documentation for migrating a project from Supabase to Firebase.

This migration toolkit supports two distinct paths depending on your target Firebase database:

### 1. Supabase PostgreSQL -> Firebase Firestore (NoSQL)
*   **Target Product:** [Cloud Firestore](https://firebase.google.com/products/firestore) (NoSQL Document Database).
*   **Best for:** Developers looking to switch to a flexible, scalable NoSQL document store.
*   **Location:** [`migration_to_firestore/`](./migration_to_firestore/)
*   **Guide:** [Read the Firestore Migration Guide](./migration_to_firestore/supabase-to-firebase-migration-guide.md)

### 2. Supabase PostgreSQL -> Firebase Data Connect (PostgreSQL)
*   **Target Product:** [Firebase Data Connect](https://firebase.google.com/products/data-connect) (Relational Database backed by Cloud SQL).
*   **Best for:** Maintaining a relational SQL structure and leveraging GraphQL for type-safe data access.
*   **Location:** [`migration_to_SQL/`](./migration_to_SQL/)
*   **Guide:** [Read the Data Connect Migration Guide](./migration_to_SQL/supabase-to-dataconnect-migration-guide.md)

## Repository Structure

- `migration_to_SQL/`: Tools and guides for migrating to Firebase Data Connect (PostgreSQL).
- `migration_to_firestore/`: Tools and guides for migrating to Firestore (NoSQL).

## Quick Start

1.  **Choose your path** above based on your desired database (NoSQL vs SQL).
2.  **Navigate to the corresponding directory** or open the guide linked above.
3.  **Follow the specific instructions** in that guide to setup your credentials and run the migration scripts.

### Common Prerequisites
-   **Node.js**: Required for running migration scripts.
-   **Supabase Project**: Access to your source project credentials.
-   **Firebase Project**: A target project with the appropriate services (Firestore or Data Connect) enabled.
